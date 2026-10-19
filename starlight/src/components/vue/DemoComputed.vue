<script setup>
import { ref, computed } from 'vue'
import './demo.css'

const projets = [
  { titre: 'Site de recettes', technos: ['HTML', 'CSS'] },
  { titre: 'Quiz interactif', technos: ['HTML', 'JavaScript'] },
  { titre: 'Catalogue en ligne', technos: ['PHP', 'MySQL'] },
  { titre: 'Météo en direct', technos: ['JavaScript', 'Vue'] },
]
const technos = ['Toutes', 'HTML', 'CSS', 'JavaScript', 'PHP', 'MySQL', 'Vue']

const filtre = ref('Toutes')

const projetsFiltres = computed(() => {
  if (filtre.value === 'Toutes') return projets
  return projets.filter((p) => p.technos.includes(filtre.value))
})
</script>

<template>
  <div class="demo not-content">
    <div class="ligne">
      <button
        v-for="techno in technos"
        :key="techno"
        :class="{ actif: techno === filtre }"
        @click="filtre = techno"
      >
        {{ techno }}
      </button>
    </div>
    <p class="note">{{ projetsFiltres.length }} projet(s)</p>
    <ul>
      <li v-for="projet in projetsFiltres" :key="projet.titre">
        {{ projet.titre }} ({{ projet.technos.join(', ') }})
      </li>
    </ul>
  </div>
</template>
