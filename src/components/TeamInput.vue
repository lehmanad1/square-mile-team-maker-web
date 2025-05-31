<template>
  <div class="team-input">
    <h2>Team Input</h2>
    <textarea 
      :value="modelValue"
      placeholder="Enter players and attributes (e.g., Player1,10,3,2,4)" 
      rows="10"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    ></textarea>
    
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

      <button @click="generateTeams">Generate Teams</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'TeamInput',
  props: {
    modelValue: {
      type: String,
      required: true,
      default: '',
    },
  },
  emits: {
    'update:modelValue': (value: string) => true,
    'generate-teams': (maxTeams: number, maxPlayers: number, balanceType: string) => true,
  },
  setup(props, { emit }) {
    const maxTeams = ref(2);
    const maxPlayers = ref(5);
    const balanceType = ref('Most balanced teams');

    const generateTeams = () => {
      emit('generate-teams', maxTeams.value, maxPlayers.value, balanceType.value);
    };

    return {
      maxTeams,
      maxPlayers,
      balanceType,
      generateTeams,
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
</style>