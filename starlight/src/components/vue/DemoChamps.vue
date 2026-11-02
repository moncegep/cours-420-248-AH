<script setup>
import { ref, computed } from 'vue'
import './demo.css'

const categorie = ref('sirop')        // un menu déroulant
const format = ref('')                // des boutons radio
const options = ref([])               // des cases à cocher liées à un même tableau
const cadeau = ref(false)             // une case à cocher seule

const donnees = computed(() => ({
  categorie: categorie.value,
  format: format.value,
  options: options.value,
  cadeau: cadeau.value,
}))
</script>

<template>
  <div class="demo not-content">
    <div class="ligne">
      <label>
        Catégorie
        <select v-model="categorie">
          <option value="sirop">Sirop</option>
          <option value="tartinade">Tartinade</option>
          <option value="confiserie">Confiserie</option>
        </select>
      </label>
    </div>
    <div class="ligne">
      <span>Format :</span>
      <label><input v-model="format" type="radio" name="format" value="250 ml" /> 250 ml</label>
      <label><input v-model="format" type="radio" name="format" value="540 ml" /> 540 ml</label>
      <label><input v-model="format" type="radio" name="format" value="1 l" /> 1 l</label>
    </div>
    <div class="ligne">
      <span>Options :</span>
      <label><input v-model="options" type="checkbox" value="bio" /> Biologique</label>
      <label><input v-model="options" type="checkbox" value="local" /> Local</label>
      <label><input v-model="options" type="checkbox" value="vrac" /> En vrac</label>
    </div>
    <div class="ligne">
      <label><input v-model="cadeau" type="checkbox" /> Emballage cadeau</label>
    </div>
    <pre>{{ JSON.stringify(donnees, null, 2) }}</pre>
  </div>
</template>

<style scoped>
pre { margin: 0; font-size: .85rem; padding: 6px 10px; border-radius: 7px; background: var(--sl-color-gray-6, #f5f6f8); }
</style>
