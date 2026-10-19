<script setup>
import { ref } from 'vue'
import './demo.css'

const competences = ref([
  { id: 1, nom: 'HTML' },
  { id: 2, nom: 'CSS' },
  { id: 3, nom: 'JavaScript' },
])
const suggestions = ['PHP', 'MySQL', 'Git', 'Vue.js']
let prochainId = 4

function ajouter() {
  const nom = suggestions[(prochainId - 4) % suggestions.length]
  competences.value.push({ id: prochainId++, nom })
}

function retirer(id) {
  competences.value = competences.value.filter((c) => c.id !== id)
}
</script>

<template>
  <div class="demo not-content">
    <ul>
      <li v-for="competence in competences" :key="competence.id">
        {{ competence.nom }}
        <button @click="retirer(competence.id)" aria-label="Retirer">×</button>
      </li>
    </ul>
    <p v-if="competences.length === 0" class="note">Aucune compétence pour l'instant.</p>
    <button @click="ajouter">Ajouter une compétence</button>
  </div>
</template>
