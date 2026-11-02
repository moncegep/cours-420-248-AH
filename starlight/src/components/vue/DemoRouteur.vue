<script setup>
import { ref, computed } from 'vue'
import './demo.css'

// Une table de routes miniature : une adresse, un composant
const routes = [
  { path: '/produits', composant: 'ListeProduits' },
  { path: '/produits/:id', composant: 'FicheProduit' },
  { path: '/panier', composant: 'PagePanier' },
]

const adresse = ref('/produits')
const historique = ref(['/produits'])

// Trouve la première route dont le motif correspond à l'adresse
const correspondance = computed(() => {
  for (const route of routes) {
    const motif = new RegExp('^' + route.path.replace(/:(\w+)/g, '(?<$1>[^/]+)') + '$')
    const resultat = adresse.value.match(motif)
    if (resultat) return { route, params: { ...resultat.groups } }
  }
  return { route: { path: '/:cheminInconnu(.*)*', composant: 'PageIntrouvable' }, params: {} }
})

function aller(chemin) {
  if (chemin === adresse.value) return
  historique.value.push(chemin)
  adresse.value = chemin
}

function precedent() {
  if (historique.value.length < 2) return
  historique.value.pop()
  adresse.value = historique.value.at(-1)
}

const saisie = ref('')
function saisir() {
  const chemin = saisie.value.trim()
  if (chemin.startsWith('/')) aller(chemin)
  saisie.value = ''
}
</script>

<template>
  <div class="demo not-content">
    <div class="ligne barre">
      <button :disabled="historique.length < 2" @click="precedent" aria-label="Précédent">←</button>
      <code class="adresse">localhost:5173{{ adresse }}</code>
    </div>
    <div class="ligne">
      <span class="note">Liens :</span>
      <button :class="{ actif: adresse === '/produits' }" @click="aller('/produits')">Catalogue</button>
      <button :class="{ actif: adresse === '/produits/2' }" @click="aller('/produits/2')">Produit 2</button>
      <button :class="{ actif: adresse === '/produits/5' }" @click="aller('/produits/5')">Produit 5</button>
      <button :class="{ actif: adresse === '/panier' }" @click="aller('/panier')">Panier</button>
    </div>
    <form class="ligne" @submit.prevent="saisir">
      <input v-model="saisie" type="text" placeholder="/une/autre/adresse" />
      <button type="submit">Aller</button>
    </form>
    <div class="vue">
      <p>Route : <code>{{ correspondance.route.path }}</code></p>
      <p>Composant affiché dans <code>&lt;RouterView&gt;</code> : <strong>{{ correspondance.route.composant }}</strong></p>
      <p>Paramètres : <code>{{ JSON.stringify(correspondance.params) }}</code></p>
    </div>
  </div>
</template>

<style scoped>
.barre { width: 100%; }
.adresse { flex: 1; padding: 4px 8px; border-radius: 7px; border: 1px solid var(--sl-color-gray-5, #c9ced8); }
.vue { width: 100%; border-top: 1px dashed var(--sl-color-gray-5, #c9ced8); padding-top: 8px; display: grid; gap: 2px; }
</style>
