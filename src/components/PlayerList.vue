<template>
  <div class="player-list">
    <h2>Added Players</h2>
    <div class="players-container">
      <div v-if="players.length === 0" class="empty-state">
        No players added yet
      </div>
      <ul v-else>
        <li v-for="player in players" :key="player.id" class="player-item">
          <input 
            type="checkbox" 
            v-model="player.selected"
            @change="$emit('update:players', players)"
          />
          <span>{{ player.name }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Player } from '../types';

export default defineComponent({
  name: 'PlayerList',
  props: {
    players: {
      type: Array as () => Player[],
      required: true,
    },
  },
  emits: ['update:players'],
});
</script>

<style scoped>
.player-list {
  border: 2px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  background-color: #f9f9f9;
  height: 100%;
}

.players-container {
  height: calc(100vh - 200px);
  overflow-y: auto;
  padding-right: 8px;
}

.empty-state {
  color: #666;
  text-align: center;
  padding: 20px;
}

ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

li {
  padding: 8px;
  margin: 4px 0;
  background-color: white;
  border: 1px solid #eee;
  border-radius: 4px;
}

.player-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

input[type="checkbox"] {
  margin: 0;
}
</style>
