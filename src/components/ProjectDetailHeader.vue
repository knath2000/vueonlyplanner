<template>
  <div v-if="project" class="project-detail-header">
    <h3>{{ project.name }}</h3>
    <span class="project-color-swatch" :style="{ backgroundColor: project.color }"></span>
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
  display: flex;
  align-items: center;
  justify-content: center; /* Center items horizontally */
  gap: 1rem;
  margin-bottom: 0; /* Keep margin control in parent or specific context */
  width: 100%; /* Ensure container takes full width */
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
