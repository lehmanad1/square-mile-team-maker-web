<template>
  <div class="team-input">
    <h2>Team Generation Settings</h2>
    <div class="controls">
      <label for="maxTeams">Max Teams:</label>
      <input type="number" v-model.number="maxTeams" id="maxTeams" min="1" />

      <label for="maxPlayers">Max Players per Team:</label>
      <input type="number" v-model.number="maxPlayers" id="maxPlayers" min="1" />

      <label for="teamBalance">Team Balance Type:</label>
      <select v-model="balanceType" id="teamBalance">
        <option value="Most balanced teams">Most balanced teams</option>
        <option value="Balanced but random">Balanced but random</option>
        <option value="Random">Random</option>
      </select>
    </div>

    <textarea
      v-model="localPlayerInput"
      placeholder="Enter player names and attributes, one per line..."
      rows="5"
    ></textarea>
    <div class="button-group">
      <button @click="addPlayers" class="add-button">Add Players</button>
      <button
        @click="handleGenerateTeams"
        :disabled="!canGenerateTeams"
        class="generate-button"
      >
        Generate Teams
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue';
import { Player } from '../types';

export default defineComponent({
  name: 'TeamInput',
  props: {
    modelValue: {
      type: String,
      required: true,
      default: '',
    },
    maxTeams: { type: Number, required: true },
    maxPlayersPerTeam: { type: Number, required: true },
    balanceType: { type: String, required: true },
  },
  emits: {
    'update:modelValue': (value: string) => true,
    'generate-teams': (payload: {
      players: Player[];
      maxTeams: number;
      maxPlayersPerTeam: number;
      balanceType: string;
    }) => true,
    'update:players': (players: Player[]) => true,
    'update:maxTeams': (value: number) => true,
    'update:maxPlayersPerTeam': (value: number) => true,
  },
  setup(props, { emit }) {
    const maxTeams = ref(props.maxTeams);
    const maxPlayers = ref(props.maxPlayersPerTeam);
    const balanceType = ref('Most balanced teams');
    const localPlayerInput = ref('');
    const playerList = ref<Player[]>([]);

    watch(maxTeams, (newValue) => {
      emit('update:maxTeams', newValue);
    });

    watch(maxPlayers, (newValue) => {
      emit('update:maxPlayersPerTeam', newValue);
    });

    const canGenerateTeams = computed(() => playerList.value.length > 0);

    const addPlayers = () => {
      const newPlayers = localPlayerInput.value
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
          const [name, ...attrs] = line.trim().split(',');
          return {
            id: crypto.randomUUID(),
            name,
            attributes: attrs.map(Number),
            selected: true,
          };
        });
      playerList.value.push(...newPlayers);
      localPlayerInput.value = '';
      emit('update:players', playerList.value);
    };

    const handleGenerateTeams = () => {
      const selectedPlayers = playerList.value.filter(p => p.selected);
      emit('generate-teams', {
        players: selectedPlayers,
        maxTeams: maxTeams.value,
        maxPlayersPerTeam: maxPlayers.value,
        balanceType: props.balanceType,
      });
    };

    return {
      maxTeams,
      maxPlayers,
      balanceType,
      localPlayerInput,
      addPlayers,
      handleGenerateTeams,
      canGenerateTeams,
    };
  },
});
</script>

<style scoped>
.team-input {
  margin: 20px;
  text-align: left;
}

textarea {
  width: 100%;
  margin-bottom: 20px;
  padding: 10px;
}

.controls {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 10px;
  align-items: center;
  max-width: 500px;
  margin: 0 auto;
}

label {
  font-weight: bold;
}

button {
  grid-column: 1 / -1;
  padding: 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}

input[type="number"],
select {
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.button-group {
  display: flex;
  gap: 10px;
  margin: 10px 0;
}

.add-button, .generate-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.add-button {
  background-color: #4CAF50;
  color: white;
}

.add-button:hover {
  background-color: #45a049;
}

.generate-button {
  background-color: #4CAF50;
  color: white;
}

.generate-button:hover {
  background-color: #45a049;
}

.generate-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>