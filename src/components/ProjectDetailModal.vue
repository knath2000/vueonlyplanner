<template>
  <BaseModal :show="show" @close="closeModal" class="modal-expansive">
    <template #header>
      <ProjectDetailHeader :project="project" />
    </template>
    <template #body>
      <div v-if="project" class="project-detail-body">
        <!-- Project title and swatch are now in the header slot -->

        <TaskList
          :tasks="taskStore.tasks"
          :loading="taskStore.loading"
          :error="taskStore.error"
          @addTask="openAddTaskModal"
          @editTask="handleEditTask"
        />
        <!-- Removed stray comment -->
      </div>
      <div v-else class="project-detail-body">
        <p class="empty-state">Project details not available.</p>
      </div>
    </template>
    <template #footer></template>
    <!-- Provide empty footer slot to prevent default -->
  </BaseModal>
  <!-- Close the main BaseModal HERE -->

  <!-- Nested Modals: Render them OUTSIDE the main BaseModal structure -->
  <AddTaskModal :show="showAddTaskModal" @close="closeAddTaskModal" size="small-centered" />
  <EditTaskModal
    :show="showEditTaskModal"
    :task="taskToEdit"
    @close="closeEditTaskModal"
    size="small-centered"
  />
</template>

<script setup lang="ts">
import { ref, watch, type PropType, onUnmounted, defineAsyncComponent } from 'vue' // Import defineAsyncComponent
import BaseModal from '@/components/BaseModal.vue'
// Removed unused import: import TaskCard from '@/components/TaskCard.vue'
import ProjectDetailHeader from '@/components/ProjectDetailHeader.vue' // Import the new header component
import TaskList from '@/components/TaskList.vue' // Import the new TaskList component
// Remove static import: import EditTaskModal from '@/components/EditTaskModal.vue'
import AddTaskModal from '@/components/AddTaskModal.vue' // Import AddTaskModal
import type { Project } from '@/types/project'
// Removed TaskStatus import below
import { useTaskStore } from '@/stores/taskStore'
// Removed unused import: import { useTaskForm } from '@/composables/useTaskForm'
import type { Task } from '@/types/task' // Removed unused 'TaskStatus' import

// Dynamically import EditTaskModal
const EditTaskModal = defineAsyncComponent(() => import('@/components/EditTaskModal.vue'))
// Removed TaskDetailsModal import

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  project: {
    type: Object as PropType<Project | null>,
    default: null,
  },
})

const emit = defineEmits(['close'])

const taskStore = useTaskStore()

// Remove the duplicated useTaskForm instance for adding tasks
/*
const {
  taskData: addTaskData,
  loading: isAddingTask,
  error: addTaskError,
  statusOptions,
  resetForm: resetAddTaskForm,
  submitForm: submitAddTaskForm,
} = useTaskForm()
*/

// State for Add Task Modal visibility
const showAddTaskModal = ref(false)

// State for Edit Task Modal (nested) - Keep separate for now
const showEditTaskModal = ref(false)
const taskToEdit = ref<Task | null>(null)

// Removed Task Details Modal state

// Watch the project prop to subscribe/unsubscribe to tasks
watch(
  () => props.project,
  (newProject, oldProject) => {
    if (newProject && newProject.id !== oldProject?.id) {
      // Subscribe to tasks for the new project
      taskStore.subscribeToTasksForProject(newProject.id)
    } else if (!newProject && oldProject) {
      // Unsubscribe when project becomes null (modal closes)
      taskStore.unsubscribeFromTasks()
    }
  },
  { immediate: true }, // Run immediately if a project is initially passed
)

// Ensure unsubscribe on component unmount as a fallback
onUnmounted(() => {
  taskStore.unsubscribeFromTasks()
})

function closeModal() {
  // Optionally add logic to prevent closing if saving
  emit('close')
}

// Functions to manage Add Task Modal visibility
const openAddTaskModal = () => {
  // No need to reset form here, AddTaskModal handles its own state via useTaskForm
  showAddTaskModal.value = true
}

const closeAddTaskModal = () => {
  showAddTaskModal.value = false
}

// Remove duplicated handleAddNewTask function
/*
const handleAddNewTask = async () => {
  // ... removed ...
}
*/

// Functions to manage Edit Task Modal (nested) - Unchanged for now
function handleEditTask(taskId: string) {
  const task = taskStore.tasks.find((t) => t.id === taskId)
  if (task) {
    taskToEdit.value = task
    showEditTaskModal.value = true
  } else {
    console.error(`Task with ID ${taskId} not found for editing.`)
    // Optionally show a user-facing error
  }
}

function closeEditTaskModal() {
  showEditTaskModal.value = false
  taskToEdit.value = null // Clear the task being edited
}

// Removed Task Details Modal functions
</script>

<style scoped>
/* Apply width and remove max-width for an expansive modal */
/* Target outer modal container via the class added to the BaseModal component */
.modal-expansive :deep(.base-modal-container) {
  width: 95%; /* Set width to 95% of viewport width */
  max-width: none; /* Remove the max-width constraint from BaseModal */
  height: 100%; /* Set height to 100% */
}

.project-detail-body {
  overflow-y: auto; /* Keep overflow-y: auto here for the main scrollable content */
  flex-grow: 1; /* Allow body to take up remaining space */
}

/* Styles for nested modals (Add/Edit Task) */
/* These will inherit BaseModal styles. Sizing is handled by the size prop passed to AddTaskModal/EditTaskModal */

/* Input, textarea, select styles for the Add Task modal form (if needed, but likely inherited) */
/* #add-task-form-modal input[type='text'], ... */

.error-message {
  color: var(--color-error);
  margin-top: 0.5rem;
  font-size: 0.9rem;
  text-align: center;
}

/* List transition styles - Inherited from global or ProjectListView if needed */
/* .list-enter-active, .list-leave-active, ... */
</style>
