<script setup>
import { ref } from 'vue'
import TodoForm from './TodoForm.vue'
import TodoItem from './TodoItem.vue'
import './todo.css'

// L'état : la seule source de vérité
const tasks = ref([])

let nextId = 1
const uid = () => String(nextId++)

function createTask({ title, tags, dueDate }) {
  return { id: uid(), title, tags, dueDate, status: 'todo', completed: false }
}

function createTaskFrom(task) {
  return { ...task, id: uid(), tags: [...task.tags], title: task.title + ' (copie)' }
}

// Les actions : chacune modifie l'état, Vue met l'affichage à jour
function addTask(fields) {
  tasks.value.push(createTask(fields))
}

function updateTask(task, changes) {
  Object.assign(task, changes)
}

function duplicateTask(task) {
  tasks.value.splice(tasks.value.indexOf(task) + 1, 0, createTaskFrom(task))
}

function deleteTask(task) {
  tasks.value.splice(tasks.value.indexOf(task), 1)
}
</script>

<template>
  <section class="todo not-content">
    <header class="todo__head">
      <h3>Todos</h3>
      <TodoForm @add="addTask" />
    </header>

    <ul class="todo__list">
      <TodoItem
        v-for="task in tasks"
        :key="task.id"
        :task="task"
        @update="(changes) => updateTask(task, changes)"
        @duplicate="duplicateTask(task)"
        @delete="deleteTask(task)"
      />
    </ul>

    <p v-if="tasks.length === 0" class="todo__empty">Aucune tâche.</p>
  </section>
</template>
