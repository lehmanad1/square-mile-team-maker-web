<template>
  <div id="app">
    <TeamInput v-model="playerData" @generate-teams="generateTeams" />
    <TeamResults :teams="teams" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import TeamInput from './components/TeamInput.vue';
import TeamResults from './components/TeamResults.vue';
import { generateTeams as generateTeamUtils } from './utils/teamGenerator';

export default defineComponent({
  name: 'App',
  components: {
    TeamInput,
    TeamResults,
  },
  setup() {
    const playerData = ref('');
    const teams = ref<string[][]>([]);

    const generateTeams = (maxTeams: number, maxPlayers: number, method: string) => {
      // Convert the player data from textarea into array of strings
      const players = playerData.value
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      if (players.length === 0) {
        alert('Please enter player data');
        return;
      }

      try {
        // Call the team generator utility
        const generatedTeams = generateTeamUtils(
          players,
          maxTeams,
          maxPlayers,
          method
        );
        teams.value = generatedTeams;
        console.log(generatedTeams);
      } catch (error) {
        console.error('Error generating teams:', error);
        alert('Error generating teams. Please check your input format.');
      }
    };

    return {
      playerData,
      teams,
      generateTeams,
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
</style>