<template>
  <!-- Use Vue's built-in Transition with JS hooks for animations -->
  <Transition name="modal-fade" :css="false" @enter="onEnter" @leave="onLeave">
    <!-- Bind class based on size prop -->
    <div v-if="show" class="base-modal-mask" :class="`mask-${size}`" @click="triggerCloseAnimation">
      <!-- Bind class based on size prop -->
      <div class="base-modal-wrapper" :class="`wrapper-${size}`">
        <!-- Add ref to the container for GSAP -->
        <div
          ref="modalContainerRef"
          class="base-modal-container"
          :class="`container-${size}`"
          @click.stop=""
        >
          <!-- Add @click.stop -->
          <div class="base-modal-header">
            <slot name="header"></slot>
            <!-- Removed default header -->
            <!-- Conditionally render close button -->
            <button
              v-if="props.showCloseButton"
              class="base-modal-close"
              @click="triggerCloseAnimation"
              aria-label="Close modal"
            >
              <ph-x :size="24" weight="thin" />
            </button>
          </div>
          <!-- Removed the header line div -->

          <div class="base-modal-body">
            <slot name="body">
              <!-- default body -->
              <p>Modal content goes here.</p>
            </slot>
          </div>

          <div class="base-modal-footer" v-if="!$slots.footer">
            <slot name="footer">
              <!-- default footer -->
              <button class="base-modal-default-button" @click="triggerCloseAnimation">OK</button>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref } from 'vue' // Removed watch, nextTick, onMounted, onUnmounted
import { PhX } from '@phosphor-icons/vue' // Import Phosphor icon
// import { gsap } from 'gsap' // Removed static import
// import { useSlots } from 'vue' // Removed unused import

const props = withDefaults(
  defineProps<{
    // Use withDefaults
    show: boolean
    size?: 'large' | 'small-centered' // Add size prop
    showCloseButton?: boolean // Add prop to control close button visibility
  }>(),
  {
    size: 'large', // Default to 'large'
    showCloseButton: true, // Default to showing the close button
  },
)

const emit = defineEmits(['close'])

const modalContainerRef = ref<HTMLDivElement | null>(null)
// const isAnimating = ref(false) // Removed - Vue transition handles this

// const slots = useSlots() // Removed unused variable

// GSAP Animation Functions tied to Transition Hooks
async function onEnter(el: Element, done: () => void) {
  // el here is the .base-modal-mask
  const container = el.querySelector('.base-modal-container') as HTMLElement | null
  if (!container) {
    done() // If container not found, just finish
    return
  }

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReducedMotion) {
    // If reduced motion is preferred, skip animation and immediately call done()
    done()
    return
  }

  const { gsap } = await import('gsap')

  // Set initial styles immediately to prevent flicker
  // gsap.set(el, { opacity: 0 }) // Mask starts invisible - Handled by CSS now
  gsap.set(container, { opacity: 0 }) // Container starts invisible

  // Start animation on the next frame
  requestAnimationFrame(() => {
    // Use a timeline to synchronize mask and container fade-in
    const tl = gsap.timeline({
      onComplete: done, // Call done when the entire timeline completes
    })

    // Animate the mask opacity
    tl.to(
      el, // Target the mask element itself
      { opacity: 1, duration: 0.3, ease: 'power1.inOut' }, // Fade in
      0, // Start at the beginning of the timeline
    )

    // Animate the container opacity (simple fade for now)
    tl.to(
      container,
      {
        opacity: 1,
        duration: 0.3, // Match mask duration
        ease: 'power1.inOut',
        // onComplete is now handled by the timeline
      },
      0, // Start at the beginning of the timeline
    )
  })
}

async function onLeave(el: Element, done: () => void) {
  // el here is the .base-modal-mask
  const container = el.querySelector('.base-modal-container') as HTMLElement | null
  if (!container) {
    done() // If container not found, just finish
    return
  }

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (prefersReducedMotion) {
    // If reduced motion is preferred, skip animation and immediately call done()
    done()
    return
  }

  const { gsap } = await import('gsap')

  // Animate the container out
  gsap.to(container, {
    scale: 0.95, // Scale down slightly
    opacity: 0,
    y: 10, // Move down slightly
    duration: 0.25, // Faster duration
    ease: 'power1.in', // Smoother ease out
    onComplete: done, // Call done when animation completes
  })

  // Optionally animate the mask opacity out as well
  // gsap.to(el, { opacity: 0, duration: 0.25, ease: 'power1.in' });
}

/* Removed old animateIn function
const animateIn = async () => {
  const { gsap } = await import('gsap')
  await nextTick() // Ensure DOM is ready
  if (modalContainerRef.value) {
    isAnimating.value = true
    gsap.fromTo(
      modalContainerRef.value,
      { scale: 0.95, opacity: 0, y: 10 }, // Start slightly smaller and lower
      {
        scale: 1,
        opacity: 1,
        y: 0,
        duration: 0.3, // Faster duration
        ease: 'back.out(1.7)', // Use Back ease for overshoot effect
        onComplete: () => {
          isAnimating.value = false
        },
      },
    )
  }
}
*/

/* Removed old animateOut function
const animateOut = async (callback: () => void) => {
  const { gsap } = await import('gsap')
  if (modalContainerRef.value && !isAnimating.value) {
    isAnimating.value = true
    gsap.to(modalContainerRef.value, {
      scale: 0.95, // Scale down slightly
      opacity: 0,
      y: 10, // Move down slightly
      duration: 0.25, // Faster duration
      ease: 'power1.in', // Smoother ease out
      onComplete: () => {
        isAnimating.value = false
        callback() // Call the emit function after animation
      },
    })
  } else if (!isAnimating.value) {
    // If ref is somehow null but we need to close, just call callback
    callback()
  }
}
*/

// Removed watch on props.show - Transition hooks handle this now
/*
watch(
  () => props.show,
  (newValue) => {
    if (newValue) {
      // Animate in when shown
      animateIn()
    }
    // Note: Animate out is triggered by user action (click mask/button)
  },
)
*/

// Function triggered by close button or mask click
function triggerCloseAnimation() {
  // Just emit close, the @leave hook will handle the animation
  emit('close')
}
</script>

<style scoped>
.base-modal-mask {
  display: flex;
  align-items: stretch; /* Allow wrapper to stretch */
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh; /* Use 100vh for full viewport height */
  /* Apply background and blur directly here */
  background: transparent; /* Remove background overlay color */
  backdrop-filter: blur(12px); /* Apply blur */
  z-index: 9999;
  opacity: 0; /* Set initial opacity via CSS */
  /* Transition removed - mask disappears instantly with v-if */
  /* transition: opacity 0.4s ease; */ /* Adjust timing if needed */
  padding-top: 20px; /* Keep padding-top for top gap */
}

.base-modal-wrapper {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: stretch; /* Allow container to stretch */
  padding: 0; /* Remove padding */
  padding-bottom: 28px; /* Increased padding to the bottom */
  width: 100%; /* Ensure wrapper takes full width */
  height: 100%; /* Ensure wrapper takes full height */
}

.base-modal-container {
  background: var(--color-surface-modal); /* Use new surface variable */
  box-shadow: var(--box-shadow-card); /* Use new card shadow */
  border-radius: var(--border-radius-large); /* Use new large radius */
  padding: 0 var(--space-lg) var(--space-md) var(--space-lg); /* Use spacing variables */
  min-width: 300px;
  max-width: var(--base-modal-max-width, 550px); /* Use CSS variable with fallback */
  width: 100%; /* Ensure container takes full width */
  height: auto; /* Allow height to be determined by content */
  /* transition: all 0.4s ease; */ /* Animation handled by GSAP */
  display: flex;
  flex-direction: column;
  position: relative;
  border: 1px solid var(--color-border); /* Use new border color */
  /* Remove max-height for default 'large' size to allow content to determine height */
  /* max-height: calc(100vh - var(--space-xl) - var(--space-lg)); */
  overflow-y: auto; /* Allow scroll if content overflows, though ideally it won't for AuthModal */
}

.base-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* font-size: 2rem; */ /* Let slot content determine size */
  font-family: var(--font-display); /* Use display font */
  color: var(--color-text-heading); /* Use heading color */
  padding: var(--space-lg) 0 var(--space-md) 0; /* Use spacing variables, add top padding */
  margin-bottom: 0;
  position: relative;
  z-index: 1;
}

/* Accent bar below header */
.base-modal-header::after {
  display: none; /* Keep removed accent bar */
}

.base-modal-close {
  background: none;
  border: none;
  font-size: 2rem; /* Keep size */
  line-height: 1;
  border-radius: 50%;
  width: 2.5rem; /* Keep size */
  height: 2.5rem; /* Keep size */
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    background 0.2s ease,
    transform 0.3s ease;
  color: var(--color-text-secondary); /* Use secondary text color */
  z-index: 1; /* Ensure close button is above content */
}

.base-modal-close:hover {
  background: rgba(
    var(--color-accent-pink-rgb, 255, 64, 129),
    0.1
  ); /* Use accent color with alpha */
  color: var(--color-accent-pink); /* Use accent color */
  transform: rotate(180deg);
}

.base-modal-body {
  margin-top: 0; /* Remove top margin */
  flex-grow: 1;
  overflow-y: auto; /* Keep scroll */
  color: var(--color-text-primary); /* Use primary text color */
  font-family: var(--font-primary); /* Use primary font */
  padding: 0; /* Remove padding, handled by content/slots */
  z-index: 1;
  /* Removed max-height */
}

/* Style for form elements within the modal body */
/* Using global focus styles from main.css now */
.base-modal-body input[type='text'],
.base-modal-body textarea,
.base-modal-body select {
  width: 100%;
  padding: var(--space-sm) var(--space-md); /* Use spacing variables */
  border: 1px solid var(--color-border); /* Use new border color */
  background-color: var(--color-background-app); /* Use app background */
  color: var(--color-text-primary); /* Use primary text color */
  border-radius: var(--border-radius-medium); /* Use medium radius */
  font-family: var(--font-primary); /* Use primary font */
  font-size: 1rem;
  margin-bottom: var(--space-lg); /* Use large spacing */
}

.base-modal-body textarea {
  min-height: 110px;
  resize: vertical;
}

.base-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm); /* Use spacing variable */
  padding-top: var(--space-lg); /* Add padding above footer */
  border-top: 1px solid var(--color-border); /* Add subtle top border */
}

/* Buttons should now use global .btn, .btn-primary-enhanced, .btn-secondary-enhanced styles */
/* Remove modal-specific button styles if they are redundant */
.base-modal-default-button {
  /* Example: Apply global style if needed */
  /* @extend .btn; */
  /* @extend .btn-primary-enhanced; */
}

/* Modal Fade Transition classes removed - mask disappearance handled by v-if */
/*
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.4s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-to,
.modal-fade-leave-from {
  opacity: 1;
}
*/

/* Container animation is handled by GSAP */

/* Styles for small-centered variant */
.mask-small-centered {
  align-items: center; /* Override default stretch */
  padding-top: 0; /* Override default padding */
}

.wrapper-small-centered {
  align-items: center; /* Override default stretch */
  padding-bottom: 0; /* Override default padding */
  height: auto; /* Override default 100% */
}

.container-small-centered {
  max-width: 450px; /* Override default max-width */
  max-height: calc(100vh - var(--space-xl) * 2); /* Adjust max-height for centered */
  /* Keep other container styles */
}
</style>
