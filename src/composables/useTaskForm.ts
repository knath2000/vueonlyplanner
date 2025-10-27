import { ref, watch, computed, type Ref } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import type { Task, TaskStatus, TaskData, TaskPriority } from '@/types/task' // Import TaskPriority

// Define the shape of the returned value from the composable
interface UseTaskFormReturn {
  taskData: Ref<TaskData>
  loading: Ref<boolean>
  error: Ref<string | null>
  statusOptions: TaskStatus[]
  priorityOptions: TaskPriority[] // Add priority options
  isEditing: Ref<boolean>
  resetForm: () => void
  submitForm: () => Promise<boolean> // Returns true on success, false on failure
}

export function useTaskForm(initialTask?: Ref<Task | null>): UseTaskFormReturn {
  const taskStore = useTaskStore()

  const defaultTaskData: TaskData = {
    title: '',
    description: null, // Default to null
    status: 'To Do',
    due_date: null, // Default to null
    priority: null, // Default to null
  }

  // Reactive state for the form data
  const taskData = ref<TaskData>({ ...defaultTaskData })
  const loading = ref(false)
  const error = ref<string | null>(null)

  const statusOptions: TaskStatus[] = ['To Do', 'Debug', 'Add Feature', 'Done']
  const priorityOptions: TaskPriority[] = ['Low', 'Medium', 'High'] // Define priority options

  // Determine if we are in edit mode
  const isEditing = computed(() => !!initialTask?.value)

  // Function to reset the form to its default or initial state
  const resetForm = () => {
    if (isEditing.value && initialTask?.value) {
      // Reset to the initial task data for editing
      taskData.value = {
        title: initialTask.value.title,
        description: initialTask.value.description ?? null, // Handle potential null description
        status: initialTask.value.status,
        due_date: initialTask.value.due_date ?? null, // Handle potential null due_date
        priority: initialTask.value.priority ?? null, // Handle potential null priority
      }
    } else {
      // Reset to default for adding
      taskData.value = { ...defaultTaskData }
    }
    error.value = null
    loading.value = false
  }

  // Watch the initialTask prop to update the form when it changes (for editing)
  watch(
    initialTask || ref(null), // Watch the ref directly if provided, otherwise watch a dummy ref
    (newTask) => {
      if (newTask) {
        resetForm() // Reset form based on the new initial task
      } else {
        // If initialTask becomes null (e.g., modal closes), reset to default add state
        taskData.value = { ...defaultTaskData }
        error.value = null
      }
    },
    { immediate: true, deep: true }, // immediate to load initial data, deep might be needed if task object structure is complex
  )

  // Function to handle form submission (Add or Edit)
  const submitForm = async (): Promise<boolean> => {
    // Basic validation
    if (!taskData.value.title.trim()) {
      error.value = 'Task title is required.'
      return false
    }

    loading.value = true
    error.value = null

    try {
      if (isEditing.value && initialTask?.value) {
        // --- Edit Task ---
        const dataToUpdate: Partial<TaskData> = {
          title: taskData.value.title,
          description: taskData.value.description,
          status: taskData.value.status,
          due_date: taskData.value.due_date,
          priority: taskData.value.priority,
        }
        await taskStore.updateTask(initialTask.value.id, dataToUpdate)
      } else {
        // --- Add Task ---
        const dataToAdd: TaskData = {
          title: taskData.value.title,
          description: taskData.value.description,
          status: taskData.value.status,
          due_date: taskData.value.due_date,
          priority: taskData.value.priority,
        }
        await taskStore.addTask(dataToAdd)
      }

      loading.value = false

      if (taskStore.error) {
        error.value = taskStore.error
        return false
      } else {
        return true // Indicate success
      }
    } catch (err) {
      console.error(`Failed to ${isEditing.value ? 'update' : 'add'} task:`, err)
      loading.value = false
      error.value = err instanceof Error ? err.message : 'An unknown error occurred.'
      return false // Indicate failure
    }
  }

  return {
    taskData,
    loading,
    error,
    statusOptions,
    priorityOptions, // Return priority options
    isEditing,
    resetForm,
    submitForm,
  }
}
