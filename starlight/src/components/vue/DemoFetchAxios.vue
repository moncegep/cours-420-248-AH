<script setup>
import { ref, computed } from 'vue'
import './demo.css'

const cas = [
  { code: 200, libelle: '200 OK' },
  { code: 404, libelle: '404 introuvable' },
  { code: 422, libelle: '422 données invalides' },
  { code: 500, libelle: '500 erreur du serveur' },
  { code: 0, libelle: 'serveur injoignable' },
]
const choix = ref(200)

const resultat = computed(() => {
  const c = choix.value
  if (c === 0) {
    return {
      fetch: ['la promesse est rejetée', "le bloc catch s'exécute avec une TypeError"],
      axios: ['la promesse est rejetée', "le bloc catch s'exécute ; err.response est undefined"],
    }
  }
  if (c === 200) {
    return {
      fetch: ['la promesse est tenue', 'reponse.ok vaut true', 'il faut encore appeler await reponse.json()'],
      axios: ['la promesse est tenue', 'reponse.data contient déjà les données'],
    }
  }
  return {
    fetch: ['la promesse est tenue : aucune erreur levée', `reponse.ok vaut false, reponse.status vaut ${c}`, 'au code de vérifier reponse.ok'],
    axios: ['la promesse est rejetée', "le bloc catch s'exécute", `err.response.status vaut ${c}, err.response.data contient le corps`],
  }
})
</script>

<template>
  <div class="demo not-content">
    <div class="ligne">
      <span>Réponse de l'API :</span>
      <button v-for="c in cas" :key="c.code" :class="{ actif: choix === c.code }" @click="choix = c.code">{{ c.libelle }}</button>
    </div>
    <div class="colonnes">
      <section>
        <p><strong>fetch</strong></p>
        <ul><li v-for="l in resultat.fetch" :key="l">{{ l }}</li></ul>
      </section>
      <section>
        <p><strong>Axios</strong></p>
        <ul><li v-for="l in resultat.axios" :key="l">{{ l }}</li></ul>
      </section>
    </div>
  </div>
</template>

<style scoped>
.colonnes { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; width: 100%; }
@media (max-width: 560px) { .colonnes { grid-template-columns: 1fr; } }
</style>
