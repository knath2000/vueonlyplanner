<template>
  <!-- Add a class to potentially increase z-index -->
  <BaseModal :show="show" @close="closeModal" class="task-details-modal nested-modal">
    <!-- Removed size="medium" -->
    <template #header>
      <div v-if="task" class="task-details-header">
        <h3>{{ task.title }}</h3>
        <span :class="['status-badge', statusClass]">{{ task.status }}</span>
      </div>
      <div v-else>
        <h3>Task Details</h3>
      </div>
    </template>
    <template #body>
      <div v-if="task" class="task-details-body">
        <div class="detail-item description">
          <strong>Description:</strong>
          <p>{{ task.description || 'No description provided.' }}</p>
        </div>
        <div class="detail-grid">
          <div v-if="task.priority" class="detail-item">
            <strong>Priority:</strong>
            <span :class="['priority-badge', priorityClass]">{{ task.priority }}</span>
          </div>
          <div v-if="task.due_date" class="detail-item">
            <strong>Due Date:</strong>
            <span>{{ formatTimestamp(task.due_date, { dateStyle: 'medium' }) }}</span>
          </div>
          <div class="detail-item">
            <strong>Created:</strong>
            <span>{{ formatTimestamp(task.created_at) }}</span>
          </div>
          <div class="detail-item">
            <strong>Last Updated:</strong>
            <span>{{ formatTimestamp(task.updated_at) }}</span>
          </div>
        </div>
      </div>
      <div v-else class="loading-state">Loading task details...</div>
    </template>
    <template #footer>
      <!-- Optional: Add actions like Edit/Delete if needed later -->
      <button @click="closeModal" class="primary-button">Close</button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue' // Removed unused watch import
import BaseModal from '@/components/BaseModal.vue'
import type { Task } from '@/types/task' // Removed unused TaskStatus, TaskPriority

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  task: {
    type: Object as PropType<Task | null>,
    default: null,
  },
})

const emit = defineEmits(['close'])

const closeModal = () => {
  emit('close')
}

// Helper to format timestamp with optional options
const formatTimestamp = (
  timestamp: string | null | undefined,
  options?: Intl.DateTimeFormatOptions,
) => {
  if (!timestamp) return 'N/A'
  // Default options if none provided
  const defaultOptions: Intl.DateTimeFormatOptions = {
    dateStyle: 'medium',
    timeStyle: 'short',
  }
  return new Date(timestamp).toLocaleString(undefined, options ?? defaultOptions)
}

// Computed class for status badge
const statusClass = computed(() => {
  if (!props.task) return ''
  switch (props.task.status) {
    case 'To Do':
      return 'status-todo'
    case 'Debug':
      return 'status-debug'
    case 'Add Feature':
      return 'status-add-feature'
    case 'Done':
      return 'status-done'
    default:
      return ''
  }
})

// Computed class for priority badge
const priorityClass = computed(() => {
  if (!props.task || !props.task.priority) return ''
  return `priority-${props.task.priority.toLowerCase()}`
})

// Debug watch removed
</script>

<style scoped>
/* Ensure nested modal appears above parent modal */
.nested-modal.base-modal-mask {
  z-index: 10000; /* Higher than the default 9999 */
}
/* Apply specific sizing */
.task-details-modal :deep(.base-modal-container) {
  max-width: 65vw; /* Approximate 75% of ProjectDetailModal width */
  max-height: 75vh;
  width: auto; /* Allow shrinking */
  height: auto; /* Allow shrinking */
}

.task-details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.task-details-header h3 {
  margin: 0;
  font-size: var(--font-size-xl);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-badge {
  font-size: var(--font-size-xs);
  font-weight: 700;
  padding: var(--space-xxs) var(--space-xs);
  border-radius: var(--border-radius-small);
  color: var(--color-text-on-primary);
  text-transform: uppercase;
  white-space: nowrap;
  flex-shrink: 0;
}

.status-badge.status-todo {
  background-color: var(--color-status-todo);
}
.status-badge.status-debug {
  background-color: var(--color-status-debug);
}
.status-badge.status-add-feature {
  background-color: var(--color-status-feature);
}
.status-badge.status-done {
  background-color: var(--color-status-done);
}

.task-details-body {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-top: 0.5rem; /* Add some space below header */
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.detail-item strong {
  font-weight: 600;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.detail-item span,
.detail-item p {
  font-size: var(--font-size-md);
  color: var(--color-text-primary);
  line-height: 1.5;
}

.detail-item.description p {
  white-space: pre-wrap; /* Preserve line breaks in description */
  word-break: break-word;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
  margin-top: 0.5rem;
}

.priority-badge {
  font-size: var(--font-size-sm); /* Match other detail spans */
  font-weight: 700;
  text-transform: uppercase;
  padding: var(--space-xxs) var(--space-xs);
  border-radius: var(--border-radius-small);
  color: var(--color-text-on-primary);
  display: inline-block; /* Needed for padding */
  width: fit-content; /* Size to content */
}

.priority-badge.priority-low {
  background-color: var(--color-priority-low);
}
.priority-badge.priority-medium {
  background-color: var(--color-priority-medium);
}
.priority-badge.priority-high {
  background-color: var(--color-priority-high);
}

.loading-state {
  color: var(--color-text-secondary);
  text-align: center;
  padding: 2rem;
}

/* Inherit button styles from BaseModal or global */
</style>
