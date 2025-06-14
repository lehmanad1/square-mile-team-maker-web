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
        <PlayerList :players="playerList" class="player-list" />
        <TeamResults :teams="teams" :max-teams="maxTeams" class="team-results" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import TeamResults from './components/TeamResults.vue';
import PlayerList from './components/PlayerList.vue';
import TeamInput from './components/TeamInput.vue';
import { generateTeams as generateTeamUtils } from './utils/teamGenerator';
import { Player, TeamResult } from './types';

export default defineComponent({
  name: 'App',
  components: {
    TeamResults,
    PlayerList,
    TeamInput,
  },
  setup() {
    const maxTeams = ref(2);
    const maxPlayersPerTeam = ref(5);
    const balanceType = ref('Most balanced teams');
    const playerList = ref<Player[]>([]);
    const teams = ref<TeamResult[]>([]);

    const updatePlayerList = (newPlayers: Player[]) => {
      playerList.value = newPlayers;
    };

    const handleGenerateTeams = ({ players, maxTeams, maxPlayersPerTeam, balanceType }) => {
      teams.value = generateTeamUtils(
        players,
        maxTeams,
        maxPlayersPerTeam,
        balanceType
      );
    };

    const updateMaxTeams = (value: number) => {
      maxTeams.value = value;
    };

    const updateMaxPlayersPerTeam = (value: number) => {
      maxPlayersPerTeam.value = value;
    };

    return {
      maxTeams,
      maxPlayersPerTeam,
      balanceType,
      playerList,
      teams,
      updatePlayerList,
      handleGenerateTeams,
      updateMaxTeams,
      updateMaxPlayersPerTeam,
    };
  },
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  padding: 0 20px;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.controls {
  margin-bottom: 20px;
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
  grid-template-columns: 1fr 2fr;
  gap: 20px;
  margin-top: 20px;
}
</style>