import { generateTeams } from './teamGenerator';
import { Player, TeamResult } from '../types';

const createTestPlayer = (playerData: string): Player => {
    const [name, ...attrs] = playerData.split(',');
    return {
        id: `test-${name}`,
        name,
        attributes: attrs.map(Number),
        selected: true,
    };
};

const testPlayers: Player[] = [
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
].map(createTestPlayer);

describe('Team Generator', () => {
    test('should respect max teams and players per team limits', () => {
        const maxTeams = 3;
        const maxPlayersPerTeam = 4;
        const result = generateTeams(testPlayers, maxTeams, maxPlayersPerTeam, 'Random');

        expect(result.length).toBeLessThanOrEqual(maxTeams);
        result.forEach((team: TeamResult) => {
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

    test('should only include selected players', () => {
        const selectedPlayers = [...testPlayers];
        selectedPlayers[0].selected = false;
        selectedPlayers[1].selected = false;
        
        const result = generateTeams(
            selectedPlayers.filter(p => p.selected),
            2,
            5,
            'Random'
        );

        const allPlayers = result.flatMap(team => team.players);
        expect(allPlayers).not.toContain(selectedPlayers[0].name);
        expect(allPlayers).not.toContain(selectedPlayers[1].name);
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

        expect(balancedResults.size).toBeGreaterThan(1);
        expect(balancedRandomResults.size).toBeGreaterThan(1);
        expect(randomResults.size).toBeGreaterThan(1);
    });

    test('should create more balanced teams with "Most balanced teams" option', () => {
        const trials = 5;
        let totalBalancedVariance = 0;
        let totalRandomVariance = 0;

        for (let i = 0; i < trials; i++) {
            const balanced = generateTeams(testPlayers, 2, 5, 'Most balanced teams');
            const random = generateTeams(testPlayers, 2, 5, 'Random');

            // Calculate variance using attributeScores directly
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
});