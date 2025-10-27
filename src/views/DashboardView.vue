<template>
  <div class="dashboard">
    <div class="main-content-container">
      <h2>Dashboard</h2>

      <!-- Remove v-show -->
      <div class="stats-container">
        <StatCard title="Total Projects" :value="projectCount" :loading="projectStore.loading" />
        <StatCard
          title="Tasks To Do"
          :value="tasksToDoCount"
          :loading="taskStore.loadingAllTasks"
        />
        <!-- Add more StatCard instances here for future stats -->
      </div>

      <p v-if="projectStore.error" class="error">
        Error loading projects: {{ projectStore.error }}
      </p>

      <!-- Maybe add links or recent activity later -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue' // Remove defineProps import if unused elsewhere
import { useProjectStore } from '@/stores/projectStore'
import { useTaskStore } from '@/stores/taskStore' // Import useTaskStore
import StatCard from '@/components/StatCard.vue' // Import the new component

// Remove defineProps
// defineProps({
//   isTransitioning: {
//     type: Boolean,
//     default: false,
//   },
// })

const projectStore = useProjectStore()
const taskStore = useTaskStore() // Get task store instance

// Computed property for total project count
const projectCount = computed(() => projectStore.projects.length)

// Computed property for tasks to do count using the global list
const tasksToDoCount = computed(
  () => taskStore.allUserTasks.filter((task) => task.status !== 'Done').length, // Use allUserTasks
)

// Note: Stores now react to auth state changes to fetch data.
</script>

<style scoped>
.dashboard {
  padding: 1rem; /* Adjusted padding */
}

h2 {
  font-family: var(--font-display); /* Use display font */
  color: var(--color-text-heading); /* Use heading text color */
  margin-bottom: 2rem; /* Increased bottom margin */
  text-align: center;
  font-size: 2.2rem; /* Larger size */
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); /* Adjusted min width */
  gap: 2rem; /* Increased gap */
  margin-top: 1.5rem;
  transition: opacity 0.3s ease; /* Add fade-in transition */
}

/* Styles for .stat-card, .stat-value, .loading-text etc. are now in StatCard.vue */

.error {
  color: var(--color-error); /* Use error color */
  margin-top: 2rem; /* Increased margin */
  text-align: center;
  font-weight: 600;
}
</style>
