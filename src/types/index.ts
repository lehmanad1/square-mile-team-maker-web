export interface Player {
    id: string;
    name: string;
    attributes: number[];
    selected: boolean;
}

export interface Team {
    players: Player[];
}

export interface TeamGenerationOptions {
    maxTeams: number;
    maxPlayersPerTeam: number;
    balanceType: 'mostBalanced' | 'balancedButRandom' | 'random';
}

export interface TeamResult {
    players: string[];
    attributeScores: number[];
}