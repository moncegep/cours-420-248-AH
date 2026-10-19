<script setup>
defineProps({
  actif: { type: Boolean, default: false },
})
const emit = defineEmits(['basculer'])
</script>

<template>
  <button class="favori" :aria-pressed="actif" @click="emit('basculer')">
    {{ actif ? '★' : '☆' }}
  </button>
</template>

<style scoped>
.favori { color: #b54708; }
</style>
