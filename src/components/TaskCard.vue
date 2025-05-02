<template>
  <!-- Add ref and mouse listeners -->
  <!-- Add position relative if needed for absolute positioning of effects -->
  <div
    ref="cardRef"
    class="task-card"
    :class="statusClass"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    style="position: relative"
  >
    <!-- Completion Effect Container -->
    <div ref="completionEffectContainerRef" class="completion-effect-container"></div>

    <div class="task-header">
      <!-- Add Checkmark placeholder, initially hidden -->
      <ph-check-circle
        v-if="task.status === 'Done'"
        :size="20"
        weight="fill"
        class="checkmark-icon"
      />
      <h3>{{ task.title }}</h3>
      <div class="header-buttons">
        <button @click.stop="emitEditTask" class="icon-button edit-button" aria-label="Edit Task">
          <ph-pencil-simple :size="18" weight="thin" />
        </button>
        <button
          @click.stop="deleteTask(task.id)"
          class="icon-button delete-button"
          aria-label="Delete Task"
        >
          <ph-x :size="18" weight="thin" />
        </button>
      </div>
    </div>
    <!-- Add Due Date and Priority display -->
    <div class="task-meta">
      <span v-if="task.due_date" class="task-due-date">Due: {{ task.due_date }}</span>
      <span
        v-if="task.priority"
        class="task-priority"
        :class="`priority-${task.priority.toLowerCase()}`"
      >
        {{ task.priority }}
      </span>
    </div>
    <p class="task-description">{{ task.description }}</p>
    <div class="task-footer">
      <!-- Removed static span -->
      <!-- Add dynamic class binding to select -->
      <select
        v-model="newStatus"
        @change="updateTaskStatus(task.id, newStatus)"
        :class="selectStatusClass"
      >
        <option v-for="statusOption in statusOptions" :key="statusOption" :value="statusOption">
          {{ statusOption }}
        </option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, toRef, defineEmits, onMounted, onUnmounted } from 'vue' // Import ref, onMounted, onUnmounted
import { useTaskStore } from '@/stores/taskStore'
import type { Task, TaskStatus, TaskPriority } from '@/types/task' // Import TaskPriority
import { PhPencilSimple, PhX, PhCheckCircle } from '@phosphor-icons/vue' // Import Phosphor icons + CheckCircle
// Removed static import: import { gsap } from 'gsap'

const props = defineProps<{
  task: Task
  isNewlyAdded?: boolean // Define the new prop
}>()

// Define emits
const emit = defineEmits(['editTask'])

const taskStore = useTaskStore()
const { updateTask, deleteTask } = taskStore
const cardRef = ref<HTMLDivElement | null>(null)
const completionEffectContainerRef = ref<HTMLDivElement | null>(null) // Ref for effects
let hoverTimeline: gsap.core.Timeline | null = null

// Function to emit edit event
function emitEditTask() {
  emit('editTask', props.task.id)
}

const newStatus = ref<TaskStatus>(props.task.status)

const statusOptions: TaskStatus[] = ['To Do', 'Debug', 'Add Feature', 'Done']

const statusClass = computed(() => {
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

// Computed property for the select element's class based on its current value
const selectStatusClass = computed(() => {
  switch (
    newStatus.value // Use the v-model ref (newStatus)
  ) {
    case 'To Do':
      return 'status-select status-todo' // Add base class + specific status
    case 'Debug':
      return 'status-select status-debug'
    case 'Add Feature':
      return 'status-select status-add-feature'
    case 'Done':
      return 'status-select status-done'
    default:
      return 'status-select' // Base class only
  }
})

const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
  await updateTask(taskId, { status })
}

// Watch for the isNewlyAdded prop changing to true
watch(toRef(props, 'isNewlyAdded'), async (newValue) => {
  if (newValue) {
    const { gsap } = await import('gsap')
    // Trigger a brief animation on the card element
    gsap.fromTo(
      cardRef.value, // Target the card element using ref
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
          gsap.set(cardRef.value, { scale: 1, opacity: 1 })
        },
      },
    )
  }
})

// Watch for task status changes and trigger animation on the status element
watch(
  () => props.task.status,
  async (newStatus, oldStatus) => {
    if (newStatus === 'Done' && oldStatus !== 'Done') {
      playCompletionAnimation()
    } else if (oldStatus === 'Done' && newStatus !== 'Done') {
      // Optional: Add animation for moving out of Done state
    }
    if (newStatus !== oldStatus) {
      const { gsap } = await import('gsap')
      // Target the select element specifically
      const statusSelectElement = cardRef.value?.querySelector(
        '.status-select',
      ) as HTMLElement | null
      if (statusSelectElement) {
        gsap.fromTo(
          statusSelectElement, // Target the select element
          { scale: 1, opacity: 1 }, // From state
          {
            scale: 1.1, // Slightly larger
            opacity: 0.9, // Slightly less opaque
            duration: 0.2, // Quick pulse in
            repeat: 1, // Repeat once (in-out)
            yoyo: true, // Go back and forth
            ease: 'power1.inOut', // Smooth easing
            onComplete: () => {
              // Ensure final state is clean
              gsap.set(statusSelectElement, { scale: 1, opacity: 1 })
            },
          },
        )
      }
    }
  },
)

// --- Task Completion Animation ---
const playCompletionAnimation = async () => {
  if (!cardRef.value || !completionEffectContainerRef.value) return
  const { gsap } = await import('gsap')

  const container = completionEffectContainerRef.value
  const card = cardRef.value
  const cardRect = card.getBoundingClientRect()
  const numParticles = 15

  // 1. Create Particles (simple divs for now)
  for (let i = 0; i < numParticles; i++) {
    const particle = document.createElement('div')
    particle.classList.add('particle')
    gsap.set(particle, {
      position: 'absolute',
      width: gsap.utils.random(3, 8),
      height: gsap.utils.random(3, 8),
      backgroundColor: gsap.utils.random([
        'var(--color-status-done)',
        'var(--color-accent-lime)',
        '#ffffff',
      ]),
      borderRadius: '50%',
      top: '50%', // Start near center
      left: '50%',
      opacity: 1,
      scale: 0,
    })
    container.appendChild(particle)
  }

  // 2. GSAP Timeline for the effect
  const tl = gsap.timeline({
    onComplete: () => {
      // Cleanup particles after animation
      container.innerHTML = ''
    },
  })

  // Flash border/background
  tl.to(
    card,
    {
      borderColor: 'var(--color-status-done)', // Use status color
      borderWidth: '4px', // Make border thicker briefly
      duration: 0.1,
      repeat: 1,
      yoyo: true,
      ease: 'power1.inOut',
    },
    0,
  )

  // Animate checkmark (assuming it appears via v-if) - simple scale/fade
  tl.fromTo(
    card.querySelector('.checkmark-icon'), // Target checkmark within the card
    { scale: 0.5, opacity: 0 },
    { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(2)' },
    0.1,
  ) // Slightly delay checkmark

  // Animate particles bursting outwards
  tl.to(
    container.querySelectorAll('.particle'), // Target particles within the container
    {
      scale: 1,
      x: () => gsap.utils.random(-cardRect.width * 0.4, cardRect.width * 0.4),
      y: () => gsap.utils.random(-cardRect.height * 0.4, cardRect.height * 0.4),
      opacity: 0,
      duration: 0.6,
      stagger: 0.02,
      ease: 'power2.out',
    },
    0.1,
  ) // Start particles slightly after border flash
}

// GSAP Hover Animations
const setupHoverAnimation = async () => {
  const { gsap } = await import('gsap')
  if (cardRef.value) {
    hoverTimeline = gsap.timeline({ paused: true })
    hoverTimeline.to(cardRef.value, {
      y: -6,
      scale: 1.02,
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.25)', // Enhanced shadow
      duration: 0.25,
      ease: 'power1.out',
    })
    // CSS handles ::before opacity transition
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
/* Container for absolute positioned effects */
.completion-effect-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden; /* Contain particles */
  pointer-events: none; /* Allow interaction with card below */
  z-index: 2; /* Above card content, below header buttons? */
}

/* Individual particle style (set by GSAP) */
.particle {
  /* Base styles if needed */
}

.task-card {
  background-color: var(--color-surface-card);
  border-radius: var(--border-radius-medium);
  padding: var(--space-md); /* Use spacing variable */
  margin: 0;
  box-shadow: var(--box-shadow-card);
  /* Remove CSS transitions handled by GSAP/::before */
  position: relative;
  overflow: hidden;
  /* Notecard dimensions */
  width: 240px; /* Fixed width */
  min-height: 300px; /* Taller than wide */
  flex-shrink: 0; /* Prevent shrinking in flex container */
  display: flex; /* Use flex for internal layout */
  flex-direction: column; /* Stack content vertically */
  /* Add left border based on status class */
  border-left: 4px solid transparent;
}

/* Gradient overlay for hover */
.task-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--gradient-card-hover);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 0;
  pointer-events: none;
}

/* Apply hover gradient via CSS */
@media (hover: hover) {
  .task-card:hover::before {
    opacity: 1;
  }
  /* GSAP handles transform/shadow hover */
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-sm); /* Use spacing variable */
  position: relative;
  z-index: 1;
}

.checkmark-icon {
  color: var(--color-status-done);
  margin-right: var(--space-xs);
  /* Animation handled by GSAP */
  opacity: 0; /* Initially hidden */
}

.task-header h3 {
  margin: 0;
  font-size: var(--font-size-lg); /* Use font size variable */
  font-family: var(--font-primary); /* Use Inter */
  font-weight: 600; /* Inter Semi-bold */
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-buttons {
  display: flex;
  gap: var(--space-xs); /* Use spacing variable */
  margin-left: auto; /* Push buttons to the right */
  padding-left: var(--space-sm); /* Add some padding between title and buttons */
}

.icon-button {
  background: none;
  border: none;
  color: var(--color-text-secondary);
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
  transform: scale(1.15);
}

.edit-button:hover {
  color: var(--color-accent-cyan); /* Use neon accent */
}

.delete-button:hover {
  color: var(--color-error);
}

.task-meta {
  display: flex;
  gap: var(--space-sm); /* Space between meta items */
  margin-bottom: var(--space-sm); /* Space below meta */
  font-size: var(--font-size-xs); /* Smaller font size */
  color: var(--color-text-secondary);
  position: relative;
  z-index: 1;
}

.task-due-date {
  /* Specific styles for due date if needed */
}

.task-priority {
  font-weight: 700;
  text-transform: uppercase;
  padding: var(--space-xxs) var(--space-xs);
  border-radius: var(--border-radius-small);
  /* Background color set by status class */
  color: var(--color-text-on-primary); /* Text color suitable for colored backgrounds */
}

.priority-low {
  background-color: var(--color-priority-low); /* Define this variable */
}
.priority-medium {
  background-color: var(--color-priority-medium); /* Define this variable */
}
.priority-high {
  background-color: var(--color-priority-high); /* Define this variable */
}

.task-description {
  margin-bottom: var(--space-md); /* Use spacing variable */
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm); /* Use font size variable */
  /* Removed flex-grow: 1; */
  position: relative;
  z-index: 1;
  /* Add line clamping for potentially long descriptions */
  display: -webkit-box;
  -webkit-line-clamp: 3; /* Show max 3 lines */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  /* Removed white-space: nowrap; */
  min-height: calc(var(--font-size-sm) * 1.6 * 3); /* Reserve space for 3 lines */
}

.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-sm); /* Add gap between status and select */
  position: relative;
  z-index: 1;
  margin-top: auto; /* Push footer to bottom */
  padding-top: var(--space-sm); /* Add space above footer */
}

/* Removed old .task-status rule */

/* Status specific colors */
.status-todo {
  border-left-color: var(--color-status-todo);
}
.status-debug {
  border-left-color: var(--color-status-debug);
}
.status-add-feature {
  border-left-color: var(--color-status-feature);
}
.status-done {
  border-left-color: var(--color-status-done);
}

/* Removed rules applying background based on parent */

select {
  /* Apply styles from old .task-status */
  font-size: var(--font-size-xs);
  font-weight: 700;
  padding: var(--space-xxs) var(--space-xs);
  border-radius: var(--border-radius-small);
  color: var(--color-text-on-primary); /* Use text color suitable for colored backgrounds */
  text-transform: uppercase;
  white-space: nowrap;
  /* Keep other select styles */
  border: 1px solid transparent; /* Make border transparent initially */
  background-color: var(--color-surface-card); /* Default background */
  font-family: var(--font-primary);
  cursor: pointer;
  appearance: none;
  /* Update arrow color to contrast with potential backgrounds */
  background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.362%22%20height%3D%22292.362%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287.9.953l-14.3-14.3a10.237%2010.237%200%200%200-14.3%200l-118.3%20118.3-118.3-118.3a10.237%2010.237%200%200%200-14.3%200l-14.3%2014.3a10.237%2010.237%200%200%200%200%2014.3l125%20125c4.5%204.5%2010.2%207%2016.4%207s11.9-2.5%2016.4-7l125-125a10.237%2010.237%200%200%0A0%200-14.3z%22%2F%3E%3C%2Fsvg%3E'); /* White arrow */
  background-repeat: no-repeat;
  background-position: right 0.5rem top 50%;
  background-size: 0.65rem auto;
  padding-right: var(--space-lg); /* Space for arrow */
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease; /* Add transition */
}

/* Apply background colors based on dynamic class */
select.status-todo {
  background-color: var(--color-status-todo);
}
select.status-debug {
  background-color: var(--color-status-debug);
}
select.status-add-feature {
  background-color: var(--color-status-feature);
}
select.status-done {
  background-color: var(--color-status-done);
}
select:focus {
  /* Use global focus style */
}
</style>
