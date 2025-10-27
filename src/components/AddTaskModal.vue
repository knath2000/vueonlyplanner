<template>
  <BaseModal :show="show" @close="closeModal" :size="props.size">
    <!-- Pass size prop down -->
    <template #header>
      <h3>Add New Task</h3>
    </template>
    <template #body>
      <form @submit.prevent="handleAddTask" id="add-task-form">
        <div class="form-group">
          <label for="taskTitle">Title:</label>
          <input type="text" id="taskTitle" v-model="taskData.title" required />
        </div>
        <div class="form-group">
          <label for="taskDescription">Description:</label>
          <textarea id="taskDescription" v-model="taskData.description"></textarea>
        </div>
        <div class="form-group">
          <label for="taskDueDate">Due Date:</label>
          <input type="date" id="taskDueDate" v-model="taskData.due_date" />
        </div>
        <div class="form-group">
          <label for="taskPriority">Priority:</label>
          <select id="taskPriority" v-model="taskData.priority">
            <option :value="null">Select Priority</option>
            <!-- Allow null selection -->
            <option
              v-for="priorityOption in priorityOptions"
              :key="priorityOption"
              :value="priorityOption"
            >
              {{ priorityOption }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label for="taskStatus">Status:</label>
          <select id="taskStatus" v-model="taskData.status" required>
            <option v-for="statusOption in statusOptions" :key="statusOption" :value="statusOption">
              {{ statusOption }}
            </option>
          </select>
        </div>
        <p v-if="error" class="error-message">{{ error }}</p>
      </form>
    </template>
    <template #footer>
      <!-- Checkmark button acts as submit -->
      <button
        @click="handleAddTask"
        :disabled="loading"
        class="modal-confirm-button"
        aria-label="Add Task"
      >
        <!-- Show spinner when loading -->
        <span v-if="loading" class="spinner button-spinner"></span>
        <!-- Show checkmark when not loading -->
        <ph-check v-else :size="20" weight="bold" />
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { PhCheck } from '@phosphor-icons/vue' // Import Check icon
import BaseModal from '@/components/BaseModal.vue'
import { useTaskForm } from '@/composables/useTaskForm' // Import useTaskForm composable

const props = withDefaults(
  defineProps<{
    // Use withDefaults
    show: boolean
    size?: 'large' | 'small-centered' // Add size prop
  }>(),
  {
    size: 'small-centered', // Default to small-centered
  },
)

const emit = defineEmits(['close'])

// Use the useTaskForm composable
const {
  taskData,
  loading,
  error,
  statusOptions,
  priorityOptions, // Get priority options
  resetForm,
  submitForm,
} = useTaskForm() // No initial task needed for Add modal

watch(
  () => props.show,
  (newValue) => {
    if (newValue) {
      // Reset form when modal opens using the composable's resetForm
      resetForm()
    }
  },
)

async function handleAddTask() {
  // Use the composable's submitForm
  const success = await submitForm()
  if (success) {
    closeModal()
  }
  // Error and loading are managed by the composable
}

function closeModal() {
  emit('close')
}
</script>

<style scoped>
/* Ensure nested modal appears above parent modal */
.base-modal-mask {
  /* Target the mask directly as this modal IS the nested one */
  z-index: 10000; /* Higher than the default 9999 */
}

/* Styles for the form within the modal */
#add-task-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 600;
  color: var(--color-text-secondary);
  font-family: var(--font-primary);
  font-size: 0.9rem;
  margin-bottom: 0.4rem;
}

input[type='text'],
input[type='date'], /* Add date input */
textarea,
select {
  padding: 0.8rem;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-small);
  background-color: var(--color-background-soft);
  color: var(--color-text-primary);
  font-family: var(--font-primary);
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

input[type='text']:focus,
input[type='date']:focus, /* Add date input */
textarea:focus,
select:focus {
  outline: none;
  border-color: var(--color-primary);
}

textarea {
  min-height: 100px;
  resize: vertical;
}

.error-message {
  color: var(--color-error);
  margin-top: 0.5rem;
  font-size: 0.9rem;
  text-align: center;
}

.button-primary,
.button-secondary {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: var(--border-radius-medium);
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: opacity 0.2s ease;
}

.button-primary {
  background-color: var(--color-primary);
  color: var(--color-text-on-primary);
}

.button-primary:hover:not(:disabled) {
  opacity: 0.9;
}

.button-primary:disabled {
  background-color: var(--color-background-mute);
  color: var(--color-text-secondary);
  cursor: not-allowed;
}

.button-secondary {
  background-color: var(--color-background-soft);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.button-secondary:hover:not(:disabled) {
  background-color: var(--color-background-mute);
}
/* --- Cyberpunk Theme Styles --- */

/* Modal Header */
h3 {
  /* Target h3 within the component's scope */
  font-family: var(--font-display);
  color: var(--color-accent-cyan); /* Or --color-accent-pink */
  text-shadow: 0 0 6px var(--color-accent-cyan-rgb, 0, 255, 255 / 0.6); /* Adjust color/intensity */
  margin-bottom: var(--space-lg); /* Add some space below header */
}

/* Form Labels */
.form-group label {
  /* Keep existing font-weight: 600; */
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.85rem; /* Slightly smaller */
  margin-bottom: 0.3rem; /* Adjust spacing */
  /* Keep existing font-family: var(--font-primary); */
}

/* Form Inputs (General) - Overwrite previous input styles */
input[type='text'],
input[type='date'],
textarea,
select {
  background-color: var(--color-surface-modal, #1a1a1d); /* Fallback color */
  border: 1px solid var(--color-primary);
  color: var(--color-text-primary);
  border-radius: var(--border-radius-small); /* Sharper edges */
  padding: 0.8rem 1rem; /* Adjust padding */
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.4);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
  font-family: var(--font-primary); /* Ensure font is set */
  font-size: 1rem; /* Ensure font size is set */
}

/* Input Focus States - Overwrite previous focus styles */
input[type='text']:focus,
input[type='date']:focus,
textarea:focus,
select:focus {
  outline: none;
  border-color: var(--color-accent-pink);
  box-shadow: 0 0 10px var(--color-accent-pink-rgb, 255, 64, 129 / 0.7); /* Neon glow */
}

/* Select Arrow Styling */
select {
  appearance: none;
  /* Simpler SVG data URI */
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 6' fill='%23888'%3E%3Cpath d='M0 0l5 6 5-6H0z'/%3E%3C/svg%3E"); /* Grey arrow for now */
  background-repeat: no-repeat;
  background-position: right 0.8rem center;
  background-size: 10px 6px;
  padding-right: 2.5rem; /* Ensure space for arrow */
}
/* Consider styling select:focus background-image if needed */

/* Date Input Icon Styling (Attempt) */
input[type='date']::-webkit-calendar-picker-indicator {
  filter: invert(75%) sepia(50%) saturate(500%) hue-rotate(250deg) brightness(1.1); /* Adjust filter values for pink/cyan */
  cursor: pointer;
}

/* Ensure form group spacing */
.form-group {
  margin-bottom: var(--space-md); /* Add if not already present or adjust */
}
/* --- End Cyberpunk Theme Styles --- */

/* Styles for the modal confirm button */
.modal-confirm-button {
  background-color: var(--color-success);
  color: white;
  border: none;
  border-radius: 50%; /* Circular */
  width: 40px; /* Adjusted size */
  height: 40px; /* Adjusted size */
  display: inline-flex; /* Use inline-flex */
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  position: relative; /* Needed for absolute spinner positioning */
}

.modal-confirm-button:hover:not(:disabled) {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.modal-confirm-button:active:not(:disabled) {
  transform: scale(1.05);
}

.modal-confirm-button:disabled {
  background-color: var(--color-text-secondary); /* Grey out when disabled */
  cursor: not-allowed;
  opacity: 0.7;
}

/* Adjust spinner position and color for the button */
.modal-confirm-button .button-spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px; /* Spinner size */
  height: 20px; /* Spinner size */
  border-width: 2px; /* Thinner border */
  border-color: rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  margin: 0; /* Remove margin */
}
</style>
