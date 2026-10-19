<script setup>
import { ref } from 'vue'
import './demo.css'

const sombre = ref(false)
</script>

<template>
  <div class="demo not-content" :class="{ sombre: sombre }">
    <p>Thème actuel : {{ sombre ? 'sombre' : 'clair' }}</p>
    <button @click="sombre = !sombre" :aria-pressed="sombre">Changer de thème</button>
  </div>
</template>

<style scoped>
.sombre { background: #1f2430; color: #f3f4f6; }
.sombre button { background: #2c3240; border-color: #3a4150; }
</style>
