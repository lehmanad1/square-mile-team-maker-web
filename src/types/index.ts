export interface Player {
  id: number;
  name: string;
  attributes: number[];
  selected: boolean;
  assignedTeamId: number | null;
  lockedTeamId: number | null;
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
    id: number;
    name: string;
    players: Player[];
    attributeScores: number[];
}

export interface State {
  players: Player[];
  teams: Team[];
}

export interface TouchState {
  startX: number;
  startY: number;
  startTime: number;
  isDragging: boolean;
  draggedPlayer: Player | null;
  draggedElement: HTMLElement | null;
  sourceComponent: string | null;
  elementX: number;
  elementY: number;
  elementWidth: number;
}