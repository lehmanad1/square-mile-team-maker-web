<template>
  <div class="team">
    <h3>Team {{ teamIndex + 1 }}</h3>
    <ul class="attributes-list">
      <li v-if="team?.attributeScores" v-for="(attr, attrIndex) in team.attributeScores" :key="attrIndex">
        Attr {{attrIndex + 1}}: {{ attr }}
      </li>
      <li v-else>No attributes yet</li>
    </ul>
    <ul class="two-columns">
      <li v-if="team?.players" v-for="player in team.players" :key="player">{{ player }}</li>
      <li v-else>No players yet</li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { TeamResult } from '../types';

export default defineComponent({
  name: 'TeamCard',
  props: {
    team: {
      type: Object as () => TeamResult | null,
      default: null,
    },
    teamIndex: {
      type: Number,
      required: true,
    },
  },
});
</script>

<style scoped>

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
