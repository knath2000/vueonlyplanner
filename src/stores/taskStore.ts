import { defineStore } from 'pinia'
import { ref, watch } from 'vue' // Import watch
import { supabase } from '@/supabase' // Import the supabase client
// Remove Firestore imports
import { useAuthStore } from './authStore' // Import authStore
import type { Task, TaskStatus, TaskData } from '@/types/task' // Import Task, TaskStatus, and TaskData types
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js' // Import Realtime types

// Define Task Status based on the plan (Section 4.1)
// Moved to types/task.ts

// Define the Task interface
// Moved to types/task.ts

export const useTaskStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const loading = ref(false) // Loading state for tasks of the *current* project
  const error = ref<string | null>(null)
  const currentProjectId = ref<string | null>(null) // Track current subscribed project
  const allUserTasks = ref<Pick<Task, 'id' | 'status'>[]>([]) // Minimal task data for dashboard counts
  const loadingAllTasks = ref(false) // Loading state for allUserTasks

  // Supabase Realtime channel
  let tasksChannel: RealtimeChannel | null = null // Explicitly type tasksChannel

  const authStore = useAuthStore() // Get auth store instance

  // --- Actions ---

  // Subscribe to real-time task updates for a specific project
  async function subscribeToTasksForProject(projectId: string) {
    if (currentProjectId.value === projectId && tasksChannel) {
      console.log(`Already subscribed to tasks for project ${projectId}`)
      return // Avoid re-subscribing to the same project
    }

    // Unsubscribe from previous project's tasks first, if any
    unsubscribeFromTasks()

    await authStore.authLoadedPromise // Wait for auth state to load

    if (!authStore.currentUser) {
      console.log('User not authenticated, cannot subscribe to tasks.')
      loading.value = false
      return
    }

    currentProjectId.value = projectId // Track the new project ID
    loading.value = true
    error.value = null
    tasks.value = [] // Clear tasks from previous project

    console.log(`Subscribing to tasks for project ${projectId}`)

    // Supabase Realtime subscription
    tasksChannel = supabase
      .channel(`public:tasks:project_id=eq.${projectId}`) // Unique channel name per project
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `project_id=eq.${projectId}` }, // Filter by project_id
        (payload: RealtimePostgresChangesPayload<Task>) => {
          // Explicitly type payload
          console.log('Task change received!', payload)
          // Handle different event types (INSERT, UPDATE, DELETE)
          if (payload.eventType === 'INSERT') {
            tasks.value.push(payload.new as Task) // Add new task
          } else if (payload.eventType === 'UPDATE') {
            const index = tasks.value.findIndex((t: Task) => t.id === payload.old.id) // Explicitly type t
            if (index !== -1) {
              tasks.value[index] = payload.new as Task // Update task
            }
          } else if (payload.eventType === 'DELETE') {
            tasks.value = tasks.value.filter((t: Task) => t.id !== payload.old.id) // Remove task
          }
        },
      )
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to tasks channel for project ${projectId}`)
          // Initial data fetch after subscription
          const { data, error: fetchError } = await supabase
            .from('tasks')
            .select('*')
            .eq('project_id', projectId)
            .eq('user_id', authStore.currentUser!.id) // Filter initial fetch by user_id, added non-null assertion
            .order('created_at', { ascending: true }) // Order by created_at

          if (fetchError) {
            console.error(`Error fetching initial tasks for project ${projectId}:`, fetchError)
            error.value = 'Failed to fetch tasks.'
          } else {
            tasks.value = data as Task[]
            loading.value = false // Loading finished after initial fetch
          }
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`Error subscribing to tasks channel for project ${projectId}`)
          error.value = 'Failed to subscribe to task updates.'
          loading.value = false
          currentProjectId.value = null // Reset current project ID on error
        }
      })
  }

  // Unsubscribe from task listener
  function unsubscribeFromTasks() {
    if (tasksChannel) {
      supabase.removeChannel(tasksChannel)
      tasksChannel = null
      currentProjectId.value = null // Clear tracked project ID
      tasks.value = [] // Clear tasks on unsubscribe
      console.log('Unsubscribed from tasks')
    }
  }

  // Watch for authentication changes (primarily for logout cleanup)
  watch(
    () => authStore.currentUser,
    (newUser, oldUser) => {
      if (!newUser && oldUser) {
        // User logged out
        console.log('Auth state changed: User logged out, unsubscribing from tasks.')
        unsubscribeFromTasks()
        allUserTasks.value = [] // Clear global task list on logout
        loadingAllTasks.value = false // Reset loading state
      }
      // No automatic subscription on login here; requires explicit project selection
    },
    { immediate: false },
  )

  // Add Task
  // Explicitly define the expected input type, including new fields
  async function addTask(newTaskData: TaskData) {
    // No loading state change here, handled by onSnapshot visually
    error.value = null

    if (!authStore.currentUser) {
      console.error('User not authenticated, cannot add task.')
      error.value = 'User not authenticated.'
      return null
    }

    if (!currentProjectId.value) {
      console.error('No project selected, cannot add task.')
      error.value = 'No project selected.'
      return null
    }

    try {
      const { data, error: insertError } = await supabase
        .from('tasks')
        .insert({
          ...newTaskData,
          project_id: currentProjectId.value, // Use currentProjectId
          user_id: authStore.currentUser.id, // Use authStore.currentUser.id
          // created_at and updated_at will be set by database defaults
        })
        .select() // Select the inserted row to get its ID and timestamps

      if (insertError) throw insertError

      // Realtime subscription will add the new task to the state
      return data?.[0]?.id || null
    } catch (err: unknown) {
      // Catch as unknown
      console.error('Error adding task:', err)
      error.value = err instanceof Error ? err.message : 'An unknown error occurred.'
      return null
    }
  }

  // Update Task
  async function updateTask(
    id: string,
    updatedData: Partial<
      Omit<Task, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'justUpdated'>
    >,
  ) {
    // No loading state change here
    error.value = null

    if (!authStore.currentUser) {
      console.error('User not authenticated, cannot update task.')
      error.value = 'User not authenticated.'
      return
    }

    try {
      const { error: updateError } = await supabase
        .from('tasks')
        .update({
          ...updatedData,
          // updated_at will be set by database default
        })
        .eq('id', id)
        .eq('user_id', authStore.currentUser.id) // Ensure user owns the task

      if (updateError) throw updateError

      // Realtime subscription will update the task in the state
    } catch (err: unknown) {
      // Catch as unknown
      console.error('Error updating task:', err)
      error.value = err instanceof Error ? err.message : 'An unknown error occurred.'
    }
  }

  // Delete Task
  async function deleteTask(id: string) {
    // No loading state change here
    error.value = null

    if (!authStore.currentUser) {
      console.error('User not authenticated, cannot delete task.')
      error.value = 'User not authenticated.'
      return
    }

    try {
      const { error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', authStore.currentUser.id) // Ensure user owns the task

      if (deleteError) throw deleteError

      // Realtime subscription will remove the task from the state
    } catch (err: unknown) {
      // Catch as unknown
      console.error('Error deleting task:', err)
      error.value = err instanceof Error ? err.message : 'An unknown error occurred.'
    }
  }

  // Fetch all tasks (id, status) for the current user - for dashboard counts
  async function fetchAllUserTasks() {
    if (!authStore.currentUser) {
      console.log('User not authenticated, cannot fetch all tasks.')
      allUserTasks.value = []
      return
    }

    console.log('Fetching all user tasks (id, status) for dashboard count...')
    loadingAllTasks.value = true
    error.value = null // Clear previous general errors

    try {
      const { data, error: fetchError } = await supabase
        .from('tasks')
        .select('id, status') // Select only needed fields
        .eq('user_id', authStore.currentUser.id)

      if (fetchError) {
        console.error('Error fetching all user tasks:', fetchError)
        error.value = 'Failed to load task counts.' // Set general error
        allUserTasks.value = []
      } else {
        allUserTasks.value = data as Pick<Task, 'id' | 'status'>[]
        console.log(`Fetched ${allUserTasks.value.length} tasks for dashboard count.`)
      }
    } catch (err) {
      console.error('Unexpected error fetching all user tasks:', err)
      error.value = 'An unexpected error occurred while loading task counts.'
      allUserTasks.value = []
    } finally {
      loadingAllTasks.value = false
    }
  }

  // --- Getters ---
  // (Can add getters later, e.g., getTasksByStatus)

  return {
    tasks,
    loading, // Loading state for current project tasks
    error,
    currentProjectId,
    allUserTasks, // State for dashboard counts
    loadingAllTasks, // Loading state for dashboard counts
    subscribeToTasksForProject,
    unsubscribeFromTasks,
    fetchAllUserTasks, // Action for dashboard counts
    addTask,
    updateTask,
    deleteTask,
  }
})
