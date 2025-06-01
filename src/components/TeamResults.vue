<template>
  <div class="team-results">
    <h2>Generated Teams</h2>
    <div class="teams-grid">
      <TeamCard
        v-for="i in maxTeams"
        :key="i"
        :team="teams[i - 1]"
        :teamIndex="i - 1"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { TeamResult } from '../types';
import TeamCard from './TeamCard.vue';

export default defineComponent({
  name: 'TeamResults',
  components: {
    TeamCard,
  },
  props: {
    teams: {
      type: Array as () => TeamResult[],
      required: true,
    },
    maxTeams: {
      type: Number,
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
  gap: 1px;
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