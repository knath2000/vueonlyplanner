<template>
  <div>
    <div class="main-content-container">
      <h2>Task Details</h2>
      <p class="placeholder-text">Details for a specific task will go here.</p>
      <p class="placeholder-text">Task ID (from route params): {{ taskId }}</p>
      <p class="placeholder-text">Project ID (from route params): {{ projectId }}</p>
      <!-- Add task details display and editing components later -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
// Import task store later to fetch specific task details

const route = useRoute()
const taskId = ref('')
const projectId = ref('')

onMounted(() => {
  // Access route params - ensure route is set up correctly later
  taskId.value = (route.params.taskId as string) || 'N/A'
  projectId.value = (route.params.projectId as string) || 'N/A'
  // Fetch task details using taskId.value and/or projectId.value
})
</script>

<style scoped>
h2 {
  font-family: var(--font-display); /* Use display font */
  color: var(--color-text-heading); /* Use heading text color */
  margin-bottom: 1.5rem; /* Adjusted margin */
  text-align: center;
  font-size: 2.2rem; /* Larger size */
}

.placeholder-text {
  color: var(--color-text-secondary); /* Use secondary text color */
  text-align: center;
  margin-bottom: 1rem; /* Add space between paragraphs */
  font-size: 1rem;
}
</style>
