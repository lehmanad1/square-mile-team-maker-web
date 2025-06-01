export interface Player {
  id: number;
  name: string;
  attributes: number[];
  selected: boolean;
  assignedTeam: number | null;
}

export interface Team {
  id: number;
  players: Player[];
}

export interface TeamGenerationOptions {
    maxTeams: number;
    maxPlayersPerTeam: number;
    balanceType: 'mostBalanced' | 'balancedButRandom' | 'random';
}

export interface TeamResult {
    name: string;
    players: Player[];
    attributeScores: number[];
}

export interface State {
  players: Player[];
  teams: Team[];
}