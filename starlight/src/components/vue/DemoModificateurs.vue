<script setup>
import { ref } from 'vue'
import './demo.css'

const sansTrim = ref('')
const avecTrim = ref('')
const sansNumber = ref('')
const avecNumber = ref('')

// Affiche une valeur avec ses guillemets et son type
function decrire(valeur) {
  return `${JSON.stringify(valeur)} (${typeof valeur})`
}
</script>

<template>
  <div class="demo not-content">
    <p class="note">Tapez « &nbsp;Tire&nbsp; » avec des espaces, puis un prix comme 6.25.</p>
    <table>
      <tbody>
        <tr>
          <td><code>v-model</code></td>
          <td><input v-model="sansTrim" type="text" /></td>
          <td><code>{{ decrire(sansTrim) }}</code></td>
        </tr>
        <tr>
          <td><code>v-model.trim</code></td>
          <td><input v-model.trim="avecTrim" type="text" /></td>
          <td><code>{{ decrire(avecTrim) }}</code></td>
        </tr>
        <tr>
          <td><code>v-model</code></td>
          <td><input v-model="sansNumber" type="text" inputmode="decimal" /></td>
          <td><code>{{ decrire(sansNumber) }}</code></td>
        </tr>
        <tr>
          <td><code>v-model.number</code></td>
          <td><input v-model.number="avecNumber" type="text" inputmode="decimal" /></td>
          <td><code>{{ decrire(avecNumber) }}</code></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
table { border-collapse: collapse; }
td { padding: 3px 8px 3px 0; vertical-align: middle; }
</style>
