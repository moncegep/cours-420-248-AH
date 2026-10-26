<script setup>
import { computed } from 'vue'

const props = defineProps({
  cafe: { type: Object, required: true },
  favori: { type: Boolean, default: false },
})
const emit = defineEmits(['basculer-favori'])

const NOMS_PAIEMENT = { CASH: 'Comptant', DEBIT: 'Débit', CREDIT: 'Crédit' }

const paiements = computed(() =>
  props.cafe.payment_details.map((p) => NOMS_PAIEMENT[p.method] ?? p.method).join(', '),
)
</script>

<template>
  <article class="carte">
    <img v-if="cafe.banner_url" :src="cafe.banner_url" :alt="`Photo du café ${cafe.name}`" loading="lazy" />

    <div class="contenu">
      <header>
        <h2 class="cafe-name">{{ cafe.name }}</h2>
        <button
          class="favori"
          :aria-pressed="favori"
          :aria-label="favori ? 'Retirer des favoris' : 'Ajouter aux favoris'"
          @click="emit('basculer-favori', cafe.slug)"
        >
          {{ favori ? '★' : '☆' }}
        </button>
      </header>

      <p class="statut" :class="cafe.is_open ? 'ouvert' : 'ferme'">
        {{ cafe.is_open ? 'Ouvert' : 'Fermé' }}
        <span v-if="cafe.status_message"> · {{ cafe.status_message }}</span>
      </p>

      <p class="description">{{ cafe.description }}</p>

      <p class="infos">
        {{ cafe.location.pavillon }}, {{ cafe.location.local }}<br />
        Paiement : {{ paiements }}
      </p>
    </div>
  </article>
</template>

<style scoped>
.carte { background: #fff; border: 1px solid var(--bord); border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; }
.carte img { width: 100%; height: 140px; object-fit: cover; background: var(--bord); }
.carte .contenu { padding: 12px 14px 14px; display: flex; flex-direction: column; gap: 6px; }
.carte  header { display: flex; justify-content: space-between; align-items: start; gap: 8px; }
.carte h2 { margin: 0; font-size: 1.1rem; }
.carte p { margin: 0; }
.carte .favori { border: 0; background: none; font-size: 1.3rem; line-height: 1; color: #b54708; cursor: pointer; padding: 0; }
.carte .statut { font-size: .85rem; font-weight: 600; }
.carte .ouvert { color: #067647; }
.carte .ferme { color: #b42318; }
.carte .description { font-size: .92rem; }
.carte .infos { font-size: .85rem; color: var(--gris); }
</style>
