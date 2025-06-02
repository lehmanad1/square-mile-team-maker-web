<template>
  <div id="app">
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
        />
      </div>

      <div class="results-container">
        <PlayerList class="player-list" />
        <TeamResults :teams="teams" :max-teams="maxTeams" class="team-results" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStore } from 'vuex';
import { ref } from 'vue';
import TeamResults from './components/TeamResults.vue';
import PlayerList from './components/PlayerList.vue';
import TeamInput from './components/TeamInput.vue';
import { generateTeams as generateTeamUtils } from './utils/teamGenerator';
import { Player, TeamResult } from './types';

const store = useStore();

const maxTeams = ref(5);
const maxPlayersPerTeam = ref(8);
const balanceType = ref('Most balanced teams');
const teams = ref<TeamResult[]>([]);

const addPlayer = (playerData: { name: string; attributes: number[] }) => {
  const player: Player = {
    id: Date.now(),
    name: playerData.name,
    attributes: playerData.attributes,
    selected: false,
    assignedTeam: null
  };
  store.dispatch('addPlayer', player);
};

const handleGenerateTeams = (balanceType: string) => {
  teams.value = generateTeamUtils(
    store.state.players.filter((p: Player) => p.selected),
    maxTeams.value,
    maxPlayersPerTeam.value,
    balanceType
  );
};

const updateMaxTeams = (value: number) => {
  maxTeams.value = value;
};

const updateMaxPlayersPerTeam = (value: number) => {
  maxPlayersPerTeam.value = value;
};

const updatePlayerList = (players: Array<{ name: string; attributes: number[] }>) => {
  players.forEach(player => addPlayer(player));
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 20px;
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