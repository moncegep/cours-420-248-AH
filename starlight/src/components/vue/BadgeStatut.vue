<script setup>
defineProps({
  nom: { type: String, required: true },
  ouvert: { type: Boolean, default: false },
})
</script>

<template>
  <span class="badge" :class="ouvert ? 'ouvert' : 'ferme'">
    {{ nom }} : {{ ouvert ? 'ouvert' : 'fermé' }}
  </span>
</template>

<style scoped>
.badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: .85rem; font-weight: 600; }
.ouvert { background: #ecfdf3; color: #067647; }
.ferme { background: #fef3f2; color: #b42318; }
</style>
