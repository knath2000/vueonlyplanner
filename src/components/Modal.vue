<template>
  <Transition name="modal">
    <div v-if="show" class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">
          <div class="modal-header">
            <slot name="header">
              <!-- default header -->
              <h3>Modal Title</h3>
            </slot>
          </div>

          <div class="modal-body">
            <slot name="body">
              <!-- default body -->
              <p>Modal content goes here.</p>
            </slot>
          </div>

          <div class="modal-footer">
            <slot name="footer">
              <!-- default footer -->
              <button class="modal-default-button" @click="$emit('close')">OK</button>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits(['close'])
</script>

<style scoped>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  transition: opacity 0.3s ease;
}

.modal-wrapper {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal-container {
  width: 90%; /* Adjust width for mobile */
  max-width: 500px; /* Max width on
larger screens */
  margin: auto;
  padding: 20px 30px;
  background-color: var(--color-background);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}
.modal-header h3 {
  margin-top: 0;
  color: var(--color-heading);
}
.modal-body {
  margin: 20px 0;
  flex-grow: 1; /* Allow body to take up space */
  overflow-y: auto; /*
Add scrolling if content is long */
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
}
.modal-default-button {
  /* Basic button styling - can be improved */
  background-color: var(--color-primary);
  color: var(--color-background);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.modal-default-button:hover {
  background-color: var(--color-secondary);
} /* * The following styles
are auto-applied to elements with * transition="modal" when their visibility is toggled * by Vue.js.
* * You can easily play with the modal transition by editing * these styles. */
.modal-enter-from {
  opacity: 0;
}
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
</style>
