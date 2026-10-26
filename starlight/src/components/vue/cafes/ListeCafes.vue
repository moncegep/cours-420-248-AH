<script setup>
import { ref, computed, onMounted } from 'vue'
import CarteCafe from './CarteCafe.vue'

// Version de démonstration : la source des données est fournie par la page
const props = defineProps({
  source: { type: String, default: 'https://api.cafesansfil.ca/v1/cafes?size=100' },
})

// Données et état du chargement
const cafes = ref([])
const chargement = ref(true)
const erreur = ref('')

// Filtres rapides
const recherche = ref('')
const ouvertsSeulement = ref(false)
const pavillon = ref('')
const carteAcceptee = ref(false)
const favorisSeulement = ref(false)
const favoris = ref([])

onMounted(async () => {
  try {
    const reponse = await fetch(props.source)
    if (!reponse.ok) {
      throw new Error(`statut ${reponse.status}`)
    }
    const page = await reponse.json()
    cafes.value = page.items
  } catch (e) {
    erreur.value = `Impossible de charger les cafés (${e.message}).`
  } finally {
    chargement.value = false
  }
})

// Les pavillons présents dans les données, sans doublon, en ordre alphabétique
const pavillons = computed(() =>
  [...new Set(cafes.value.map((c) => c.location.pavillon))].sort((a, b) => a.localeCompare(b, 'fr')),
)

const cafesFiltres = computed(() => {
  const texte = recherche.value.trim().toLowerCase()

  return cafes.value.filter((cafe) => {
    if (ouvertsSeulement.value && !cafe.is_open) return false
    if (pavillon.value && cafe.location.pavillon !== pavillon.value) return false
    if (carteAcceptee.value && !cafe.payment_details.some((p) => p.method !== 'CASH')) return false
    if (favorisSeulement.value && !favoris.value.includes(cafe.slug)) return false
    if (texte && !`${cafe.name} ${cafe.description}`.toLowerCase().includes(texte)) return false
    return true
  })
})

function basculerFavori(slug) {
  if (favoris.value.includes(slug)) {
    favoris.value = favoris.value.filter((s) => s !== slug)
  } else {
    favoris.value.push(slug)
  }
}

function reinitialiser() {
  recherche.value = ''
  ouvertsSeulement.value = false
  pavillon.value = ''
  carteAcceptee.value = false
  favorisSeulement.value = false
}
</script>

<template>
  <main class="app not-content">
    <p class="titre">Cafés étudiants de l'UdeM</p>

    <section class="filtres" aria-label="Filtres rapides">
      <input v-model="recherche" type="search" placeholder="Rechercher un café, un plat…" />

      <select v-model="pavillon">
        <option value="">Tous les pavillons</option>
        <option v-for="p in pavillons" :key="p" :value="p">{{ p }}</option>
      </select>

      <label><input v-model="ouvertsSeulement" type="checkbox" /> Ouverts</label>
      <label><input v-model="carteAcceptee" type="checkbox" /> Carte acceptée</label>
      <label><input v-model="favorisSeulement" type="checkbox" /> Mes favoris ({{ favoris.length }})</label>

      <button type="button" @click="reinitialiser">Réinitialiser</button>
    </section>

    <p v-if="chargement" class="message">Chargement des cafés…</p>
    <p v-else-if="erreur" class="message erreur">{{ erreur }}</p>

    <template v-else>
      <p class="message">{{ cafesFiltres.length }} café(s) sur {{ cafes.length }}</p>

      <p v-if="cafesFiltres.length === 0" class="message">Aucun café ne correspond à ces filtres.</p>

      <div class="grille">
        <CarteCafe
          v-for="cafe in cafesFiltres"
          :key="cafe.slug"
          :cafe="cafe"
          :favori="favoris.includes(cafe.slug)"
          @basculer-favori="basculerFavori"
        />
      </div>
    </template>
  </main>
</template>

<style scoped>
.app { --bord: #e2e5ec; --gris: #667085; color: #1f2430; font-family: system-ui, sans-serif; }
.app { background: #faf8f6; border: 1px solid #e2e5ec; border-radius: 12px; padding: 16px; margin: 1rem 0; }
.app .titre { margin: 0 0 12px; font-size: 1.3rem; font-weight: 700; }
.filtres { display: flex; flex-wrap: wrap; gap: 10px 16px; align-items: center; background: #fff; border: 1px solid var(--bord);
  border-radius: 12px; padding: 12px 14px; margin-bottom: 14px; }
.filtres input[type='search'] { flex: 1 1 220px; }
.app input[type='search'], select, button { font: inherit; padding: 6px 10px; border: 1px solid #cfd4de; border-radius: 8px; background: #fff; }
.app button { cursor: pointer; }
.app label { display: inline-flex; gap: 6px; align-items: center; }
.app .message { color: var(--gris); margin: 0 0 12px; }
.app .erreur { color: #b42318; }
.app .grille { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; }
</style>
