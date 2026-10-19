<script setup>
import { ref, onMounted } from 'vue'
import './demo.css'

const cafes = ref([])
const chargement = ref(true)
const erreur = ref('')
const simulerErreur = ref(false)

// Simule un appel réseau d'une seconde, réussi ou non
function fausseRequete() {
  return new Promise((resoudre, rejeter) => {
    setTimeout(() => {
      if (simulerErreur.value) rejeter(new Error('réseau indisponible'))
      else resoudre(['Café Beagel', 'La Planck', 'Café-In'])
    }, 1000)
  })
}

async function charger() {
  chargement.value = true
  erreur.value = ''
  try {
    cafes.value = await fausseRequete()
  } catch (e) {
    erreur.value = `Échec du chargement : ${e.message}`
  } finally {
    chargement.value = false
  }
}

onMounted(charger)
</script>

<template>
  <div class="demo not-content">
    <p v-if="chargement" class="note">Chargement…</p>
    <p v-else-if="erreur" class="erreur">{{ erreur }}</p>
    <ul v-else>
      <li v-for="cafe in cafes" :key="cafe">{{ cafe }}</li>
    </ul>

    <div class="ligne">
      <label><input type="checkbox" v-model="simulerErreur" /> Simuler une erreur</label>
      <button @click="charger" :disabled="chargement">Recharger</button>
    </div>
  </div>
</template>

<style scoped>
.erreur { color: #b42318; }
</style>
