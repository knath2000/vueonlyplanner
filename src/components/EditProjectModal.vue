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
      <button @click="closeModal" class="btn btn-secondary-enhanced" :disabled="loading">
        <span class="btn-text">Cancel</span>
      </button>
      <button
        type="submit"
        form="edit-project-form"
        :disabled="loading"
        :class="['btn', 'btn-primary-enhanced', { 'btn-loading': loading }]"
      >
        <span class="btn-text">{{ loading ? 'Saving...' : 'Save Changes' }}</span>
        <span v-if="loading" class="spinner"></span>
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { watch, toRef } from 'vue' // Import toRef, remove ref
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
</style>
