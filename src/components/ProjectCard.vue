<template>
  <!-- Add ref and mouse listeners -->
  <div
    ref="cardRef"
    class="project-card"
    :style="{ '--project-color': project.color }"
    @click="emitViewDetails"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <div class="project-header">
      <!-- Use project color variable for potential styling -->
      <h3 :style="{ color: 'var(--project-color)' }">{{ project.name }}</h3>
      <div class="header-buttons">
        <button
          @click.stop="emitEditProject"
          class="icon-button edit-button"
          aria-label="Edit Project"
        >
          <ph-pencil-simple :size="20" weight="thin" />
        </button>
        <button
          @click.stop="deleteProject(project.id)"
          class="icon-button delete-button"
          aria-label="Delete Project"
        >
          <ph-x :size="20" weight="thin" />
        </button>
      </div>
    </div>
    <div class="project-details">
      <!-- Removed project-color-swatch span -->
      <span class="project-dates">
        Created: {{ new Date(project.created_at).toLocaleDateString() }} | Updated:
        {{ new Date(project.updated_at).toLocaleDateString() }}
      </span>
    </div>
    <!-- Removed project-actions div and router-link -->
  </div>
</template>

<script setup lang="ts">
import { watch, toRef, defineEmits, ref, onMounted, onUnmounted } from 'vue' // Import ref, onMounted, onUnmounted
import { useProjectStore } from '@/stores/projectStore'
import type { Project } from '@/types/project' // Corrected import path
import { PhPencilSimple, PhX } from '@phosphor-icons/vue' // Import Phosphor icons
// Removed static import: import { gsap } from 'gsap'

const props = defineProps<{
  project: Project
  isNewlyAdded?: boolean // Define the new prop
}>()

// Define emits
const emit = defineEmits(['editProject', 'viewProjectDetails']) // Add viewProjectDetails

const projectStore = useProjectStore()
const { deleteProject } = projectStore
const cardRef = ref<HTMLDivElement | null>(null)
let hoverTimeline: gsap.core.Timeline | null = null

// Function to emit edit event
function emitEditProject() {
  emit('editProject', props.project.id)
}

// Function to emit view details event
function emitViewDetails() {
  // We don't want to trigger view details if edit/delete was clicked
  // The .stop modifier on the buttons handles this.
  emit('viewProjectDetails', props.project.id)
}

// Watch for the isNewlyAdded prop changing to true
watch(toRef(props, 'isNewlyAdded'), async (newValue) => {
  if (newValue) {
    const { gsap } = await import('gsap')
    // Trigger a brief animation on the card element
    gsap.fromTo(
      '.project-card', // Target the card element
      { scale: 1, opacity: 1 }, // From state
      {
        scale: 1.02, // Slightly larger
        opacity: 0.8, // Slightly less opaque
        duration: 0.3, // Quick pulse in
        repeat: 2, // Repeat twice (in-out-in-out)
        yoyo: true, // Go back and forth
        ease: 'power1.inOut', // Smooth easing
        onComplete: () => {
          // Ensure final state is clean if needed, though yoyo helps
          gsap.set('.project-card', { scale: 1, opacity: 1 })
        },
      },
    )
  }
})

// GSAP Hover Animations
const setupHoverAnimation = async () => {
  const { gsap } = await import('gsap')
  if (cardRef.value) {
    // Create a reusable timeline, paused initially
    hoverTimeline = gsap.timeline({ paused: true })
    hoverTimeline.to(cardRef.value, {
      y: -6,
      scale: 1.02,
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.25)', // Enhanced shadow
      duration: 0.25,
      ease: 'power1.out',
    })
    // Animate the pseudo-element's opacity (requires targeting it differently or using a real element)
    // For simplicity, we'll rely on the CSS transition for the ::before opacity for now.
    // If more control is needed, replace ::before with a div inside the card.
  }
}

const onMouseEnter = () => {
  hoverTimeline?.play()
}

const onMouseLeave = () => {
  hoverTimeline?.reverse()
}

onMounted(() => {
  setupHoverAnimation()
})

onUnmounted(() => {
  hoverTimeline?.kill() // Clean up timeline
})
</script>

<style scoped>
.project-card {
  background-color: var(--color-surface-card);
  border-radius: var(--border-radius-large); /* Use new large radius */
  padding: var(--space-lg); /* Use spacing variable */
  /* Use CSS variable for project color border */
  border-top: 3px solid var(--project-color); /* Thinner border */
  margin-bottom: var(--space-lg); /* Use spacing variable */
  box-shadow: var(--box-shadow-card); /* Use new shadow */
  /* Remove CSS transitions handled by GSAP */
  position: relative;
  overflow: hidden;
  cursor: pointer; /* Indicate clickable */
  will-change: transform, opacity; /* Optimize rendering for potential changes */
}

/* Gradient overlay for hover */
.project-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--gradient-card-hover);
  opacity: 0;
  transition: opacity 0.3s ease; /* Keep CSS transition for simple opacity */
  z-index: 0;
  pointer-events: none; /* Allow clicks to pass through */
}

/* Apply hover gradient via CSS */
@media (hover: hover) {
  .project-card:hover::before {
    opacity: 1;
  }
  /* GSAP handles transform/shadow hover */
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-sm); /* Use spacing variable */
  position: relative;
  z-index: 1;
}

.project-header h3 {
  margin: 0;
  font-size: var(--font-size-xl); /* Use font size variable */
  font-family: var(--font-display); /* Use Poppins */
  font-weight: 600; /* Poppins Semi-bold */
  /* Color set dynamically via style binding */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-buttons {
  display: flex;
  gap: var(--space-xs); /* Use spacing variable */
}

.icon-button {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  /* Size controlled by icon component */
  line-height: 1;
  cursor: pointer;
  transition:
    color 0.2s ease,
    transform 0.2s ease;
  padding: var(--space-xxs); /* Use spacing variable */
  margin: calc(-1 * var(--space-xxs)); /* Counteract padding */
  position: relative;
  z-index: 1;
}

.icon-button:hover {
  transform: scale(1.15); /* Slightly larger hover scale */
}

.edit-button:hover {
  color: var(--color-accent-cyan); /* Use neon accent */
}

.delete-button:hover {
  color: var(--color-error); /* Keep error color */
}

.project-details {
  display: flex;
  align-items: center;
  margin-bottom: 0; /* Remove bottom margin */
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm); /* Use font size variable */
  position: relative;
  z-index: 1;
}

.project-dates {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Removed project-actions styles */
</style>
