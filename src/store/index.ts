import { createStore } from 'vuex';
import { Player, Team, State, TeamResult } from '../types';
import { calculateTeamScore } from '../utils/teamGenerator';

export default createStore<State>({
  state: {
    players: [],
    teams: [] as TeamResult []
  },

  mutations: {
    addPlayer(state, player: Player) {
      state.players = [...state.players, { ...player, id: state.players.length + 1 }];
    },

    createEmptyTeams(state, count: number) {
      state.teams = Array.from({ length: count }, (_, index) => ({
        id: index + 1,
        name: `Team ${index + 1}`,
        players: [] as Player[],
        attributeScores: []
      } as TeamResult));
    },

    addPlayerToTeam(state, { playerId, teamId }) {
      const player = state.players.find(p => p.id === playerId);
      if (player) {
        player.assignedTeamId = teamId;
        const team = state.teams.find(t => t.id === teamId);
        if (team) {
          team.players.push(player);
        }
      }
    },
    
    removePlayerFromTeam(state, playerId) {
      const player = state.players.find(p => p.id === playerId);
      if (player) {
        const team = state.teams.find(t => t.id === player.assignedTeamId);
        if (team) {
          team.players = team.players.filter(p => p.id !== playerId);
        }
        player.assignedTeamId = null;
      }
    },

    reorderPlayers(state, { fromIndex, toIndex }) {
      const [player] = state.players.splice(fromIndex, 1);
      state.players.splice(toIndex, 0, player);
    },

    removeAllPlayers(state) {
      state.players = [];
    },

    updatePlayer(state, updatedPlayer: Player) {
      const index = state.players.findIndex(p => p.id === updatedPlayer.id);
      if (index !== -1) {
        state.players[index] = updatedPlayer;
      }
    },

    setTeams(state, teams: TeamResult[]) {
      state.teams = teams.map((team, index) => ({
        ...team,
        id: index + 1,
        name: `Team ${index + 1}`,
        players: team.players.map(player => ({
          ...player,
          assignedTeamId: index + 1 // Ensure assignedTeamId is set correctly
        })),
        attributeScores: team.attributeScores || []
      }));
    },

    movePlayer(state, { playerId, targetTeamId }) {

      const player = state.players.find(p => p.id.toString() === playerId.toString());

      if (player) {
        if (player.lockedTeamId && player.lockedTeamId !== targetTeamId) {
          return;
        }

        const oldTeamId = player.assignedTeamId;
        player.assignedTeamId = targetTeamId;

        if(oldTeamId === targetTeamId) {
          return;
        }

        state.teams = state.teams.map(team => {
          if (team.id === oldTeamId) {
            return {
              ...team,
              players: team.players.filter(p => p.id.toString() !== playerId.toString())
            };
          }
          if (team.id === targetTeamId) {
            return {
              ...team,
              players: [...team.players, player]
            };
          }
          return team;
        });
      }
    },

    lockPlayer(state, { playerId, targetTeamId }) {

      const player = state.players.find(p => p.id.toString() === playerId.toString());

      if (player) {
        state.teams = state.teams.map(team => {
          if (team.id === targetTeamId) {
            return {
              ...team,
              players: team.players.map(p => {
                if (p.id.toString() === playerId.toString()) {
                  return { ...p, lockedTeamId: targetTeamId };
                }
                return p;
              })
            }
          }
          return team;
        });
      }
    },

    syncPlayerTeamAssignments(state) {
      state.players = state.players.map(player => {
        const teamWithPlayer = state.teams.find(team => 
          team.players.some(p => p.id === player.id)
        );
        const teamPlayer = teamWithPlayer ? teamWithPlayer.players.find(p => p.id === player.id) : null;

        return {
          ...player,
          assignedTeamId: teamWithPlayer ? teamWithPlayer.id : null,
          lockedTeamId: teamPlayer ? teamPlayer.lockedTeamId : null
        };
      });
    },

    syncTeamAttributes(state) {
      state.teams = state.teams.map(team => ({
        ...team,
        attributeScores: calculateTeamScore(team.players)
      }));
    }
  },

  actions: {
    addPlayer({ commit }, player: Player) {
      commit('addPlayer', player);
    },
    createEmptyTeams({ commit }, count: number) {
      commit('createEmptyTeams', count);
      commit('syncPlayerTeamAssignments');
    },
    addPlayerToTeam({ commit }, payload) {
      commit('addPlayerToTeam', payload);
      commit('syncPlayerTeamAssignments');
      commit('syncTeamAttributes');
    },
    removePlayerFromTeam({ commit }, playerId) {
      commit('removePlayerFromTeam', playerId);
      commit('syncPlayerTeamAssignments');
      commit('syncTeamAttributes');
    },
    reorderPlayers({ commit }, { fromIndex, toIndex }) {
      commit('reorderPlayers', { fromIndex, toIndex });
    },
    updatePlayer({ commit }, player: Player) {
      commit('updatePlayer', player);
    },
    setTeams({ commit }, teams: TeamResult[]) {
      commit('setTeams', teams);
      commit('syncPlayerTeamAssignments');
      commit('syncTeamAttributes');
    },
    movePlayer({ commit }, { playerId, targetTeamId }: { playerId: number, targetTeamId: number }) {
      commit('movePlayer', { playerId,  targetTeamId });
      commit('syncPlayerTeamAssignments');
      commit('syncTeamAttributes');
    },
    lockPlayer({ commit }, { playerId, targetTeamId }: { playerId: number, targetTeamId: number }) {
      commit('lockPlayer', { playerId,  targetTeamId });
      commit('syncPlayerTeamAssignments');
      commit('syncTeamAttributes');
    },
    syncPlayerTeamAssignments({ commit }) {
      commit('syncPlayerTeamAssignments');
    },
    syncTeamAttributes({ commit }) {
      commit('syncTeamAttributes');
    },
    removeAllPlayers({ commit }) {
      commit('removeAllPlayers', []);
    }
  },

  getters: {
    getPlayers: (state) => state.players,
    getTeams: (state) => state.teams,
    getUnassignedPlayers: (state) => state.players.filter(p => !p.assignedTeamId)
  }
});