import { generateTeams } from './teamGenerator';
import { TeamResult } from '../types';

const testPlayers = [
    'Player1,10,8,6,4',
    'Player2,9,7,5,3',
    'Player3,8,6,4,2',
    'Player4,7,5,3,1',
    'Player5,6,4,2,0',
    'Player6,5,3,1,9',
    'Player7,4,2,0,8',
    'Player8,3,1,9,7',
    'Player9,2,0,8,6',
    'Player10,1,9,7,5'
];

function getPlayerData(teamName: string): number[] {
    const player = testPlayers.find(p => p.startsWith(teamName));
    return player ? player.split(',').slice(1).map(Number) : [];
}

describe('Team Generator', () => {
    test('should respect max teams and players per team limits', () => {
        const maxTeams = 3;
        const maxPlayersPerTeam = 4;
        const result = generateTeams(testPlayers, maxTeams, maxPlayersPerTeam, 'Random');

        expect(result.length).toBeLessThanOrEqual(maxTeams);
        result.forEach(team => {
            expect(team.players.length).toBeLessThanOrEqual(maxPlayersPerTeam);
            expect(team.attributeScores.length).toBe(4); // Expect 4 attributes
        });
    });

    test('should include all players exactly once', () => {
        const result = generateTeams(testPlayers, 2, 5, 'Random');
        const allPlayers = result.flatMap(team => team.players);
        
        expect(allPlayers.length).toBe(testPlayers.length);
        expect(new Set(allPlayers).size).toBe(testPlayers.length);
    });

    test('should generate different results for different balance types', () => {
        const numRuns = 20;
        const balancedResults = new Set();
        const balancedRandomResults = new Set();
        const randomResults = new Set();

        for (let i = 0; i < numRuns; i++) {
            const seed = Math.random();
            balancedResults.add(JSON.stringify(
                generateTeams(testPlayers, 2, 5, 'Most balanced teams', seed)
            ));
            balancedRandomResults.add(JSON.stringify(
                generateTeams(testPlayers, 2, 5, 'Balanced but random', seed)
            ));
            randomResults.add(JSON.stringify(
                generateTeams(testPlayers, 2, 5, 'Random', seed)
            ));
        }

        // With more runs, we expect more variations
        expect(balancedResults.size).toBeGreaterThan(1);
        expect(balancedRandomResults.size).toBeGreaterThan(1);
        expect(randomResults.size).toBeGreaterThan(1);

        // Also verify that different strategies produce different results
        const allResults = new Set([...balancedResults, ...balancedRandomResults, ...randomResults]);
        expect(allResults.size).toBeGreaterThan(numRuns);
    });

    test('should create more balanced teams with "Most balanced teams" option', () => {
        const trials = 5;
        let totalBalancedVariance = 0;
        let totalRandomVariance = 0;

        for (let i = 0; i < trials; i++) {
            const balanced = generateTeams(testPlayers, 2, 5, 'Most balanced teams');
            const random = generateTeams(testPlayers, 2, 5, 'Random');

            // Use attributeScores directly from TeamResult
            const balancedVariance = balanced[0].attributeScores.reduce((acc, score, i) => 
                acc + Math.abs(score - balanced[1].attributeScores[i]), 0);
            const randomVariance = random[0].attributeScores.reduce((acc, score, i) => 
                acc + Math.abs(score - random[1].attributeScores[i]), 0);

            totalBalancedVariance += balancedVariance;
            totalRandomVariance += randomVariance;
        }

        const avgBalancedVariance = totalBalancedVariance / trials;
        const avgRandomVariance = totalRandomVariance / trials;

        expect(avgBalancedVariance).toBeLessThanOrEqual(avgRandomVariance);
    });

    test('should have correct attribute scores for each team', () => {
        const result = generateTeams(testPlayers, 2, 5, 'Most balanced teams');
        
        result.forEach(team => {
            const expectedScores = team.players.reduce((acc, playerName) => {
                const playerScores = getPlayerData(playerName);
                return acc.map((score, i) => score + playerScores[i]);
            }, [0, 0, 0, 0]);
            
            expect(team.attributeScores).toEqual(expectedScores);
        });
    });
});