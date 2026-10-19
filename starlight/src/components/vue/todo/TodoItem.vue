<script setup>
import { ref, computed, nextTick } from 'vue'

const props = defineProps({
  task: { type: Object, required: true },
})
const emit = defineEmits(['update', 'duplicate', 'delete'])

// Date locale au format AAAA-MM-JJ, comparable à la valeur d'un <input type="date">
const today = () => new Date().toLocaleDateString('en-CA')

const isLate = computed(
  () => !props.task.completed && props.task.dueDate !== '' && props.task.dueDate < today(),
)

// État local : il ne concerne que l'affichage de cette tâche
const editing = ref(false)
const draft = ref('')
const field = ref(null)

async function startEditing() {
  draft.value = props.task.title
  editing.value = true
  await nextTick() // attendre que le champ soit dans la page
  field.value.focus()
}

function finishEditing() {
  if (!editing.value) return
  editing.value = false

  const title = draft.value.trim()
  if (title !== '' && title !== props.task.title) {
    emit('update', { title }) // précondition : titre non vide
  }
}
</script>

<template>
  <li class="todo-item" :class="{ 'is-done': task.completed }" :data-status="task.status">
    <input
      class="todo-item__check"
      type="checkbox"
      :checked="task.completed"
      @change="emit('update', { completed: $event.target.checked })"
    />

    <div class="todo-item__body">
      <input
        v-if="editing"
        ref="field"
        v-model="draft"
        class="todo-item__edit"
        @blur="finishEditing"
        @keydown.enter="finishEditing"
        @keydown.esc="editing = false"
      />
      <span v-else class="todo-item__title" @dblclick="startEditing">{{ task.title }}</span>

      <div class="todo-item__meta">
        <select
          class="todo-item__status"
          :value="task.status"
          @change="emit('update', { status: $event.target.value })"
        >
          <option value="todo">à faire</option>
          <option value="in-progress">en cours</option>
          <option value="done">terminé</option>
        </select>

        <span v-if="task.dueDate" class="todo-item__due" :class="{ 'is-late': isLate }">
          📅 {{ task.dueDate }}
        </span>

        <span class="todo-item__tags">
          <span v-for="tag in task.tags" :key="tag" class="todo-tag">{{ tag }}</span>
        </span>
      </div>
    </div>

    <div class="todo-item__actions">
      <button aria-label="Dupliquer" @click="emit('duplicate')">⧉</button>
      <button aria-label="Supprimer" @click="emit('delete')">×</button>
    </div>
  </li>
</template>
