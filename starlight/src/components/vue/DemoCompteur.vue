<script setup>
import { ref } from 'vue'
import './demo.css'

const mentions = ref(0)
</script>

<template>
  <div class="demo not-content">
    <p>Ce projet a reçu {{ mentions }} kudo(s).</p>
    <div class="ligne">
      <button @click="mentions++">👍</button>
      <button @click="mentions = 0">Réinitialiser</button>
    </div>
  </div>
</template>
