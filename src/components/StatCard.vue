<template>
  <div class="stat-card">
    <h3>{{ title }}</h3>
    <!-- Skeleton loader for value -->
    <div v-if="loading" class="skeleton-loader value-skeleton"></div>
    <p v-else class="stat-value">{{ value }}</p>
    <!-- Optional slot for additional info/icons -->
    <!-- Add skeleton for slot content if needed -->
    <div v-if="loading && $slots.default" class="skeleton-loader slot-skeleton"></div>
    <slot v-else></slot>
  </div>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})
</script>

<style scoped>
.stat-card {
  /* Increase Size Further */
  min-height: 220px; /* Make card even taller */
  display: flex; /* Enable Flexbox */
  flex-direction: column; /* Stack title and value vertically */
  justify-content: center; /* Vertically center content */

  /* Enhanced Glass Effect */
  background-color: rgba(25, 25, 30, 0.3); /* Decrease opacity */
  backdrop-filter: blur(24px); /* Increase blur */
  border: 1px solid rgba(255, 255, 255, 0.15); /* Slightly brighter border */
  box-shadow: none; /* Keep shadow removed */

  /* Layout & Existing Styles */
  padding: var(--space-lg); /* Keep padding */
  border-radius: var(--border-radius-large); /* Keep radius */
  text-align: center; /* Keep text align */
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease; /* Keep transitions */
}

@media (hover: hover) {
  .stat-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.3); /* Enhance shadow slightly */
  }
}

/* Removed placeholder styles as they are less relevant for a generic component */

.stat-card h3 {
  margin: 0 0 var(--space-md) 0; /* Increase bottom margin */
  font-size: 1.5rem; /* Increase title size further */
  color: var(--color-text-secondary); /* Use secondary text color */
  font-weight: 600; /* Inter Semi-bold */
  font-family: var(--font-primary); /* Use Inter */
}

.stat-value {
  font-size: 3.8rem; /* Slightly smaller large value */
  line-height: 1.1; /* Adjust line height for large font */
  font-weight: 700; /* Poppins Bold */
  margin: 0; /* Remove vertical margin */
  /* Reduce brightness using RGBA with opacity */
  color: rgba(
    var(--color-text-primary-rgb, 255, 255, 255),
    0.85
  ); /* Fallback to white if RGB var missing */
  font-family: var(--font-display); /* Use Poppins */
}

.loading-text {
  font-size: var(--font-size-stat); /* Match stat-value size */
  font-weight: 700; /* Match stat-value weight */
  margin: var(--space-xs) 0; /* Match stat-value margin */
  color: var(--color-text-secondary); /* Use secondary text color */
  font-family: var(--font-display); /* Use Poppins */
}
/* --- Skeleton Loader Styles --- */
.skeleton-loader {
  background-color: var(--color-surface-card); /* Base color */
  position: relative;
  overflow: hidden;
  border-radius: var(--border-radius-small); /* Match text element rounding */
  /* Shimmer effect */
  /* Define --color-border-rgb in :root if not already defined */
  background-image: linear-gradient(
    90deg,
    var(--color-surface-card) 0px,
    rgba(var(--color-border-rgb, 58, 61, 90), 0.4) 40px,
    /* Use border color with alpha */ var(--color-surface-card) 80px
  );
  background-size: 600px; /* Large size for smooth animation */
  animation: shimmer 1.5s infinite linear; /* Re-enable animation */
}

.value-skeleton {
  height: var(--font-size-stat); /* Match stat value height */
  width: 60%; /* Adjust width as needed */
  margin: var(--space-xs) auto; /* Center it like the text */
  margin-bottom: var(--space-sm); /* Add some bottom margin */
}

.slot-skeleton {
  height: 1em; /* Match typical small text height */
  width: 40%; /* Adjust width */
  margin: var(--space-xs) auto 0 auto; /* Center it */
}

@keyframes shimmer {
  0% {
    background-position: -300px; /* Start off-screen */
  }
  100% {
    background-position: 300px; /* Move across */
  }
}
</style>
