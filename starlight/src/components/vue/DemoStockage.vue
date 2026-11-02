<script setup>
import { ref, watch, onMounted } from 'vue'
import './demo.css'

const CLE = 'demo-p16-panier'
const produits = ['Sirop doré', 'Tire sur la neige', "Beurre d'érable"]

const panier = ref([])
const brut = ref('')          // ce que contient réellement le localStorage
const avecJson = ref(true)
const charge = ref(false)
let lecture = false           // vrai pendant une relecture : rien à réécrire

function lireStockage() {
  lecture = true
  try {
    brut.value = localStorage.getItem(CLE) ?? '(rien)'
    panier.value = JSON.parse(localStorage.getItem(CLE)) ?? []
  } catch {
    panier.value = []         // contenu illisible, par exemple « [object Object] »
  }
  lecture = false
}

// Le localStorage n'existe que dans le navigateur : on le lit une fois la démo montée.
onMounted(() => { lireStockage(); charge.value = true })

watch(panier, (valeur) => {
  if (!charge.value || lecture) return
  try {
    localStorage.setItem(CLE, avecJson.value ? JSON.stringify(valeur) : valeur)
    brut.value = localStorage.getItem(CLE)
  } catch { /* stockage indisponible */ }
}, { deep: true, flush: 'sync' })

function ajouter(nom) {
  const ligne = panier.value.find((l) => l.nom === nom)
  if (ligne) ligne.quantite++
  else panier.value.push({ nom, quantite: 1 })
}

function vider() {
  panier.value = []
}
</script>

<template>
  <div class="demo not-content">
    <div class="ligne">
      <button v-for="p in produits" :key="p" @click="ajouter(p)">+ {{ p }}</button>
    </div>
    <ul v-if="panier.length">
      <li v-for="l in panier" :key="l.nom">{{ l.quantite }} × {{ l.nom }}</li>
    </ul>
    <p v-else class="note">Panier vide.</p>
    <p>Dans le localStorage : <code>{{ brut }}</code></p>
    <div class="ligne">
      <button @click="lireStockage">Relire le localStorage</button>
      <button @click="vider">Vider</button>
      <label><input v-model="avecJson" type="checkbox" /> Avec JSON.stringify</label>
    </div>
    <p class="note">Ajoutez des produits, puis rechargez la page du navigateur : le panier revient.</p>
  </div>
</template>
