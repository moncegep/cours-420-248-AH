<script setup>
import { ref } from 'vue'
import BadgeStatut from './BadgeStatut.vue'
import './demo.css'

const nom = ref('Café Beagel')
const ouvert = ref(true)
</script>

<template>
  <div class="demo not-content">
    <div class="ligne">
      <input type="text" v-model="nom" />
      <label><input type="checkbox" v-model="ouvert" /> Ouvert</label>
    </div>
    <div class="ligne">
      <BadgeStatut :nom="nom" :ouvert="ouvert" />
      <BadgeStatut nom="La Planck" />
    </div>
  </div>
</template>
