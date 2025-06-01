<template>
  <div class="team-card" @dragover.prevent @drop="handleDrop">
    <h3>{{ team?.name }}</h3>
    <ul class="attributes-list">
      <li v-if="team?.attributeScores" v-for="(attr, attrIndex) in team.attributeScores" :key="attrIndex">
        Attr {{attrIndex + 1}}: {{ attr }}
      </li>
      <li v-else>No attributes yet</li>
    </ul>
    <div class="two-columns">
      <div v-if="team?.players" v-for="player in team.players" :key="player.id" draggable="true" @dragstart="startDrag($event, player)">test: {{ player }}</div>
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
    },
    teamIndex: {
      type: Number,
      required: true,
    },
  },
  emits: ['player-moved'],
  methods: {
    startDrag(event: DragEvent, player: Player) {
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('player', player.name);
        event.dataTransfer.setData('sourceTeam', this?.team?.name ?? '');
        event.dataTransfer.setData('source', 'team');
      }
    },
    handleDrop(event: DragEvent) {
      const player = event.dataTransfer?.getData('player');
      const source = event.dataTransfer?.getData('source');
      const sourceTeam = event.dataTransfer?.getData('sourceTeam');

      if (!player) return;

      this.$emit('player-moved', {
        player,
        source,
        sourceTeam,
        targetTeam: this?.team?.name
      });
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
