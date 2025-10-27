<template>
  <BaseModal :show="show" @close="closeModal" size="small-centered">
    <template #header>
      <h3>Add New Project</h3>
    </template>
    <template #body>
      <form @submit.prevent="handleAddProject" id="add-project-form-modal">
        <div class="form-group">
          <label for="projectNameModal" class="form-label">Project Name:</label>
          <input
            type="text"
            id="projectNameModal"
            v-model="projectData.name"
            required
            class="input-enhanced"
            placeholder="Enter project name..."
          />
        </div>
        <div class="form-group">
          <label class="form-label">Color:</label>
          <div class="color-picker">
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
        <p v-if="error" class="error-message">{{ error }}</p>
      </form>
    </template>
    <template #footer>
      <!-- Checkmark button acts as submit -->
      <button
        ref="addProjectButtonRef"
        @click="handleAddProject"
        :disabled="loading"
        class="modal-confirm-button"
        aria-label="Add Project"
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
import { watch, ref } from 'vue' // Import ref
import { PhCheck } from '@phosphor-icons/vue' // Import Check icon
// Removed static import: import { gsap } from 'gsap'
import BaseModal from '@/components/BaseModal.vue'
import { useProjectForm } from '@/composables/useProjectForm'

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['close', 'projectAdded'])

// Use the composable for the "Add Project" form
const { projectData, loading, error, availableColors, resetForm, submitForm } = useProjectForm() // No initial project needed for adding

// Ref for the submit button element
const addProjectButtonRef = ref<HTMLButtonElement | null>(null)

// Watch the show prop to reset the form when the modal opens
watch(
  () => props.show,
  (newValue) => {
    if (newValue) {
      resetForm() // Reset form when modal becomes visible
    }
  },
)

// Function to play success animation
const playSuccessAnimation = async () => {
  if (!addProjectButtonRef.value) return
  const { gsap } = await import('gsap')

  // Simple pulse and flash example
  const tl = gsap.timeline()
  tl.to(addProjectButtonRef.value, {
    scale: 1.1,
    duration: 0.15,
    yoyo: true,
    repeat: 1,
    ease: 'power1.inOut',
  })
  // Add a subtle background flash (might need adjustment based on actual styles)
  // tl.to(addProjectButtonRef.value, { backgroundColor: '#fff', duration: 0.1, yoyo: true, repeat: 1 }, "<");

  // Wait for animation to mostly complete before proceeding
  await tl.then()
}

async function handleAddProject() {
  const addedProjectId = await submitForm()
  if (addedProjectId) {
    await playSuccessAnimation() // Play animation on success
    emit('projectAdded', addedProjectId) // Emit event with new ID
    closeModal()
  }
  // Error display is handled by binding 'error' ref in the template
}

function closeModal() {
  emit('close')
}
</script>

<style scoped>
/* Styles copied from ProjectListView.vue for the form elements */
.form-group {
  margin-bottom: 1.5rem; /* Spacing between form groups */
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.input-enhanced {
  width: 100%;
  padding: 0.9rem 1.1rem;
  border: 1px solid var(--color-border);
  background-color: var(--color-background-soft); /* Slightly different background */
  color: var(--color-text-primary);
  border-radius: var(--border-radius-medium);
  font-family: var(--font-primary);
  font-size: 1rem;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.input-enhanced:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.2); /* Focus ring */
}

.color-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem; /* Spacing between swatches */
  margin-top: 0.5rem;
}

.color-swatch {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  border: 3px solid transparent; /* Border to indicate selection */
  transition:
    border-color 0.2s ease,
    transform 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-swatch:hover {
  transform: scale(1.1);
}

.color-swatch.selected {
  border-color: var(--color-primary); /* Highlight selected color */
  transform: scale(1.1);
}

.color-swatch:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.3); /* Focus ring for accessibility */
}

.error-message {
  color: var(--color-error);
  margin-top: 1rem;
  font-size: 0.9rem;
  text-align: center;
  min-height: 1.2em; /* Prevent layout shift */
}

/* Button styles (assuming btn, btn-secondary-enhanced, btn-primary-enhanced are globally defined or defined in BaseModal/parent) */
/* Add spinner styles if not global */
.spinner {
  display: inline-block;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  width: 1em;
  height: 1em;
  animation: spin 1s ease-in-out infinite;
  margin-left: 0.5em;
  vertical-align: middle;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.btn-loading .btn-text {
  margin-right: 0.5em; /* Space between text and spinner */
}

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
