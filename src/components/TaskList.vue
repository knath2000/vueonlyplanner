<template>
  <div class="tasks-container">
    <div class="tasks-header">
      <h4>Tasks</h4>
      <button @click="$emit('addTask')" class="add-task-button primary-button">Add New Task</button>
    </div>

    <div v-if="loading && tasks.length === 0" class="loading-state">Loading tasks...</div>
    <div v-else-if="error" class="error-state">{{ error }}</div>
    <div v-else>
      <div v-if="tasks.length === 0" class="empty-state">No tasks yet. Add one!</div>
      <div v-else class="task-list">
        <TransitionGroup
          tag="div"
          class="task-list-transition-wrapper"
          @before-leave="onBeforeLeave"
          @leave="onLeave"
          @appear="onAppear"
          :css="false"
        >
          <TaskCard
            v-for="(task, index) in tasks"
            :key="task.id"
            :task="task"
            :data-index="index"
            @editTask="$emit('editTask', task.id)"
          />
        </TransitionGroup>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type PropType, watch, nextTick } from 'vue' // Import watch, nextTick
import TaskCard from '@/components/TaskCard.vue'
import type { Task } from '@/types/task'
// Removed static GSAP/Flip imports

// GSAP and Flip will be imported dynamically where needed

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

defineEmits(['addTask', 'editTask'])

// --- GSAP Flip Animation Logic ---

// Hook for elements leaving the list
async function onBeforeLeave(el: Element) {
  // Make async
  const { gsap } = await import('gsap')
  gsap.set(el, {
    // Optional: Set initial state for leaving element
  })
}

async function onLeave(el: Element, done: () => void) {
  // Make async
  const { gsap } = await import('gsap')
  // Animate the element out using gsap.to
  gsap.to(el, {
    duration: 0.3,
    ease: 'power1.in',
    scale: 0.8,
    opacity: 0,
    onComplete: done,
  })
}

// Hook for initial appearance animation (optional)
async function onAppear(el: Element, done: () => void) {
  // Make async
  const { gsap } = await import('gsap')
  const indexStr = (el as HTMLElement).dataset.index
  const delay = indexStr ? parseFloat(indexStr) * 0.05 : 0

  gsap.from(el, {
    duration: 0.5,
    opacity: 0,
    scale: 0.9,
    y: 20,
    delay: delay,
    ease: 'power1.out',
    onComplete: done,
  })
}

// Watch for changes in the tasks list to trigger Flip
watch(
  () => props.tasks,
  async () => {
    await nextTick()

    const cards = document.querySelectorAll('.task-list > div > .task-card')
    if (!cards.length) return

    // Dynamically import GSAP and Flip plugin
    const { gsap } = await import('gsap')
    const { Flip } = await import('gsap/Flip')
    gsap.registerPlugin(Flip) // Register dynamically

    const state = Flip.getState(cards)

    Flip.from(state, {
      duration: 0.6,
      scale: true,
      ease: 'power2.out',
      stagger: 0.08,
      absolute: false, // Change to false for horizontal flex layout
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
)
</script>

<style scoped>
.tasks-container {
  /* Container styles if needed, otherwise parent handles layout */
}

.tasks-header {
  display: flex;
  /* justify-content: space-between; */ /* Remove */
  justify-content: center; /* Center items */
  align-items: center;
  margin-bottom: 1.5rem;
  position: relative; /* Needed for absolute positioning of button */
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
  /* Styles copied from ProjectDetailModal */
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

.task-list {
  /* This is the outer container, no specific layout needed here now */
}

/* Apply flex styles to the div rendered by TransitionGroup */
.task-list-transition-wrapper {
  display: flex;
  flex-direction: row;
  overflow-x: auto;
  flex-wrap: nowrap;
  gap: var(--space-md);
  padding: var(--space-sm) 0; /* Add padding for scrollbar */
  min-height: 320px; /* Ensure wrapper has enough height for cards */
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

/* Remove old CSS list transition comment */
</style>
