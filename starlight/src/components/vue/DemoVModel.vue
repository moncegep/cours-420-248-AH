<script setup>
import { ref } from 'vue'
import './demo.css'

const nom = ref('')
const sujet = ref('Stage')
const urgent = ref(false)
</script>

<template>
  <div class="demo not-content">
    <div class="ligne">
      <input type="text" v-model="nom" placeholder="Votre nom" />
      <select v-model="sujet">
        <option>Stage</option>
        <option>Projet</option>
        <option>Question</option>
      </select>
      <label><input type="checkbox" v-model="urgent" /> Urgent</label>
    </div>
    <p>
      Aperçu : <strong>[{{ sujet }}]</strong>
      message de {{ nom || 'personne' }}<span v-if="urgent">, à traiter en priorité</span>
    </p>
  </div>
</template>
