<script setup lang="ts">
import { ref, defineAsyncComponent, onMounted, onUnmounted } from 'vue' // Re-added defineAsyncComponent
import { RouterLink, RouterView } from 'vue-router' // Re-added RouterView import
import { useAuthStore } from '@/stores/authStore'
import BaseModal from '@/components/BaseModal.vue' // Re-added BaseModal import
// Removed static import: import AuthModal from '@/components/AuthModal.vue'
// import gsap from 'gsap' // Removed static import

// Dynamically import AuthModal
const AuthModal = defineAsyncComponent(() => import('@/components/AuthModal.vue')) // Re-enabled AuthModal import

// State for navbar visibility
const isNavbarVisible = ref(false)

// Function to toggle navbar visibility
function toggleNavbar() {
  isNavbarVisible.value = !isNavbarVisible.value
}

// State for auth modal visibility
const showAuthModal = ref(false)

// Function to open auth modal
const openAuthModal = () => {
  showAuthModal.value = true
}

// Function to close auth modal - Restored
const closeAuthModal = () => {
  showAuthModal.value = false
}

// Use auth store
const authStore = useAuthStore()

// REMOVED GSAP transition hooks (onBeforeEnter, onEnter, onLeave)

const prefersReducedMotion = ref(false)
const transitionName = ref('fade') // Default transition name

let mediaQuery: MediaQueryList | undefined

const checkReducedMotion = () => {
  prefersReducedMotion.value = mediaQuery ? mediaQuery.matches : false
  transitionName.value = prefersReducedMotion.value ? '' : 'fade' // Disable transition by setting name to empty string
}

onMounted(() => {
  mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  checkReducedMotion()
  mediaQuery.addEventListener('change', checkReducedMotion)
})

onUnmounted(() => {
  if (mediaQuery) {
    mediaQuery.removeEventListener('change', checkReducedMotion)
  }
})
</script>

<template>
  <!-- Toggle Button -->
  <button
    class="navbar-toggle-button"
    :class="{ 'shifted-left': isNavbarVisible }"
    @click="toggleNavbar"
    aria-label="Toggle Navigation"
    :aria-expanded="isNavbarVisible"
  >
    ☰
  </button>

  <header :class="{ 'navbar-visible': isNavbarVisible }">
    <nav>
      <!-- Empty div for spacing on the left -->
      <div class="nav-spacer"></div>
      <!-- Group for centered links -->
      <div class="nav-links-center">
        <template v-if="authStore.currentUser">
          <RouterLink :to="{ name: 'dashboard' }">Dashboard</RouterLink>
          <RouterLink :to="{ name: 'project-list' }">Projects</RouterLink>
        </template>
        <!-- No v-else needed if nothing shown when logged out -->
      </div>
      <!-- Logout/Login button on the right -->
      <div class="nav-actions-right">
        <button v-if="authStore.currentUser" @click="authStore.logout()">Logout</button>
        <button v-else @click="openAuthModal">Login</button>
      </div>
    </nav>
  </header>

  <main>
    <RouterView v-slot="{ Component }">
      <transition :name="transitionName" mode="out-in">
        <component :is="Component" />
      </transition>
    </RouterView>
  </main>

  <!-- Auth Modal -->
  <BaseModal :show="showAuthModal" @close="closeAuthModal" :show-close-button="false">
    <template #body>
      <!-- Conditionally render AuthModal only when shown -->
      <AuthModal v-if="showAuthModal" :show="showAuthModal" @close="closeAuthModal" />
    </template>
    <template #footer>
      <!-- Provide empty footer to override default OK button -->
    </template>
  </BaseModal>
</template>

<style scoped>
/* Toggle Button Styles */
.navbar-toggle-button {
  position: fixed;
  left: 50%; /* Center horizontally */
  bottom: 20px; /* Position from the bottom */
  transform: translateX(-50%); /* Adjust for centering */
  z-index: 1100; /* Above the navbar */
  background-color: var(--color-surface-card); /* Use card surface color */
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  padding: 0.5rem 0.75rem;
  border-radius: var(--border-radius-medium);
  cursor: pointer;
  font-size: 1.2rem;
  line-height: 1;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease,
    color 0.3s ease,
    left 0.3s ease,
    /* Add transition for left */ transform 0.3s ease; /* Add transition for transform */
}

.navbar-toggle-button:hover {
  background-color: rgba(var(--color-primary-rgb), 0.1);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* Style for shifted button */
.navbar-toggle-button.shifted-left {
  left: 2rem; /* Move to the left */
  transform: translateX(0); /* Reset transform */
}

/* Header Styles - Apply Glassmorphism */
header {
  /* Glass Effect */
  background-color: rgba(25, 25, 30, 0.4); /* Adjust color/opacity as needed */
  backdrop-filter: blur(12px); /* Adjust blur as needed */
  border-radius: var(--border-radius-large) var(--border-radius-large) 0 0; /* Round top corners */
  border: 1px solid rgba(255, 255, 255, 0.1); /* Subtle border */
  border-bottom: none; /* Remove original bottom border */
  box-shadow: none; /* Remove original shadow */

  /* Layout & Positioning */
  padding: 1rem 2rem; /* Keep padding */
  position: fixed; /* Fixed position */
  bottom: 0; /* Position at the bottom */
  left: 0;
  right: 0; /* Span full width */
  transform: translateY(100%); /* Initially hidden below viewport */
  transition: transform 0.3s ease; /* Smooth slide transition */
  z-index: 1000; /* Below toggle button, above content */
}

header.navbar-visible {
  transform: translateY(0); /* Slide down when visible */
}

nav {
  display: flex;
  justify-content: space-between; /* Space out left, center, right */
  align-items: center; /* Vertically align items */
  width: 100%; /* Ensure nav takes full width */
}

.nav-spacer {
  flex: 1; /* Takes up space on the left */
  min-width: 80px; /* Ensure minimum space, adjust as needed */
}
.nav-links-center {
  display: flex;
  gap: 1.5rem; /* Keep gap between links */
  justify-content: center; /* Center links within this div */
  flex-shrink: 0; /* Prevent shrinking if space is tight */
}

.nav-actions-right {
  flex: 1; /* Takes up space on the right */
  display: flex;
  justify-content: flex-end; /* Align button to the right */
  min-width: 80px; /* Ensure minimum space, adjust as needed */
}
nav a {
  text-decoration: none;
  color: var(--color-text-secondary); /* Use secondary text color */
  padding: 0.5rem 0.75rem; /* Increased padding */
  border-radius: var(--border-radius-small); /* Use new variable */
  transition:
    color 0.3s ease,
    background-color 0.3s ease;
  font-weight: 600; /* Semi-bold */
}

nav a:hover {
  color: var(--color-text-primary); /* Use primary text color on hover */
  background-color: rgba(var(--color-primary-rgb), 0.1); /* Subtle background hover effect */
}

nav a.router-link-exact-active {
  font-weight: 700; /* Bold */
  color: var(--color-primary); /* Use primary color for active link */
  background-color: rgba(var(--color-primary-rgb), 0.2); /* Subtle background for active link */
}

nav button {
  background: var(--gradient-button-primary); /* Use button gradient */
  color: var(--color-background-app); /* Use app background color for text */
  border: none;
  padding: 0.5rem 1.2rem; /* Adjusted padding */
  border-radius: var(--border-radius-medium); /* Use new variable */
  cursor: pointer;
  transition:
    opacity 0.3s ease,
    transform 0.2s ease;
  font-size: 1rem;
  font-weight: 700;
  /* margin-left: auto; Removed - handled by flex layout */
  box-shadow: 0 4px 8px rgba(var(--color-primary-rgb), 0.3); /* Subtle button shadow */
}

nav button:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-2px); /* Subtle lift on hover */
}

nav button:disabled {
  background-color: var(--color-secondary);
  cursor: not-allowed;
  opacity: 0.6;
  transform: none;
  box-shadow: none;
}

main {
  padding: 1rem;
  position: relative;
  /* Ensure main content area allows for transition */
}

/* Basic CSS Fade Transition for Router Views */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Keep commented out styles if they might be useful later */
/*
.logo { ... }
@media (...) { ... }
*/
</style>
