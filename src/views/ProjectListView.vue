<template>
  <div>
    <div class="main-content-container">
      <div class="header-with-button">
        <h2>Project List</h2>
        <!-- Button to open Add Project Modal -->
        <button
          @click="openAddProjectModal"
          class="btn btn-primary-enhanced add-project-icon-button"
          aria-label="Add New Project"
        >
          <ph-plus :size="24" weight="thin" />
        </button>
      </div>

      <!-- Use TransitionGroup with GSAP hooks -->
      <TransitionGroup
        tag="div"
        class="project-list-container"
        @before-leave="onBeforeLeave"
        @leave="onLeave"
        @appear="onAppear"
        :css="false"
      >
        <ProjectCard
          v-for="(project, index) in projectStore.projects"
          :key="project.id"
          :project="project"
          :data-index="index"
          :isNewlyAdded="project.id === newlyAddedProjectId"
          @viewProjectDetails="handleViewProjectDetails"
          @deleteProject="handleDeleteProject"
          @editProject="handleEditProject"
        />
        <!-- Removed stray self-closing tags -->
      </TransitionGroup>

      <p v-if="projectStore.loading && projectStore.projects.length === 0">Loading projects...</p>
      <!-- Show loading only if list is empty -->
      <p v-if="projectStore.error" class="error">{{ projectStore.error }}</p>
      <p v-if="!projectStore.loading && projectStore.projects.length === 0 && !projectStore.error">
        No projects yet. Add one!
      </p>
      <!-- Empty state -->
    </div>

    <!-- Use the new AddProjectModal component -->
    <AddProjectModal
      :show="showAddProjectModal"
      @close="closeAddProjectModal"
      @projectAdded="handleProjectAdded"
    />

    <!-- Edit Project Modal -->
    <EditProjectModal
      :show="showEditProjectModal"
      :project="projectToEdit"
      @close="closeEditProjectModal"
      size="small-centered"
    />
    <!-- Apply small-centered size -->

    <!-- Project Detail Modal -->
    <ProjectDetailModal
      :show="showProjectDetailModal"
      :project="selectedProject"
      @close="closeProjectDetailModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent, watch, nextTick } from 'vue' // Re-added watch, nextTick
import { useProjectStore } from '@/stores/projectStore'
import type { Project } from '@/types/project' // Import Project type
import ProjectCard from '@/components/ProjectCard.vue'
import { PhPlus } from '@phosphor-icons/vue' // Import Phosphor icon
// Removed static GSAP/Flip imports
// Remove unused import: import BaseModal from '@/components/BaseModal.vue'
import AddProjectModal from '@/components/AddProjectModal.vue' // Import the new modal
// Remove static imports:
// import EditProjectModal from '@/components/EditProjectModal.vue'
// import ProjectDetailModal from '@/components/ProjectDetailModal.vue'

// Dynamically import modals
const EditProjectModal = defineAsyncComponent(() => import('@/components/EditProjectModal.vue'))
const ProjectDetailModal = defineAsyncComponent(() => import('@/components/ProjectDetailModal.vue'))

// GSAP and Flip will be imported dynamically where needed

const projectStore = useProjectStore()

const newlyAddedProjectId = ref<string | null>(null) // Ref to track the newly added project ID

// State for Add Project Modal visibility
const showAddProjectModal = ref(false)

// State for Edit Project Modal
const showEditProjectModal = ref(false)
const projectToEdit = ref<Project | null>(null)

// State for Project Detail Modal
const showProjectDetailModal = ref(false)
const selectedProject = ref<Project | null>(null)

// Subscription is handled automatically when store is initialized

// Functions to manage Add Project Modal visibility
const openAddProjectModal = () => {
  showAddProjectModal.value = true
}

const closeAddProjectModal = () => {
  showAddProjectModal.value = false
}

// Function to handle the event emitted by AddProjectModal on success
function handleProjectAdded(addedProjectId: string) {
  newlyAddedProjectId.value = addedProjectId // Set the newly added project ID for highlight

  // Clear the highlight after a short duration
  setTimeout(() => {
    newlyAddedProjectId.value = null
  }, 1500) // Highlight for 1.5 seconds
}

// Function to handle project deletion - Unchanged
function handleDeleteProject(projectId: string) {
  console.log(`Deleting project: ${projectId}`)
  if (
    confirm(
      `Are you sure you want to delete this project? Tasks associated with it will NOT be deleted automatically.`,
    )
  ) {
    projectStore.deleteProject(projectId).catch((err) => {
      console.error('Failed to delete project from UI:', err)
    })
  }
}

// Functions to manage Edit Project Modal
function handleEditProject(projectId: string) {
  const project = projectStore.projects.find((p) => p.id === projectId)
  if (project) {
    projectToEdit.value = project
    showEditProjectModal.value = true
  } else {
    console.error(`Project with ID ${projectId} not found for editing.`)
    // Optionally show a user-facing error
  }
}

function closeEditProjectModal() {
  showEditProjectModal.value = false
  projectToEdit.value = null // Clear the project being edited
}

// Functions to manage Project Detail Modal
function handleViewProjectDetails(projectId: string) {
  const project = projectStore.projects.find((p) => p.id === projectId)
  if (project) {
    selectedProject.value = project
    showProjectDetailModal.value = true
  } else {
    console.error(`Project with ID ${projectId} not found for viewing details.`)
    // Optionally show a user-facing error
  }
}

function closeProjectDetailModal() {
  showProjectDetailModal.value = false
  selectedProject.value = null // Clear the selected project
}

// --- GSAP Flip Animation Logic ---

// Removed unused listContainerRef

// Hook for elements leaving the list
async function onBeforeLeave(el: Element) {
  // Make async
  const { gsap } = await import('gsap')
  // Optional: Set initial state for leaving element if needed
  gsap.set(el, {
    // Example: Set transform origin if scaling
    // transformOrigin: 'center center'
  })
}

async function onLeave(el: Element, done: () => void) {
  // Make async
  const { gsap } = await import('gsap')
  // Get the state of the element *before* it's removed
  // Removed unused state capture: const state = Flip.getState(el as HTMLElement)

  // Add the element to a temporary container or hide it while animating
  // For simplicity, we'll just animate it out directly
  // Set position absolute AFTER getting state to allow layout shift calculation
  // Note: Flip.from handles absolute positioning automatically if 'absolute: true' is set
  // gsap.set(el, { position: 'absolute' }) // Might not be needed if Flip handles it

  // Animate the element out using gsap.to
  gsap.to(el, {
    duration: 0.3, // Faster exit
    ease: 'power1.in',
    scale: 0.8,
    opacity: 0,
    onComplete: done, // Call done when animation finishes to remove element
  })
}

// Hook for initial appearance animation (optional)
async function onAppear(el: Element, done: () => void) {
  // Make async
  const { gsap } = await import('gsap')
  const indexStr = (el as HTMLElement).dataset.index
  const delay = indexStr ? parseFloat(indexStr) * 0.05 : 0 // Check indexStr before parsing

  gsap.from(el, {
    duration: 0.5,
    opacity: 0,
    scale: 0.9,
    y: 20,
    delay: delay, // Apply calculated delay
    ease: 'power1.out',
    onComplete: done,
  })
}

// Watch for changes in the projects list to trigger Flip
// Restoring watcher
watch(
  () => projectStore.projects, // Watch the ref's value
  async () => {
    // Ensure the DOM has potentially updated from the store change
    await nextTick()

    const cards = document.querySelectorAll('.project-list-container > .project-card')
    if (!cards.length) return

    // Dynamically import GSAP and Flip plugin
    const { gsap } = await import('gsap')
    const { Flip } = await import('gsap/Flip')
    gsap.registerPlugin(Flip) // Register dynamically

    // 1. Get the current state
    const state = Flip.getState(cards)

    // 2. Let Vue handle the DOM updates (already happened implicitly before nextTick)

    // 3. Animate from the old state to the new one
    Flip.from(state, {
      duration: 0.6,
      scale: true, // Animate scale changes
      ease: 'power2.out',
      stagger: 0.08, // Stagger animation for multiple items
      absolute: true, // Handle elements leaving the layout flow
      // Optional: Add onEnter/onLeave callbacks within Flip if needed
      onEnter: (elements) =>
        gsap.fromTo(
          elements,
          { opacity: 0, scale: 0.8 },
          { opacity: 1, scale: 1, duration: 0.4, delay: 0.1 },
        ),
      onLeave: (elements) => gsap.to(elements, { opacity: 0, scale: 0.8, duration: 0.3 }),
    })
  },
  { flush: 'post' },
) // Use 'post' flush to run after DOM updates
// End restoring watcher
</script>

<style scoped>
/* Main container for centering */
.main-content-container {
  display: flex;
  flex-direction: column;
  align-items: center; /* Center content horizontally */
  width: 100%; /* Ensure it takes available width */
}

.header-with-button {
  display: flex;
  justify-content: space-between; /* Distribute items */
  align-items: center;
  margin-bottom: 2rem; /* Keep consistent spacing below the header block */
  width: 100%; /* Allow header to take full width within centered container */
  max-width: 1200px; /* Match max-width of project list for alignment */
}

h2 {
  font-family: var(--font-display); /* Use display font */
  color: var(--color-text-heading); /* Use heading text color */
  margin: auto; /* Center the h2 within the flex container */
  font-size: 2.2rem; /* Larger size */
}

.add-project-icon-button {
  width: 48px; /* Make it a circle */
  height: 48px; /* Make it a circle */
  border-radius: 50%; /* Make it a circle */
  padding: 0; /* Remove padding */
  font-size: 2rem; /* Larger plus sign */
  line-height: 1; /* Center the plus sign */
  display: flex; /* Use flex to center content */
  align-items: center;
  justify-content: center;
  flex-shrink: 0; /* Prevent shrinking */
}

.project-list-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); /* Adjusted min width */
  gap: 1.5rem; /* Increased gap */
  position: relative;
}

/* Remove old CSS list transition styles */
/* .list-enter-active, .list-leave-active, etc. */

/* Add styles for empty state message */
p:last-of-type {
  margin-top: 2rem; /* Increased margin */
  color: var(--color-text-secondary); /* Use secondary text color */
  text-align: center;
  font-size: 1.1rem; /* Slightly larger */
  font-weight: 600;
}

.error {
  color: var(--color-error); /* Use error color */
  margin-top: 1.5rem; /* Adjusted margin */
  text-align: center;
  font-weight: 600;
}
</style>
