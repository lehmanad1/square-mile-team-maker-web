import { createStore } from 'vuex';
import { Player, Team, State } from '../types';

export default createStore<State>({
  state: {
    players: [],
    teams: []
  },

  mutations: {
    addPlayer(state, player: Player) {
      state.players = [...state.players, player];
    },

    createTeams(state, count: number) {
      state.teams = Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        players: []
      }));
    },

    addPlayerToTeam(state, { playerId, teamId }) {
      const player = state.players.find(p => p.id === playerId);
      if (player) {
        player.assignedTeam = teamId;
        const team = state.teams.find(t => t.id === teamId);
        if (team) {
          team.players.push(player);
        }
      }
    },
    
    removePlayerFromTeam(state, playerId) {
      const player = state.players.find(p => p.id === playerId);
      if (player) {
        const team = state.teams.find(t => t.id === player.assignedTeam);
        if (team) {
          team.players = team.players.filter(p => p.id !== playerId);
        }
        player.assignedTeam = null;
      }
    },

    reorderPlayers(state, { fromIndex, toIndex }) {
      const [player] = state.players.splice(fromIndex, 1);
      state.players.splice(toIndex, 0, player);
    }
  },

  actions: {
    addPlayer({ commit }, player: Player) {
      commit('addPlayer', player);
    },
    createTeams({ commit }, count: number) {
      commit('createTeams', count);
    },
    addPlayerToTeam({ commit }, payload) {
      commit('addPlayerToTeam', payload);
    },
    removePlayerFromTeam({ commit }, playerId) {
      commit('removePlayerFromTeam', playerId);
    },
    reorderPlayers({ commit }, { fromIndex, toIndex }) {
      commit('reorderPlayers', { fromIndex, toIndex });
    }
  },

  getters: {
    getPlayers: (state) => state.players,
    getTeams: (state) => state.teams,
    getUnassignedPlayers: (state) => state.players.filter(p => !p.assignedTeam)
  }
});