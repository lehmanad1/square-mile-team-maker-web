<template>
  <div class="player-list">
    <h2>Added Players</h2>
    <div class="player-container" 
         @dragover.prevent 
         @drop="handleDrop">
      <div v-for="(player, index) in players" 
           :key="player.id" 
           :class="['player-item', { 'player-assigned': player.assignedTeam !== null }]"
           :draggable="!player.assignedTeam"
           :data-index="index"
           @dragstart="startDrag($event, player, index)"
           @dragenter.prevent="onDragEnter($event)"
           @dragover.prevent>
        <input type="checkbox" 
               v-model="player.selected"
               :disabled="player.assignedTeam !== null"
               @change="$emit('update:players', players)" />
        <span :class="{ 'text-disabled': player.assignedTeam !== null }">
          {{ player.name }} ({{ player.attributes.join(', ') }})
        </span>
      </div>
      <div class="drop-indicator" ref="dropIndicator"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import { Player } from '../types';

const store = useStore();
const players = computed(() => store.state.players);
const dropIndicator = ref<HTMLElement | null>(null);
let dragIndex = -1;

const startDrag = (event: DragEvent, player: Player, index: number) => {
  if (player.assignedTeam) return;
  dragIndex = index;
  
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('playerId', player.id.toString());
    event.dataTransfer.setData('source', 'playerList');
    event.dataTransfer.setData('sourceIndex', index.toString());
  }
};

const onDragEnter = (event: DragEvent) => {
  const target = event.target as HTMLElement;
  const targetIndex = parseInt(target.dataset.index || '-1');
  
  if (targetIndex !== -1 && dragIndex !== targetIndex) {
    const rect = target.getBoundingClientRect();
    const middleY = rect.top + rect.height / 2;
    const isBelow = event.clientY > middleY;
    
    if (dropIndicator.value) {
      dropIndicator.value.style.top = `${isBelow ? rect.bottom : rect.top}px`;
      dropIndicator.value.style.display = 'block';
    }
  }
};

const handleDrop = (event: DragEvent) => {
  const source = event.dataTransfer?.getData('source');
  
  if (source === 'playerList') {
    const fromIndex = parseInt(event.dataTransfer?.getData('sourceIndex') || '-1');
    const target = event.target as HTMLElement;
    const toIndex = parseInt(target.dataset.index || '-1');
    
    if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
      store.dispatch('reorderPlayers', { fromIndex, toIndex });
    }
  } else if (source === 'team') {
    const playerId = event.dataTransfer?.getData('playerId');
    store.dispatch('removePlayerFromTeam', playerId);
  }
  
  if (dropIndicator.value) {
    dropIndicator.value.style.display = 'none';
  }
};
</script>

<style scoped>
.player-list {
  border: 2px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  background-color: #f9f9f9;
  height: 100%;
}

.player-container {
  min-height: 50px;
  height: calc(100vh - 200px);
  overflow-y: auto;
  padding-right: 8px;
  padding: 8px;
  border: 1px dashed #ccc;
  position: relative;
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
  cursor: grab;
  padding: 8px;
  margin: 4px;
  border: 1px solid #ddd;
  border-radius: 4px;
  transition: all 0.3s ease;
  position: relative;
}

.player-assigned {
  background-color: #e0e0e0;
  cursor: not-allowed;
  opacity: 0.7;
}

.text-disabled {
  color: #888;
}

input[type="checkbox"] {
  margin: 0;
}

input[type="checkbox"]:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.drop-indicator {
  position: absolute;
  width: 100%;
  height: 2px;
  background-color: #4CAF50;
  display: none;
  pointer-events: none;
}

.player-item.dragging {
  opacity: 0.5;
}

.player-item.moving {
  opacity: 0.5;
  transform: scale(0.95);
}

.player-item.entering {
  animation: slide-in 0.3s ease forwards;
}

.player-item.leaving {
  animation: slide-out 0.3s ease forwards;
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slide-out {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(20px);
  }
}
</style>
