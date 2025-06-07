<template>
  <div class="team-card" @dragover.prevent @drop="handleDrop" draggable="false">
    <h3>{{ team?.name }}{{ team?.attributeScores && team?.attributeScores?.length > 0 ? ': '+team?.attributeScores : '' }}</h3>
    <ul class="attributes-list">
      <li v-if="team?.attributeScores && team?.attributeScores?.length > 0" v-for="(attr, attrIndex) in team.attributeScores" :key="attrIndex">
        Attr {{attrIndex + 1}}: {{ attr }}
      </li>
      <li v-else>No attributes yet</li>
    </ul>
    <div class="two-columns">
      <div v-if="team?.players && team?.players?.length > 0" v-for="player in team.players" :key="player.id" :draggable="canDrag(player)" @dragstart="startDrag($event, player)">
        <input type="checkbox" 
          :checked="player?.lockedTeamId !== null"
          @change="(e) => handlePlayerLock(player, e)" />
        {{ player.name }}
      </div>
      <div v-else>No players yet</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { TeamResult, Player } from '../types';

export default defineComponent({
  name: 'TeamCard',
  props: {
    team: {
      type: Object as () => TeamResult | null,
      default: null,
    }
  },
  emits: ['player-moved', 'player-locked'],
  methods: {
    canDrag(player: Player): boolean {
      return player.lockedTeamId === null;
    },
    startDrag(event: DragEvent, player: Player) {
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('source', 'team');
        event.dataTransfer.setData('playerId', player.id.toString());
      }
    },
    handleDrop(event: DragEvent) {
      const playerId = event.dataTransfer?.getData('playerId');

      if (!playerId) return;
      
      this.$emit('player-moved', {
        playerId,
        targetTeamId: this?.team?.id
      });
    },
    handlePlayerLock(player: Player, event: Event) {
      const targetTeamId = ((event.target as HTMLInputElement).checked ? this?.team?.id : null) ?? null;
      player.lockedTeamId = targetTeamId;
      this.$emit('player-locked', {
        playerId: player.id,
        targetTeamId: targetTeamId
      });
    }
  },
});
</script>

<style scoped>

h3 {
    margin: 0;
}

.team-card {
  padding: 10px;
  box-sizing: border-box;
  width: 100%;
  margin: 3px 0;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
  margin: 4px;
  background: white;
}

.attributes-list {
  display: none;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 8px;
  border: 1px solid #eee;
  border-radius: 4px;
  background-color: white;
  margin-bottom: 8px;
  overflow-y: auto;
  max-height: 150px;
}

.attributes-list li {
  width: 100%;
  padding: 4px;
  box-sizing: border-box;
}

.two-columns {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0px;
  padding: 8px;
  border: 1px solid #eee;
  border-radius: 4px;
  background-color: white;
}

.two-columns > div {
  padding: 4px 8px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

@media (min-width: 768px) {
  .attributes-list {
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: center;
    overflow-x: auto;
    overflow-y: hidden;
    max-height: none;
    padding: 12px;
  }

  .attributes-list li {
    width: auto;
    flex: 0 0 auto;
    white-space: nowrap;
  }

  .two-columns {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 5px;
    margin: 1px 0;
  }
}

@media (max-width: 768px) {
  .team-card {
    padding: 8px;
    margin: 2px;
  }
  
  .player-list {
    font-size: 0.9em;
  }
}

.player {
  cursor: grab;
  transition: all 0.3s ease;
  position: relative;
}

.player.moving {
  opacity: 0.5;
  transform: scale(0.95);
}

.player.entering {
  animation: slide-in 0.3s ease forwards;
}

.player.leaving {
  animation: slide-out 0.3s ease forwards;
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-out {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(20px);
  }
}
</style>
