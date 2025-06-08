import { Player, TeamResult } from '../types';

function calculateTeamScore(team: Player[]): number[] {
    if (team.length === 0) return [];
    const attributeCount = team[0].attributes.length;
    const scores = new Array(attributeCount).fill(0);
    
    // For each attribute index
    for (let attrIndex = 0; attrIndex < attributeCount; attrIndex++) {
        // Sum that specific attribute across all players
        scores[attrIndex] = team.reduce((sum, player) => 
            sum + player.attributes[attrIndex], 0);
    }
    return scores;
}

function calculateVariance(teams: Player[][]): number {
    if (teams.length === 0) return 0;
    const teamScores = teams.map(calculateTeamScore);
    
    // Calculate average for each attribute across all teams
    const avgScores = Array(teamScores[0].length).fill(0).map((_, attrIndex) => 
        teamScores.reduce((sum, scores) => sum + scores[attrIndex], 0) / teams.length
    );
    
    // Calculate variance for each attribute and sum them
    return teamScores.reduce((totalVariance, scores) => {
        return totalVariance + scores.reduce((attrVariance, score, attrIndex) => 
            attrVariance + Math.pow(score - avgScores[attrIndex], 2), 0);
    }, 0);
}

function findBestSwapCandidates(team1: Player[], team2: Player[]): [number, number] {
    let bestDiff = Infinity;
    let bestBalance = Infinity;
    let bestIndices: [number, number] = [0, 0];

    const team1Total = calculateTeamScore(team1);
    const team2Total = calculateTeamScore(team2);

    team1.forEach((p1, i) => {
        if (p1.lockedTeamId === null) {
            team2.forEach((p2, j) => {
                if (p2.lockedTeamId === null) {
                    // Calculate how this swap would affect team balance
                    const p1Score = p1.attributes.reduce((sum, val) => sum + val, 0);
                    const p2Score = p2.attributes.reduce((sum, val) => sum + val, 0);
                    
                    // Simulate the swap
                    const newTeam1Total = team1Total.map((score, idx) => 
                        score - p1.attributes[idx] + p2.attributes[idx]);
                    const newTeam2Total = team2Total.map((score, idx) => 
                        score - p2.attributes[idx] + p1.attributes[idx]);
                    
                    // Calculate how close this gets us to perfect balance
                    const balance = newTeam1Total.reduce((sum, score, idx) => 
                        sum + Math.abs(score - newTeam2Total[idx]), 0);

                    if (balance < bestBalance) {
                        bestBalance = balance;
                        bestIndices = [i, j];
                    }
                }
            });
        }
    });

    return bestIndices;
}

function generateTeams(
    players: Player[], 
    maxTeams: number, 
    maxPlayersPerTeam: number, 
    balanceType: string,
    seed: number = Math.random()
): TeamResult[] {
    const random = () => {
        seed = Math.sin(seed * 10000) * 10000;
        return seed - Math.floor(seed);
    };

    // Initialize teams with locked players
    const teams: Player[][] = Array.from({ length: maxTeams }, () => []);
    const unassignedPlayers: Player[] = [];

    // Pre-assign locked players
    players.forEach(player => {
        if (player.lockedTeamId && player.lockedTeamId <= maxTeams) {
            const teamIndex = player.lockedTeamId - 1;
            if (teams[teamIndex].length < maxPlayersPerTeam) {
                teams[teamIndex].push({...player});
            } else {
                unassignedPlayers.push(player);
            }
        } else {
            unassignedPlayers.push(player);
        }
    });

    // Shuffle unassigned players
    const shuffledUnassigned = [...unassignedPlayers].sort(() => random() - 0.5);

    if (balanceType === "Most balanced teams") {
        return simulatedAnnealing(teams, shuffledUnassigned, maxTeams, maxPlayersPerTeam, 10000, 0.995, 0.01, random);
    } 
    else if (balanceType === "Balanced but random") {
        console.log("Using balanced but random strategy");
        return simulatedAnnealing(teams, shuffledUnassigned, maxTeams, maxPlayersPerTeam, 100, 0.35, 10.0, random);
    } 
    else if (balanceType === "Not very balanced"){
        return simulatedAnnealing(teams, shuffledUnassigned, maxTeams, maxPlayersPerTeam, 5, 0.1, 10.0, random);

    }
    else {
        // Calculate minimum players per team and extras
        const totalPlayers = shuffledUnassigned.length + teams.reduce((sum, team) => sum + team.length, 0);
        const minPlayersPerTeam = Math.floor(totalPlayers / maxTeams);
        const extraPlayers = totalPlayers % maxTeams;

        // Distribute remaining players randomly while maintaining balance
        shuffledUnassigned.forEach(player => {
            const eligibleTeams = teams
                .map((team, index) => ({ 
                    index, 
                    size: team.length,
                    targetSize: Math.min(
                        maxPlayersPerTeam,
                        minPlayersPerTeam + (index < extraPlayers ? 1 : 0)
                    )
                }))
                .filter(t => t.size < t.targetSize);

            if (eligibleTeams.length > 0) {
                const randomTeam = eligibleTeams[Math.floor(random() * eligibleTeams.length)];
                teams[randomTeam.index].push(player);
            }
        });

        return teams.map((team, index) => ({
            id: index + 1,
            name: `Team ${index + 1}`,
            players: team.map(x => ({ ...x, assignedTeam: index + 1 })),
            attributeScores: calculateTeamScore(team)
        }));
    }
}

function simulatedAnnealing(
    initialTeams: Player[][],
    unassignedPlayers: Player[],
    maxTeams: number,
    maxPlayersPerTeam: number,
    iterations: number,
    coolingRate: number,
    varianceThreshold: number,
    random: () => number
): TeamResult[] {
    // Initialize solution with existing teams
    let currentSolution = initialTeams.map(team => [...team]);
    
    // Calculate minimum players per team and extras
    const totalPlayers = unassignedPlayers.length + currentSolution.reduce((sum, team) => sum + team.length, 0);
    const minPlayersPerTeam = Math.floor(totalPlayers / maxTeams);
    const extraPlayers = totalPlayers % maxTeams;

    // Add unassigned players to teams evenly
    unassignedPlayers.forEach(player => {
        // Find teams eligible for another player
        const eligibleTeams = currentSolution
            .map((team, index) => ({ 
                index, 
                size: team.length,
                targetSize: minPlayersPerTeam + (index < extraPlayers ? 1 : 0)
            }))
            .filter(t => t.size < t.targetSize && t.size < maxPlayersPerTeam);

        if (eligibleTeams.length > 0) {
            const randomTeam = eligibleTeams[Math.floor(random() * eligibleTeams.length)];
            currentSolution[randomTeam.index].push(player);
        }
    });

    let currentVariance = calculateVariance(currentSolution);
    let bestSolution = deepCopyTeams(currentSolution);
    let bestVariance = currentVariance;
    let temperature = 100.0;

    for (let i = 0; i < iterations; i++) {
        if (bestVariance < varianceThreshold) {
            break;
        }
        for (let j = 0; j < 3; j++) {
            const newSolution = [ ...currentSolution];
            
            // Find teams with unlocked players
            const teamsWithUnlockedPlayers = newSolution
                .map((team, index) => ({
                    index,
                    unlockedPlayers: team.filter(p => p?.lockedTeamId === null)
                }))
                .filter(t => t.unlockedPlayers.length > 0);
            
            if (teamsWithUnlockedPlayers.length >= 2) {
                // Select two random teams with unlocked players
                const chosenTeams = [];
                chosenTeams.push(teamsWithUnlockedPlayers[Math.floor(random() * teamsWithUnlockedPlayers.length)]);
                let team2: { index: number, unlockedPlayers: Player[] };
                do{
                    team2 = teamsWithUnlockedPlayers[Math.floor(random() * teamsWithUnlockedPlayers.length)];
                }while(chosenTeams[0].index === team2.index);
                chosenTeams.push(team2);

                // Swap random unlocked players
                const playerIndexes = findBestSwapCandidates(chosenTeams[0].unlockedPlayers, chosenTeams[1].unlockedPlayers);

                const temp = newSolution[chosenTeams[0].index][playerIndexes[0]];
                newSolution[chosenTeams[0].index][playerIndexes[0]] = newSolution[chosenTeams[1].index][playerIndexes[1]];
                newSolution[chosenTeams[1].index][playerIndexes[1]] = temp;
                
                const newVariance = calculateVariance(newSolution);
                const acceptanceProbability = Math.exp(-Math.abs(newVariance - currentVariance) / (temperature * Math.max(currentVariance, 1)));

                if (newVariance < bestVariance) {
                    bestSolution = [...newSolution];
                    bestVariance = newVariance;
                    currentSolution = deepCopyTeams(newSolution);
                    currentVariance = newVariance;
                } else if (random() < acceptanceProbability) {
                    currentSolution = deepCopyTeams(newSolution);
                    currentVariance = newVariance;
                }
            }
        }
        temperature *= coolingRate;
    }
    const bestSolutionVariance = calculateVariance(bestSolution);
    console.log('Best variance after simulated annealing:', bestSolutionVariance);
    const finalTeams = bestSolution.map((team, index) => ({
        id: index + 1,
        name: `Team ${index + 1}`,
        players: team.map(x => ({ ...x, assignedTeam: index + 1 })),
        attributeScores: calculateTeamScore(team)
    }));

    const finalVariance = calculateVariance(finalTeams.map(t => t.players));
    return finalTeams;
}

function deepCopyTeams(teams: Player[][]): Player[][] {
    return teams.map(team => 
        team.map(player => ({
            ...player,
            attributes: [...player.attributes]  // Ensure attributes array is also copied
        }))
    );
}

export { generateTeams, calculateTeamScore, calculateVariance };