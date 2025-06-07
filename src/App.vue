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
        <PlayerList 
          class="player-list"
          :touch-state="touchState"
          @touch-start="handleTouchStart"
          @touch-move="handleTouchMove"
          @touch-end="handleTouchEnd"
        />
        <TeamResults 
          class="team-results"
          :teams="store.state.teams" 
          :max-teams="maxTeams"
          :touch-state="touchState"
          @player-moved="handlePlayerMoved"
          @player-locked="handlePlayerLocked"
          @touch-start="handleTouchStart"
          @touch-move="handleTouchMove"
          @touch-end="handleTouchEnd"
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

const touchState = ref({
  startX: 0,
  startY: 0,
  startTime: 0,
  isDragging: false,
  draggedPlayer: null as Player | null,
  draggedElement: null as HTMLElement | null,
  sourceComponent: null as string | null,
  elementX: 0,
  elementY: 0,
  elementWidth: 0
});

const handleTouchStart = (event: TouchEvent, player: Player, element: HTMLElement, source: string) => {
  if (player.lockedTeamId) return;
  
  const touch = event.touches[0];
  const rect = element.getBoundingClientRect();
  
  touchState.value = {
    startX: touch.clientX,
    startY: touch.clientY,
    startTime: Date.now(),
    isDragging: true,
    draggedPlayer: player,
    draggedElement: element,
    sourceComponent: source,
    elementX: rect.left,
    elementY: rect.top,
    elementWidth: rect.width
  };
};

const handleTouchMove = (event: TouchEvent) => {
  if (!touchState.value.draggedPlayer || !touchState.value.draggedElement) return;
  
  const touch = event.touches[0];
  const deltaX = touch.clientX - touchState.value.startX;
  const deltaY = touch.clientY - touchState.value.startY;

  if (touchState.value.isDragging) {
    touchState.value.draggedElement.style.position = 'fixed';
    touchState.value.draggedElement.style.width = `${touchState.value.elementWidth}px`;
    touchState.value.draggedElement.style.zIndex = '1000';
    touchState.value.draggedElement.style.left = `${touchState.value.elementX + deltaX}px`;
    touchState.value.draggedElement.style.top = `${touchState.value.elementY + deltaY}px`;
    event.preventDefault();
  }
};

const handleTouchEnd = (event: TouchEvent) => {
  if (!touchState.value.isDragging || !touchState.value.draggedPlayer){
    console.warn('Touch end without dragging');
    console.log(touchState.value);
    return;
  }

  const touch = event.changedTouches[event.changedTouches.length - 1];
  
  // Temporarily hide dragged element to find element underneath
  const draggedElement = touchState.value.draggedElement as HTMLElement;
  const originalVisibility = draggedElement.style.visibility;
  draggedElement.style.visibility = 'hidden';
  
  const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
  
  // Restore visibility
  draggedElement.style.visibility = originalVisibility;

  // Look for drop zones
  const dropZone = targetElement?.closest('[data-drop-zone]');
  const dropZoneType = dropZone?.getAttribute('data-drop-zone');
  const teamCard = targetElement?.closest('.team-card');

  if (teamCard) {
    const targetTeamId = parseInt(teamCard.getAttribute('data-team-id') || '0');
    console.log('Touch end on team card', targetTeamId, touchState.value.draggedPlayer);
    
    if (targetTeamId) {
      if (touchState.value.sourceComponent === 'playerList') {
        store.dispatch('addPlayerToTeam', {
          playerId: touchState.value.draggedPlayer.id,
          teamId: targetTeamId
        });
      } else if (touchState.value.sourceComponent === 'teamCard') {
        store.dispatch('movePlayer', {
          playerId: touchState.value.draggedPlayer.id,
          targetTeamId
        });
      }
    }
  }
  else if (dropZoneType === 'player-list' && touchState.value.sourceComponent === 'teamCard') {
    store.dispatch('removePlayerFromTeam', touchState.value.draggedPlayer.id);
  }
  else {
    console.warn('No valid drop target found', dropZoneType);
  }

  // Reset element styling
  if (touchState.value.draggedElement) {
    touchState.value.draggedElement.style.position = '';
    touchState.value.draggedElement.style.width = '';
    touchState.value.draggedElement.style.zIndex = '';
    touchState.value.draggedElement.style.left = '';
    touchState.value.draggedElement.style.top = '';
    touchState.value.draggedElement.style.transform = '';
  }
  
  touchState.value = {
    startX: 0,
    startY: 0,
    startTime: 0,
    isDragging: false,
    draggedPlayer: null,
    draggedElement: null,
    sourceComponent: null,
    elementX: 0,
    elementY: 0,
    elementWidth: 0
  };
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
  padding: 0 5px;
  width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;
}

.container {
  width: 100%;
  margin: 0 auto;
  padding: 5px;
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