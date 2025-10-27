<template>
  <!-- Pass size prop down to BaseModal -->
  <BaseModal :show="show" @close="closeModal" :size="size">
    <template #header>
      <h3>Edit Project</h3>
    </template>
    <template #body>
      <!-- Use isEditing from composable and bind inputs to projectData -->
      <form v-if="isEditing" @submit.prevent="handleSaveChanges" id="edit-project-form">
        <div class="form-group">
          <label for="editProjectName" class="form-label">Project Name:</label>
          <input
            type="text"
            id="editProjectName"
            v-model="projectData.name"
            required
            class="input-enhanced"
            placeholder="Enter project name..."
          />
        </div>
        <div class="form-group">
          <label class="form-label">Color:</label>
          <div class="color-picker">
            <!-- Use availableColors from composable -->
            <div
              v-for="color in availableColors"
              :key="color.value"
              :class="[
                'color-swatch',
                color.class,
                { selected: projectData.color === color.value },
              ]"
              :style="{ backgroundColor: color.value }"
              @click="projectData.color = color.value"
              role="radio"
              :aria-checked="projectData.color === color.value"
              :aria-label="color.name"
              tabindex="0"
              @keydown.space.prevent="projectData.color = color.value"
            ></div>
          </div>
        </div>
        <!-- Use error from composable -->
        <p v-if="error" class="error-message">{{ error }}</p>
      </form>
      <!-- Display if not in editing mode (shouldn't happen if used correctly) -->
      <p v-else>Project data not available for editing.</p>
    </template>
    <template #footer>
      <!-- Use loading from composable -->
      <!-- Checkmark button acts as save -->
      <button
        @click="handleSaveChanges"
        :disabled="loading"
        class="modal-confirm-button"
        aria-label="Save Changes"
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
import { watch, toRef } from 'vue' // Import toRef, remove ref
import { PhCheck } from '@phosphor-icons/vue' // Import Check icon
import BaseModal from '@/components/BaseModal.vue'
import type { Project } from '@/types/project'
import { useProjectForm } from '@/composables/useProjectForm' // Import the composable
// Remove unused import: import { useProjectStore } from '@/stores/projectStore'

// Define props using type-based syntax for withDefaults
const props = withDefaults(
  defineProps<{
    show: boolean
    project: Project | null
    size?: 'large' | 'small-centered'
  }>(),
  {
    // Define defaults in the second argument of withDefaults
    project: null,
    size: 'large',
  },
)

const emit = defineEmits(['close'])

// Use the composable, passing the project prop
const projectPropRef = toRef(props, 'project')
const {
  projectData,
  loading, // Renamed from isSaving
  error, // Renamed from errorMessage
  availableColors, // Get colors from composable
  isEditing, // Use computed property from composable
  resetForm,
  submitForm,
} = useProjectForm(projectPropRef)

// Watch the show prop to reset the form when the modal opens
// The composable already watches the project prop itself
watch(
  () => props.show,
  (newValue) => {
    if (newValue) {
      resetForm() // Reset form using composable's function when modal becomes visible
    }
  },
)

function closeModal() {
  // Check loading state from composable
  if (!loading.value) {
    emit('close')
  }
}

async function handleSaveChanges() {
  // isEditing check is implicitly handled by submitForm logic in composable
  if (loading.value) return

  const updatedProjectId = await submitForm() // Call the composable's submit function

  if (updatedProjectId) {
    // Success (updatedProjectId will be the project's ID)
    emit('close')
  }
  // Error display is handled by binding 'error' ref in the template
}
</script>

<style scoped>
/* Add specific styles if needed, otherwise rely on BaseModal and main.css */
.form-group {
  margin-bottom: 1.5rem; /* Consistent spacing */
}

.error-message {
  color: var(--color-error);
  margin-top: 1rem;
  font-size: 0.9rem;
  text-align: center;
}

/* Styles for color picker are in main.css */

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
