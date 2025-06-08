import { generateTeams, calculateTeamScore, calculateVariance } from './teamGenerator';
import { Player, TeamResult } from '../types';

const createTestPlayer = (playerData: string, index: number): Player => {
    const [name, ...attrs] = playerData.split(',');
    return {
        id: `${index + 1}`,
        name,
        attributes: attrs.map(Number),
        lockedTeamId: null,
        assignedTeam: null
    };
};

const testPlayers: Player[] = [
    'Player1,10,8,6,4',
    'Player2,9,7,5,3',
    'Player3,8,6,4,2',
    'Player4,7,5,3,1'
].map((p, index) => createTestPlayer(p, index));

describe('Team Generator', () => {
    describe('Basic Functionality', () => {
        it('should generate correct number of teams', () => {
            const result = generateTeams(testPlayers, 2, 2, 'Most balanced teams', 123);
            expect(result.length).toBe(2);
        });

        it('should respect max players per team', () => {
            const maxPlayersPerTeam = 2;
            const result = generateTeams(testPlayers, 2, maxPlayersPerTeam, 'Most balanced teams', 123);
            result.forEach(team => {
                expect(team.players.length).toBeLessThanOrEqual(maxPlayersPerTeam);
            });
        });

        it('should assign all players when there is enough capacity', () => {
            const result = generateTeams(testPlayers, 2, 2, 'Most balanced teams', 123);
            const totalPlayers = result.reduce((sum, team) => sum + team.players.length, 0);
            expect(totalPlayers).toBe(testPlayers.length);
        });
    });

    describe('Team Balance', () => {
        it('should create more balanced teams with "Most balanced teams" option', () => {
            const seed = 12345;
            const balanced = generateTeams(testPlayers, 2, 2, 'Most balanced teams', seed);
            const random = generateTeams(testPlayers, 2, 2, 'Not very balanced', seed);

            const balancedVariance = calculateVariance(balanced.map(t => t.players));
            const randomVariance = calculateVariance(random.map(t => t.players));

            expect(balancedVariance).toBeLessThan(randomVariance);
        });

        it('should be deterministic with same seed', () => {
            const seed = 12345;
            const result1 = generateTeams(testPlayers, 2, 2, 'Most balanced teams', seed);
            const result2 = generateTeams(testPlayers, 2, 2, 'Most balanced teams', seed);
            expect(JSON.stringify(result1)).toBe(JSON.stringify(result2));
        });
    });

    describe('Locked Players', () => {
        it('should respect locked team assignments', () => {
            const playersWithLock = testPlayers.map(p => ({...p}));
            playersWithLock[0].lockedTeamId = 1;
            playersWithLock[1].lockedTeamId = 2;

            const result = generateTeams(playersWithLock, 2, 2, 'Most balanced teams', 123);
            
            const team1LockedPlayer = result[0].players.find(p => p.id === '1');
            const team2LockedPlayer = result[1].players.find(p => p.id === '2');
            
            expect(team1LockedPlayer).toBeTruthy();
            expect(team2LockedPlayer).toBeTruthy();
        });
    });

    describe('Team Score Calculations', () => {
        it('should calculate correct team scores', () => {
            const team = [testPlayers[0]]; // Player1: [10,8,6,4]
            const scores = calculateTeamScore(team);
            expect(scores).toEqual([10, 8, 6, 4]);
        });

        it('should calculate correct variance between teams', () => {
            const team1 = [testPlayers[0]]; // Higher scores
            const team2 = [testPlayers[3]]; // Lower scores
            const variance = calculateVariance([team1, team2]);
            expect(variance).toBeGreaterThan(0);
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty player list', () => {
            const result = generateTeams([], 2, 2, 'Most balanced teams', 123);
            expect(result).toHaveLength(0);
        });

        it('should handle single player', () => {
            const result = generateTeams([testPlayers[0]], 2, 2, 'Most balanced teams', 123);
            expect(result).toHaveLength(1);
            expect(result[0].players).toHaveLength(1);
        });

        it('should handle when maxTeams is 1', () => {
            const result = generateTeams(testPlayers, 1, 4, 'Most balanced teams', 123);
            expect(result).toHaveLength(1);
        });
    });
});