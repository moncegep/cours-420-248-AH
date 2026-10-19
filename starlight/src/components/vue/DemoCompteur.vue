<script setup>
import { ref } from 'vue'
import './demo.css'

const mentions = ref(0)
</script>

<template>
  <div class="demo not-content">
    <p>Ce projet a reçu {{ mentions }} mention(s) « J'aime ».</p>
    <div class="ligne">
      <button @click="mentions++">J'aime</button>
      <button @click="mentions = 0">Remettre à zéro</button>
    </div>
  </div>
</template>
