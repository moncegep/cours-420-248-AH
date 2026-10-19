<script setup>
import { ref } from 'vue'
import './demo.css'

const disponible = ref(true)
const details = ref(false)
</script>

<template>
  <div class="demo not-content">
    <p v-if="disponible" class="oui">Disponible pour un stage cet été</p>
    <p v-else class="non">Stage déjà trouvé, merci !</p>

    <p v-show="details" class="note">Stage de huit semaines, à partir de mai, en développement web.</p>

    <div class="ligne">
      <button @click="disponible = !disponible">Changer la disponibilité</button>
      <button @click="details = !details">{{ details ? 'Masquer' : 'Afficher' }} les détails</button>
    </div>
  </div>
</template>

<style scoped>
.oui { color: #067647; font-weight: 600; }
.non { color: #b42318; font-weight: 600; }
</style>
