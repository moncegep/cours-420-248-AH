<script setup>
import { ref } from 'vue'

const emit = defineEmits(['add'])

const title = ref('')
const tags = ref('')
const dueDate = ref('')

function submit() {
  if (title.value.trim() === '') return // précondition

  emit('add', {
    title: title.value.trim(),
    tags: [...new Set(tags.value.split(',').map((tag) => tag.trim()).filter(Boolean))],
    dueDate: dueDate.value,
  })

  title.value = ''
  tags.value = ''
  dueDate.value = ''
}
</script>

<template>
  <form class="todo__add" @submit.prevent="submit">
    <input v-model="title" name="title" type="text" placeholder="Nouvelle tâche" required />
    <input v-model="tags" name="tags" type="text" placeholder="tags, séparés, par virgules" />
    <input v-model="dueDate" name="dueDate" type="date" />
    <button type="submit">Ajouter</button>
  </form>
</template>
