<template>
    <div class="container">
      <div class="controls">
        <TeamInput
          :max-teams="maxTeams"
          :max-players-per-team="maxPlayersPerTeam"
          :balance-type="balanceType"
          @update:players="updatePlayerList"
          @update:maxTeams="updateMaxTeams"
          @update:maxPlayersPerTeam="updateMaxPlayersPerTeam"
          @generate-teams="handleGenerateTeams"
          @reset-teams="store.dispatch('createEmptyTeams', maxTeams)"
          @remove-all-players="store.dispatch('removeAllPlayers')"
        />
      </div>

      <div class="results-container">
        <PlayerList class="player-list" />
        <TeamResults 
        class="team-results"
        :teams="store.state.teams" 
        :max-teams="maxTeams"  
        @player-moved="handlePlayerMoved"
        @player-locked="handlePlayerLocked"
        />
      </div>
    </div>
</template>

<script setup lang="ts">
import { useStore } from 'vuex';
import { ref, onMounted, watch } from 'vue';
import TeamResults from './components/TeamResults.vue';
import PlayerList from './components/PlayerList.vue';
import TeamInput from './components/TeamInput.vue';
import { generateTeams as generateTeamUtils } from './utils/teamGenerator';
import { Player, TeamResult } from './types';

const store = useStore();

const maxTeams = ref(5);
const maxPlayersPerTeam = ref(8);
const balanceType = ref('Most balanced teams');
const addPlayer = (playerData: { name: string; attributes: number[] }, index: number) => {
  const player: Player = {
    id: index,
    name: playerData.name,
    attributes: playerData.attributes,
    selected: false,
    assignedTeamId: null,
    lockedTeamId: null,
  };
  store.dispatch('addPlayer', player);
};

const handleGenerateTeams = (balanceType: string) => {
  const teams = generateTeamUtils(
    store.state.players.filter((p: Player) => p.selected),
    maxTeams.value,
    maxPlayersPerTeam.value,
    balanceType
  );
  store.dispatch('setTeams', teams);
};

const updateMaxTeams = (value: number) => {
  maxTeams.value = value;
};

const updateMaxPlayersPerTeam = (value: number) => {
  maxPlayersPerTeam.value = value;
  store.dispatch('createEmptyTeams', maxTeams.value);
};

const updatePlayerList = (players: Array<{ name: string; attributes: number[] }>) => {
  players.forEach((player, index) => addPlayer(player, index));
};

const handlePlayerMoved = ({ playerId, targetTeamId }: { playerId: number, targetTeamId: number }) => {
  store.dispatch('movePlayer', { playerId, targetTeamId });
};

const handlePlayerLocked = ({ playerId, targetTeamId }: { playerId: number, targetTeamId: number }) => {
  store.dispatch('lockPlayer', { playerId, targetTeamId });
};

// Save state to localStorage when it changes
watch(() => store.state, (newState) => {
  localStorage.setItem('appState', JSON.stringify(newState));
}, { deep: true });

// Save settings when they change
watch([maxTeams, maxPlayersPerTeam], ([newMaxTeams, newMaxPlayersPerTeam]) => {
  localStorage.setItem('settings', JSON.stringify({
    maxTeams: newMaxTeams,
    maxPlayersPerTeam: newMaxPlayersPerTeam
  }));
}, { deep: true });

// Load saved state on mount
onMounted(() => {
  const savedSettings = localStorage.getItem('settings');
  if (savedSettings) {
    const settings = JSON.parse(savedSettings);
    maxTeams.value = settings.maxTeams;
    maxPlayersPerTeam.value = settings.maxPlayersPerTeam;
  }
  
  const savedState = localStorage.getItem('appState');
  if (savedState) {
    const state = JSON.parse(savedState);
    store.replaceState(state);
  }
  if(store.state.teams.length === 0) {
    store.dispatch('createEmptyTeams', maxTeams.value);
  }
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 5px;
  padding: 0 10px;
  width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;
}

.container {
  width: 100%;
  margin: 0 auto;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
}

.controls {
  margin-bottom: 15px;
  padding: 0 5px;
}

.add-button .generate-button {
  margin: 10px 0;
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.results-container {
  display: grid;
  grid-template-columns: minmax(120px, 1fr) minmax(200px, 2fr);
  gap: 10px;
  margin-top: 15px;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.player-list, .team-results {
  min-width: 0;
}

@media (min-width: 768px) {
  #app {
    margin-top: 60px;
    padding: 0 20px;
  }

  .container {
    max-width: 1200px;
    padding: 5px;
  }

  .controls {
    margin-bottom: 20px;
    padding: 0;
  }

  .results-container {
    gap: 20px;
    margin-top: 20px;
  }
}
</style>