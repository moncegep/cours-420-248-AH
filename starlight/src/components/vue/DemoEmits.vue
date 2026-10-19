<script setup>
import { ref } from 'vue'
import BoutonFavori from './BoutonFavori.vue'
import './demo.css'

const cafes = ['Café Beagel', 'La Planck', 'Café-In']
const favoris = ref([])

function basculer(cafe) {
  if (favoris.value.includes(cafe)) {
    favoris.value = favoris.value.filter((f) => f !== cafe)
  } else {
    favoris.value.push(cafe)
  }
}
</script>

<template>
  <div class="demo not-content">
    <ul>
      <li v-for="cafe in cafes" :key="cafe">
        {{ cafe }}
        <BoutonFavori :actif="favoris.includes(cafe)" @basculer="basculer(cafe)" />
      </li>
    </ul>
    <p class="note">Favoris : {{ favoris.length ? favoris.join(', ') : 'aucun' }}</p>
  </div>
</template>
