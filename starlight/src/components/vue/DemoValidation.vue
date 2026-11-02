<script setup>
import { ref, computed } from 'vue'
import './demo.css'

const nom = ref('')
const prix = ref('')
const tentative = ref(false)
const refusServeur = ref(false)
const erreursServeur = ref({})
const message = ref('')

const erreursClient = computed(() => {
  const e = {}
  if (nom.value === '') e.nom = 'Le nom est obligatoire.'
  if (typeof prix.value !== 'number' || prix.value < 0) e.prix = 'Le prix doit être un nombre positif.'
  return e
})

const erreurs = computed(() => ({
  ...(tentative.value ? erreursClient.value : {}),
  ...erreursServeur.value,
}))

// Simule l'API : une seconde d'attente, puis un 201 ou un 422
function envoyer() {
  return new Promise((resoudre, rejeter) => {
    setTimeout(() => {
      if (refusServeur.value) {
        rejeter({ response: { status: 422, data: { erreurs: { nom: 'Ce nom existe déjà dans le catalogue.' } } } })
      } else {
        resoudre({ id: 7, nom: nom.value, prix: prix.value })
      }
    }, 800)
  })
}

const envoiEnCours = ref(false)

async function soumettre() {
  tentative.value = true
  erreursServeur.value = {}
  message.value = ''
  if (Object.keys(erreursClient.value).length > 0) return   // rien ne part

  envoiEnCours.value = true
  try {
    const produit = await envoyer()
    message.value = `Produit no ${produit.id} créé.`
  } catch (err) {
    if (err.response?.status === 422) erreursServeur.value = err.response.data.erreurs
  } finally {
    envoiEnCours.value = false
  }
}

function recommencer() {
  nom.value = ''; prix.value = ''; tentative.value = false; erreursServeur.value = {}; message.value = ''
}
</script>

<template>
  <div class="demo not-content">
    <form class="formulaire" novalidate @submit.prevent="soumettre">
      <label class="champ">
        <span>Nom</span>
        <input v-model.trim="nom" type="text" />
        <small v-if="erreurs.nom" class="erreur">{{ erreurs.nom }}</small>
      </label>
      <label class="champ">
        <span>Prix ($)</span>
        <input v-model.number="prix" type="text" inputmode="decimal" />
        <small v-if="erreurs.prix" class="erreur">{{ erreurs.prix }}</small>
      </label>
      <div class="ligne">
        <button type="submit" :disabled="envoiEnCours">{{ envoiEnCours ? 'Envoi…' : 'Enregistrer' }}</button>
        <button type="button" @click="recommencer">Recommencer</button>
      </div>
    </form>
    <label><input v-model="refusServeur" type="checkbox" /> Le serveur refuse le nom (422)</label>
    <p v-if="message" class="succes">{{ message }}</p>
    <p class="note">Tentative d'envoi : {{ tentative ? 'oui' : 'non' }}</p>
  </div>
</template>

<style scoped>
.formulaire { display: grid; gap: 8px; }
.champ { display: grid; gap: 2px; justify-items: start; }
.erreur { color: #b42318; }
.succes { color: #2f6f3e; font-weight: 600; }
</style>
