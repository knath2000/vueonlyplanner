<template>
  <div v-if="project" class="project-detail-header">
    <!-- Wrapper for title and swatch -->
    <div class="title-swatch-wrapper">
      <h3>{{ project.name }}</h3>
      <span class="project-color-swatch" :style="{ backgroundColor: project.color }"></span>
    </div>
    <!-- Moved project metadata here -->
    <p class="project-meta">
      Created: {{ new Date(project.created_at).toLocaleDateString() }} | Updated:
      {{ new Date(project.updated_at).toLocaleDateString() }}
    </p>
  </div>
  <div v-else class="project-detail-header">
    <h3>Loading Project...</h3>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { Project } from '@/types/project'

defineProps({
  project: {
    type: Object as PropType<Project | null>,
    required: true,
  },
})
</script>

<style scoped>
.project-detail-header {
  /* Use flex column to stack title-wrapper and meta, center items */
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center; /* Keep text centered */
  margin-bottom: 0; /* Keep margin control in parent or specific context */
  width: 100%; /* Ensure container takes full width */
}

/* Styles for the new title/swatch wrapper */
.title-swatch-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem; /* Adjust gap as needed */
}

.project-detail-header h3 {
  margin: 0;
  font-size: 1.8rem; /* Slightly smaller than main view heading */
  font-family: var(--font-display);
  text-align: center; /* Ensure text itself is centered */
  color: var(--color-text-heading);
  line-height: 1.2; /* Reduced line height */
  /* Allow text wrapping if needed */
  word-break: break-word;
  overflow-wrap: break-word;
}

.project-color-swatch {
  display: inline-block;
  width: 1.2rem;
  height: 1.2rem;
  border-radius: 50%;
  border: 2px solid var(--color-border);
  flex-shrink: 0; /* Prevent swatch from shrinking */
}
</style>

<style scoped>
/* Added styles for the moved project-meta */
.project-meta {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  text-align: center; /* Ensure centering */
  margin-top: 0.25rem; /* Add a small top margin */
  margin-bottom: 0; /* Remove bottom margin if needed */
  line-height: 1.2;
}
</style>
