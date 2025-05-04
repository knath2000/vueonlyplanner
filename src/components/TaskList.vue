<template>
  <div class="tasks-container">
    <!-- Main Header (Tasks Title + Add Button) -->
    <div class="tasks-header">
      <h4>Tasks</h4>
      <button @click="$emit('addTask')" class="add-task-button primary-button">Add New Task</button>
    </div>

    <!-- Loading / Error States -->
    <div v-if="loading && tasks.length === 0" class="loading-state">Loading tasks...</div>
    <div v-else-if="error" class="error-state">{{ error }}</div>

    <!-- Task Sections -->
    <div v-else class="task-sections-container">
      <!-- Active Tasks Section -->
      <div v-if="activeTasks.length > 0" class="task-section">
        <!-- Removed "Active" heading -->
        <TransitionGroup tag="div" class="active-tasks-list task-list-transition-wrapper">
          <TaskCard
            v-for="task in activeTasks"
            :key="task.id"
            :task="task"
            @editTask="$emit('editTask', task.id)"
          />
          <!-- Changed from @click -->
        </TransitionGroup>
      </div>

      <!-- Separator and Completed Tasks Section (Conditional) -->
      <template v-if="completedTasks.length > 0">
        <hr v-if="activeTasks.length > 0" class="section-divider" />
        <div class="task-section">
          <h5 class="section-heading">Completed</h5>
          <TransitionGroup tag="div" class="completed-tasks-list task-list-transition-wrapper">
            <!-- Wrap TaskCard and add timestamp -->
            <div v-for="task in completedTasks" :key="task.id" class="completed-task-item">
              <TaskCard :task="task" @editTask="$emit('editTask', task.id)" />
              <!-- Listen for viewTask -->
              <div class="completion-timestamp">
                Completed: {{ formatTimestamp(task.updated_at) }}
              </div>
            </div>
          </TransitionGroup>
        </div>
      </template>

      <!-- Empty State (if both lists are empty after loading) -->
      <div v-if="activeTasks.length === 0 && completedTasks.length === 0" class="empty-state">
        No tasks yet. Add one!
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type PropType, computed } from 'vue' // Import computed
import TaskCard from '@/components/TaskCard.vue'
import type { Task } from '@/types/task'
// Removed static GSAP/Flip imports and related JS hooks/watchers

const props = defineProps({
  tasks: {
    type: Array as PropType<Task[]>,
    required: true,
  },
  loading: {
    type: Boolean,
    required: true,
  },
  error: {
    type: String as PropType<string | null>,
    default: null,
  },
})

defineEmits(['addTask', 'editTask']) // Remove 'viewTask'

// Computed properties to split tasks
const activeTasks = computed(() => props.tasks.filter((task) => task.status !== 'Done'))
const completedTasks = computed(() => props.tasks.filter((task) => task.status === 'Done'))

// Helper to format timestamp
const formatTimestamp = (timestamp: string) => {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleString() // Default locale format
}

// Removed JS-based animation hooks (onBeforeLeave, onLeave, onAppear)
// Removed watch effect that triggered Flip.from()
</script>

<style scoped>
.tasks-container {
  /* Container styles if needed, otherwise parent handles layout */
}

.tasks-header {
  display: flex;
  justify-content: center; /* Center items */
  align-items: center;
  margin-bottom: 1.5rem;
  position: relative; /* Needed for absolute positioning of button */
  padding-top: 0.5rem; /* Add padding to prevent button clipping */
  padding-bottom: 0.5rem; /* Add padding to prevent button clipping */
}

.tasks-header h4 {
  margin: 0;
  font-family: var(--font-primary);
  color: var(--color-text-primary);
  font-size: 1.5rem;
  font-weight: 700;
}

.add-task-button {
  position: absolute; /* Position button absolutely */
  right: 0; /* Align to the right */
  background: var(--gradient-button-primary);
  color: var(--color-background-app);
  border: none;
  padding: 0.9rem 2.2rem;
  border-radius: var(--border-radius-medium);
  cursor: pointer;
  transition:
    opacity 0.3s ease,
    transform 0.2s ease;
  font-size: 1.05rem;
  font-weight: 700;
  box-shadow: 0 4px 10px rgba(var(--color-primary-rgb), 0.35);
}

.add-task-button:hover {
  opacity: 0.9;
  transform: translateY(-2px) scale(1.02);
}

.task-sections-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem; /* Space between active and completed sections */
}

.task-section {
  /* Styles for each section (Active, Completed) */
}

.section-heading {
  font-family: var(--font-primary);
  color: var(--color-text-secondary);
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.8rem;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.section-divider {
  border: none;
  height: 1px;
  background-color: var(--color-border);
  opacity: 0.5;
  margin: 0.5rem 0; /* Adjust spacing */
}

/* Apply flex styles to the div rendered by TransitionGroup */
.task-list-transition-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: center; /* Center cards horizontally */
  overflow-x: auto; /* Allow horizontal scrolling if needed */
  flex-wrap: wrap; /* Allow wrapping */
  gap: var(--space-md);
  padding: var(--space-sm) 0; /* Add padding for scrollbar/visuals */
  min-height: 100px; /* Adjust min-height as needed, maybe remove if wrap works well */
}

.loading-state,
.error-state,
.empty-state {
  color: var(--color-text-secondary);
  text-align: center;
  margin-top: 2rem;
  font-size: 1.1rem;
  font-weight: 600;
}

.error-state {
  color: var(--color-error);
}

.completed-task-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem; /* Adjust gap between card and timestamp */
}

.completion-timestamp {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin-top: -0.25rem; /* Fine-tune spacing */
  padding-bottom: 0.2rem; /* Ensure it doesn't get cut off */
}

/* --- Transition Group CSS --- */

/* Applied during the move transition */
.v-move {
  transition: transform 0.6s ease; /* Adjust timing/easing as needed */
}

/* Applied to elements leaving the DOM */
.v-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
  /* position: absolute; */ /* Avoid if flex-wrap handles layout well */
}
.v-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

/* Optional: Add enter transitions if needed for adding new tasks */
/*
.v-enter-active {
  transition: opacity 0.4s ease 0.1s, transform 0.4s ease 0.1s;
}
.v-enter-from {
  opacity: 0;
  transform: scale(0.8);
}
*/
</style>
