import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { supabase } from '@/supabase'
import { useAuthStore } from './authStore'
import type { Task, TaskData } from '@/types/task' // Removed unused TaskStatus
import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
  REALTIME_SUBSCRIBE_STATES, // Import status type
} from '@supabase/supabase-js'

export const useTaskStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const loading = ref(false) // Loading state for tasks of the *current* project
  const error = ref<string | null>(null)
  const currentProjectId = ref<string | null>(null) // Track current subscribed project
  const allUserTasks = ref<Pick<Task, 'id' | 'status'>[]>([]) // Minimal task data for dashboard counts
  const loadingAllTasks = ref(false) // Loading state for allUserTasks

  // Supabase Realtime channel
  let tasksChannel: RealtimeChannel | null = null // Explicitly type tasksChannel
  let retryTimeoutId: ReturnType<typeof setTimeout> | null = null // Added for task retries

  const authStore = useAuthStore() // Get auth store instance

  // --- Helper to handle task reconnection ---
  function scheduleReconnection(projectId: string) {
    if (!projectId) return // Don't schedule if projectId is invalid
    // Clear existing timeout if any
    if (retryTimeoutId) {
      clearTimeout(retryTimeoutId)
      retryTimeoutId = null
    }
    // Schedule a new attempt
    retryTimeoutId = setTimeout(async () => {
      console.log(`Attempting to resubscribe to tasks channel for project ${projectId}...`)
      await subscribeToTasksForProject(projectId) // Use await
    }, 5000) // Retry after 5 seconds
  }

  // --- Actions ---

  // Unsubscribe and clean up task listener
  async function unsubscribeFromTasks() {
    // Make async
    if (retryTimeoutId) {
      clearTimeout(retryTimeoutId) // Clear pending retry
      retryTimeoutId = null
    }
    if (tasksChannel) {
      try {
        await supabase.removeChannel(tasksChannel)
        console.log(`Unsubscribed from tasks for project ${currentProjectId.value}`)
      } catch (removeError) {
        console.error('Error removing tasks channel:', removeError)
      } finally {
        tasksChannel = null
        currentProjectId.value = null // Clear tracked project ID
        tasks.value = [] // Clear tasks
        loading.value = false
        // Don't clear error here
      }
    } else {
      // Ensure data is cleared even if channel wasn't assigned
      currentProjectId.value = null
      tasks.value = []
      loading.value = false
    }
  }

  // Subscribe to real-time task updates for a specific project
  async function subscribeToTasksForProject(projectId: string) {
    // 1. Cleanup existing channel first
    // Avoid unsubscribing if we are trying to subscribe to the *same* project again (e.g., during retry)
    if (tasksChannel && currentProjectId.value !== projectId) {
      console.log(`Switching task subscription from ${currentProjectId.value} to ${projectId}.`)
      await unsubscribeFromTasks()
    } else if (tasksChannel && currentProjectId.value === projectId) {
      console.log(`Already subscribed to tasks for project ${projectId}, skipping redundant setup.`)
      // If already subscribed, maybe just ensure loading is false and error is null?
      // Or potentially force a refresh? For now, just return.
      // Consider adding a forceRefresh parameter if needed later.
      loading.value = false // Ensure loading is false if already subscribed
      return
    }

    // 2. Check authentication
    await authStore.authLoadedPromise
    if (!authStore.currentUser) {
      console.log('User not authenticated, cannot subscribe to tasks.')
      loading.value = false
      return
    }

    // 3. Set initial state for new subscription attempt
    console.log(`Subscribing to tasks for project ${projectId}`)
    currentProjectId.value = projectId // Track the new project ID
    loading.value = true
    error.value = null
    tasks.value = [] // Clear tasks from previous project

    // 4. Create and configure the new channel
    tasksChannel = supabase
      .channel(`public:tasks:project_id=eq.${projectId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `project_id=eq.${projectId}` },
        (payload: RealtimePostgresChangesPayload<Task>) => {
          console.log('Task change received!', payload)
          if (payload.eventType === 'INSERT') {
            // Avoid duplicates if initial fetch hasn't completed
            if (!tasks.value.some((t) => t.id === (payload.new as Task).id)) {
              tasks.value.push(payload.new as Task)
            }
          } else if (payload.eventType === 'UPDATE') {
            const index = tasks.value.findIndex((t) => t.id === payload.old.id)
            if (index !== -1) {
              tasks.value[index] = payload.new as Task
            }
          } else if (payload.eventType === 'DELETE') {
            tasks.value = tasks.value.filter((t) => t.id !== payload.old.id)
          }
        },
      )
      .subscribe(async (status: REALTIME_SUBSCRIBE_STATES) => {
        // 5. Handle subscription status changes
        if (status === 'SUBSCRIBED') {
          console.log(`Successfully subscribed to tasks channel for project ${projectId}`)
          error.value = null // Clear error on success
          // Initial data fetch after subscription
          const { data, error: fetchError } = await supabase
            .from('tasks')
            .select('*')
            .eq('project_id', projectId)
            .eq('user_id', authStore.currentUser!.id)
            .order('created_at', { ascending: true })

          if (fetchError) {
            console.error(`Error fetching initial tasks for project ${projectId}:`, fetchError)
            error.value = 'Failed to fetch tasks.'
            tasks.value = [] // Clear potentially partial data
          } else {
            tasks.value = data as Task[]
            console.log(`Initial tasks fetched for project ${projectId}.`)
          }
          loading.value = false // Loading finished after initial fetch or error
        } else if (status === 'CHANNEL_ERROR') {
          console.error(
            `Error subscribing to tasks channel for project ${projectId} (CHANNEL_ERROR status)`,
          )
          error.value = 'Task connection failed. Retrying...'
          loading.value = false
          tasks.value = [] // Clear stale data
          currentProjectId.value = null // Reset project ID as subscription failed
          scheduleReconnection(projectId) // Attempt to reconnect
        } else if (status === 'CLOSED' || status === 'TIMED_OUT') {
          console.log(
            `Task channel for project ${projectId} ${status}. Attempting to re-subscribe...`,
          )
          // Only set error if not already trying to reconnect
          if (!retryTimeoutId) {
            error.value = 'Task connection closed/timed out. Retrying...'
          }
          loading.value = false
          tasks.value = [] // Clear stale data
          currentProjectId.value = null // Reset project ID
          scheduleReconnection(projectId) // Attempt to reconnect
        }
      })
  }

  // Watch for authentication changes (primarily for logout cleanup)
  watch(
    () => authStore.currentUser,
    (newUser, oldUser) => {
      if (!newUser && oldUser) {
        console.log('Auth state changed: User logged out, unsubscribing from tasks.')
        unsubscribeFromTasks()
        allUserTasks.value = []
        loadingAllTasks.value = false
      }
    },
    { immediate: false },
  )

  // Add Task
  async function addTask(newTaskData: TaskData) {
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
        .update({ ...updatedData })
        .eq('id', id)
        .eq('user_id', authStore.currentUser?.id) // Ensure user owns the task (using optional chaining)

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
        .eq('user_id', authStore.currentUser?.id) // Ensure user owns the task (using optional chaining)

      if (deleteError) throw deleteError

      // Manually remove the task from the local state for immediate UI update
      tasks.value = tasks.value.filter((t) => t.id !== id)
      console.log(`Task ${id} removed locally after successful delete.`)

      // Realtime subscription will also remove the task (ensuring consistency)
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
