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

function generateTeams(
    players: Player[], 
    maxTeams: number, 
    maxPlayersPerTeam: number, 
    balanceType: string,
    seed: number = Math.random()
): TeamResult[] {
    // Use the seed to initialize random decisions
    const random = () => {
        seed = Math.sin(seed * 10000) * 10000;
        return seed - Math.floor(seed);
    };

    if (balanceType === "Most balanced teams") {
        return simulatedAnnealing(players, maxTeams, maxPlayersPerTeam, 1000, 0.99, random);
    } 
    else if (balanceType === "Balanced but random") {
        return simulatedAnnealing(players, maxTeams, maxPlayersPerTeam, 100, 0.8, random);
    } 
    else {
        // Random assignment
        const teams: Player[][] = Array.from({ length: maxTeams }, () => []);
        let currentTeam = 0;
        [...players]
            .sort(() => random() - 0.5)
            .forEach(player => {
                if (teams[currentTeam].length < maxPlayersPerTeam) {
                    teams[currentTeam].push(player);
                } else {
                    currentTeam = (currentTeam + 1) % maxTeams;
                    teams[currentTeam].push(player);
                }
            });
        return teams.map(team => ({
            players: team.map(player => player.name),
            attributeScores: calculateTeamScore(team)
        }));
    }
}

// Update simulatedAnnealing signature to accept the random function
function simulatedAnnealing(
    players: Player[], 
    maxTeams: number, 
    maxPlayersPerTeam: number, 
    iterations: number,
    coolingRate: number,
    random: () => number
): TeamResult[] {
    let currentSolution: Player[][] = Array.from({ length: maxTeams }, () => []);
    
    // Initial random assignment
    [...players].sort(() => random() - 0.5).forEach((player, index) => {
        const teamIndex = index % maxTeams;
        if (currentSolution[teamIndex].length < maxPlayersPerTeam) {
            currentSolution[teamIndex].push(player);
        }
    });

    let currentVariance = calculateVariance(currentSolution);
    let bestSolution = JSON.parse(JSON.stringify(currentSolution));
    let bestVariance = currentVariance;
    let temperature = 100.0; // Increased initial temperature

    for (let i = 0; i < iterations; i++) {
        // Try multiple swaps per iteration
        for (let j = 0; j < 3; j++) {
            const newSolution = JSON.parse(JSON.stringify(currentSolution));
            
            // Swap two random players between teams
            const team1 = Math.floor(random() * maxTeams);
            const team2 = Math.floor(random() * maxTeams);
            
            if (newSolution[team1].length > 0 && newSolution[team2].length > 0) {
                const player1Index = Math.floor(random() * newSolution[team1].length);
                const player2Index = Math.floor(random() * newSolution[team2].length);
                
                // Swap players between teams
                const player1 = newSolution[team1][player1Index];
                const player2 = newSolution[team2][player2Index];
                
                newSolution[team1][player1Index] = player2;
                newSolution[team2][player2Index] = player1;
                
                const newVariance = calculateVariance(newSolution);
                
                // Modified acceptance probability
                const acceptanceProbability = Math.exp(-Math.abs(newVariance - currentVariance) / temperature);
                
                if (newVariance < bestVariance) {
                    bestSolution = JSON.parse(JSON.stringify(newSolution));
                    bestVariance = newVariance;
                    currentSolution = newSolution;
                    currentVariance = newVariance;
                } else if (random() < acceptanceProbability) {
                    currentSolution = newSolution;
                    currentVariance = newVariance;
                }
            }
        }
        
        temperature *= coolingRate;
    }

    return bestSolution.map((team: Player[]) => ({
        players: team.map((player: Player) => player.name),
        attributeScores: calculateTeamScore(team)
    }));
}

export { generateTeams };