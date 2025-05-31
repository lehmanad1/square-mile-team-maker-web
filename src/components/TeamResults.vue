<template>
  <div class="team-results">
    <h2>Generated Teams</h2>
    <div v-if="teams.length === 0">No teams generated yet.</div>
    <div v-else class="teams-grid">
      <div v-for="(team, index) in teams" :key="index" class="team">
        <h3>Team {{ index + 1 }}</h3>
        <ul class="attributes-list">
          <li v-for="(attr, attrIndex) in team.attributeScores" :key="attrIndex">
            Attr {{attrIndex + 1}}: {{ attr }}
          </li>
        </ul>
        <ul class="two-columns">
          <li v-for="player in team.players" :key="player">{{ player }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Player, TeamResult } from '../types';

export default defineComponent({
  name: 'TeamResults',
  props: {
    teams: {
      type: Array as () => TeamResult[],
      required: true,
    },
  },
});
</script>

<style scoped>
.team-results {
  margin-top: 20px;
}

.team {
  margin-bottom: 15px;
  border: 2px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  background-color: #f9f9f9;
}

h2 {
  font-size: 24px;
}

h3 {
  margin: 10px 0;
  font-size: 20px;
}

.two-columns {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin: 10px 0;
  padding: 8px;
  border: 1px solid #eee;
  border-radius: 4px;
  background-color: white;
}

.teams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

li {
  padding: 4px 0;
}

.attributes-list {
  display: flex;
  flex-wrap: nowrap;
  gap: 16px;
  overflow-x: auto;
  padding: 12px;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
  justify-content: center;
  border: 1px solid #eee;
  border-radius: 4px;
  background-color: white;
  margin-bottom: 8px;
}

.attributes-list li {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
}
</style>