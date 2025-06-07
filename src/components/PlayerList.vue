<template>
  <div class="player-list">
    <h2>All Players</h2>
    <div class="player-container drop-zone" 
         data-drop-zone="player-list"
         @dragover.prevent 
         @drop="handleDrop">
      <div class="select-all-container">
        <input type="checkbox" 
               :checked="allSelectablePlayersSelected"
               @change="toggleSelectAll" />
        <span>Select All</span>
      </div>
      <div v-for="(player, index) in players">
        <div v-if="!player.assignedTeamId" class="empty-state"
            :key="player.id"
            :class="['player-item', { 'player-assigned': player.assignedTeamId !== null }]"
            :draggable="!player.assignedTeamId"
            :data-index="index"
            :data-player-id="player.id"
            @dragstart="startDrag($event, player, index)"
            @dragenter.prevent="onDragEnter($event)"
            @dragover.prevent
            @touchstart="(e) => $emit('touch-start', e, player, e.target, 'playerList')"
            @touchmove="(e) => $emit('touch-move', e)"
            @touchend="(e) => $emit('touch-end', e)">
          <input type="checkbox" 
                v-model="player.selected"
                :disabled="player.assignedTeamId !== null"
                @change="(e) => handlePlayerSelection(player, e)" />
          <span :class="['overflow-text-field', { 'text-disabled': player.assignedTeamId !== null }]">
            {{ player.name }}
          </span>
        </div>
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

defineProps({
  touchState: {
    type: Object,
    required: true
  }
});

defineEmits(['touch-start', 'touch-move', 'touch-end']);

const startDrag = (event: DragEvent, player: Player, index: number) => {
  if (player.assignedTeamId) return;
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
  console.log('Drop source:', source);
  if (source === 'playerList') {
    const fromIndex = parseInt(event.dataTransfer?.getData('sourceIndex') || '-1');
    const target = event.target as HTMLElement;
    const toIndex = parseInt(target.dataset.index || '-1');
    
    if (fromIndex !== -1 && toIndex !== -1 && fromIndex !== toIndex) {
      store.dispatch('reorderPlayers', { fromIndex, toIndex });
    }
  } else {
    const playerId = parseInt(event.dataTransfer?.getData('playerId') ?? '-1');
    store.dispatch('movePlayer', { playerId: playerId, targetTeamId: null } as { playerId: number, targetTeamId: number | null});
  }
  
  if (dropIndicator.value) {
    dropIndicator.value.style.display = 'none';
  }
};

const handlePlayerSelection = (player: Player, event: Event) => {
  const isChecked = (event.target as HTMLInputElement).checked;
  var updatedPlayer: Player = { ...player, selected: isChecked };
  store.dispatch('updatePlayer', { updatedPlayer });
};

const allSelectablePlayersSelected = computed(() => {
  const selectablePlayers = players.value.filter(p => !p.assignedTeamId);
  return selectablePlayers.length > 0 && selectablePlayers.every(p => p.selected);
});

const toggleSelectAll = (event: Event) => {
  const isChecked = (event.target as HTMLInputElement).checked;
  (players.value as Player[])
    .filter(p => !p.assignedTeamId)
    .forEach(player => {
      store.dispatch('updatePlayer', { ...player, selected: isChecked });
    });
};
</script>

<style scoped>
.player-list {
  border: 2px solid #ddd;
  border-radius: 8px;
  padding: 0px;
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
  box-sizing: border-box;
  touch-action: pan-y pinch-zoom;
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
  padding: 5px 0px;
  margin: 0px;
  border: 1px solid #ddd;
  border-radius: 4px;
  transition: all 0.3s ease;
  position: relative;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
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

.overflow-text-field {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-item.leaving {
  animation: slide-out 0.3s ease forwards;
}

h2 {
  font-size: 24px;
  padding-left: 10px;
}

.select-all-container {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  margin-bottom: 8px;
  border-bottom: 1px solid #ddd;
}

.drop-zone {
  position: relative;
}

.drop-zone::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  pointer-events: none;
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
