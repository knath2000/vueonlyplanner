import { defineStore } from 'pinia'
import { ref, watch } from 'vue' // Import watch
import { supabase } from '@/supabase' // Import the supabase client
import { useAuthStore } from './authStore' // Import authStore
import { useTaskStore } from './taskStore' // Import taskStore
import type { Project } from '@/types/project'
import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
  REALTIME_SUBSCRIBE_STATES, // Import the status type
} from '@supabase/supabase-js'

export const useProjectStore = defineStore('projects', () => {
  const projects = ref<Project[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const projectsLoaded = ref(false) // Add state to track if projects have been loaded

  // Supabase Realtime channel
  let projectsChannel: RealtimeChannel | null = null // Explicitly type projectsChannel
  let retryTimeoutId: ReturnType<typeof setTimeout> | null = null // To manage retry timeout

  const authStore = useAuthStore() // Get auth store instance
  const taskStore = useTaskStore() // Get task store instance

  // --- Helper to handle reconnection ---
  function scheduleReconnection() {
    // Clear existing timeout if any
    if (retryTimeoutId) {
      clearTimeout(retryTimeoutId)
      retryTimeoutId = null
    }
    // Schedule a new attempt
    retryTimeoutId = setTimeout(async () => {
      console.log('Attempting to resubscribe to projects channel...')
      await subscribeToProjects() // Use await here
    }, 5000) // Retry after 5 seconds
  }

  // --- Actions ---

  // Unsubscribe and clean up
  async function unsubscribeFromProjects() {
    if (retryTimeoutId) {
      clearTimeout(retryTimeoutId) // Clear pending retry on explicit unsubscribe
      retryTimeoutId = null
    }
    if (projectsChannel) {
      try {
        await supabase.removeChannel(projectsChannel)
        console.log('Unsubscribed from projects')
      } catch (removeError) {
        console.error('Error removing projects channel:', removeError)
      } finally {
        projectsChannel = null
        projects.value = [] // Clear projects
        loading.value = false
        projectsLoaded.value = false // Reset loaded status
        // Don't clear error here, let the next subscribe attempt handle it
      }
    } else {
      // Ensure data is cleared even if channel wasn't assigned
      projects.value = []
      loading.value = false
      projectsLoaded.value = false
    }
  }

  // Subscribe to real-time project updates
  async function subscribeToProjects() {
    // 1. Check authentication (Removed explicit unsubscribe - channel() handles replacement)
    await authStore.authLoadedPromise
    if (!authStore.currentUser) {
      console.log('User not authenticated, cannot subscribe to projects.')
      loading.value = false
      projectsLoaded.value = false
      return
    }

    // 3. Set initial state for new subscription attempt
    loading.value = true
    error.value = null // Clear previous errors

    // 4. Create and configure the new channel
    projectsChannel = supabase
      .channel('public:projects')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `user_id=eq.${authStore.currentUser.id}`,
        },
        (payload: RealtimePostgresChangesPayload<Project>) => {
          console.log('Project change received!', payload)
          if (payload.eventType === 'INSERT') {
            // Avoid duplicates if initial fetch hasn't completed
            if (!projects.value.some((p) => p.id === (payload.new as Project).id)) {
              projects.value.unshift(payload.new as Project)
            }
          } else if (payload.eventType === 'UPDATE') {
            const index = projects.value.findIndex((p) => p.id === payload.old.id)
            if (index !== -1) {
              projects.value[index] = payload.new as Project
            }
          } else if (payload.eventType === 'DELETE') {
            projects.value = projects.value.filter((p) => p.id !== payload.old.id)
          }
        },
      )
      .subscribe(async (status: REALTIME_SUBSCRIBE_STATES) => {
        // 5. Handle subscription status changes
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to projects channel')
          error.value = null // Clear any previous error messages
          // Initial data fetch only needed if projects array is empty
          if (projects.value.length === 0) {
            console.log('Projects array is empty, fetching initial data...')
            const { data, error: fetchError } = await supabase
              .from('projects')
              .select('*')
              .eq('user_id', authStore.currentUser!.id)
              .order('created_at', { ascending: false })

            if (fetchError) {
              console.error('Error fetching initial projects:', fetchError)
              error.value = 'Failed to fetch projects.'
              loading.value = false
              projects.value = [] // Clear potentially partial data
              projectsLoaded.value = false
            } else {
              projects.value = data as Project[]
              loading.value = false
              projectsLoaded.value = true
              console.log('Initial projects fetched.')
              // Fetch dashboard tasks only after initial projects load
              taskStore.fetchAllUserTasks()
            }
          } else {
            // Projects already exist, assume realtime updates will handle changes.
            console.log('Projects already loaded, skipping initial fetch.')
            loading.value = false // Ensure loading is false
            // Ensure projectsLoaded is true if we skipped fetch but have projects
            if (!projectsLoaded.value) projectsLoaded.value = true
          }
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to projects channel (CHANNEL_ERROR status)')
          error.value = 'Project connection failed. Retrying...' // Keep error message
          loading.value = false // Stop loading indicator
          // DO NOT clear projects.value or projectsLoaded here
          scheduleReconnection() // Attempt to reconnect
        } else if (status === 'CLOSED' || status === 'TIMED_OUT') {
          console.log(`Project channel ${status}. Attempting to re-subscribe...`)
          // Only set error if not already trying to reconnect
          if (!retryTimeoutId) {
            error.value = 'Project connection closed/timed out. Retrying...' // Keep error message
          }
          loading.value = false // Stop loading indicator
          // DO NOT clear projects.value or projectsLoaded here
          scheduleReconnection() // Attempt to reconnect
        }
      })
  }

  // Watch for authentication changes
  watch(
    () => authStore.currentUser,
    (newUser, oldUser) => {
      if (newUser && !oldUser) {
        console.log('Auth state changed: User logged in, subscribing to projects.')
        subscribeToProjects()
      } else if (!newUser && oldUser) {
        console.log('Auth state changed: User logged out, unsubscribing from projects.')
        unsubscribeFromProjects()
      }
    },
    { immediate: false }, // Don't run immediately, let subscribeToProjects handle initial load check
  )

  // Add Project
  async function addProject(
    newProjectData: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'user_id'>,
  ) {
    loading.value = true
    error.value = null

    if (!authStore.currentUser) {
      console.error('User not authenticated, cannot add project.')
      error.value = 'User not authenticated.'
      loading.value = false
      return null
    }

    try {
      const { data, error: insertError } = await supabase
        .from('projects')
        .insert({
          ...newProjectData,
          user_id: authStore.currentUser.id, // Use authStore.currentUser.id
          // created_at and updated_at will be set by database defaults
        })
        .select() // Select the inserted row to get its ID and timestamps

      if (insertError) throw insertError

      // Realtime subscription will add the new project to the state
      return data?.[0]?.id || null // Return the ID
    } catch (err: unknown) {
      // Catch as unknown
      console.error('Error adding project:', err)
      error.value = err instanceof Error ? err.message : 'An unknown error occurred.' // Safely access message
      return null
    } finally {
      loading.value = false
    }
  }

  // Update Project
  async function updateProject(
    id: string,
    updatedData: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at' | 'user_id'>>, // Updated Omit type
  ) {
    // No loading state change here, let realtime handle UI update
    error.value = null

    if (!authStore.currentUser) {
      console.error('User not authenticated, cannot update project.')
      error.value = 'User not authenticated.'
      return
    }

    try {
      const { error: updateError } = await supabase
        .from('projects')
        .update({ ...updatedData })
        .eq('id', id)
        .eq('user_id', authStore.currentUser.id) // Ensure user owns the project

      if (updateError) throw updateError

      // Realtime subscription will update the project in the state
    } catch (err: unknown) {
      // Catch as unknown
      console.error('Error updating project:', err)
      error.value = err instanceof Error ? err.message : 'An unknown error occurred.' // Safely access message
    }
  }

  // Delete Project
  async function deleteProject(id: string) {
    // No loading state change here, let realtime handle UI update
    error.value = null

    if (!authStore.currentUser) {
      console.error('User not authenticated, cannot delete project.')
      error.value = 'User not authenticated.'
      return
    }

    try {
      const { error: deleteError } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('user_id', authStore.currentUser.id) // Ensure user owns the project

      if (deleteError) throw deleteError

      // Manually remove the project from the local state for immediate UI update
      projects.value = projects.value.filter((p) => p.id !== id)
      console.log(`Project ${id} removed locally after successful delete.`)

      // Realtime subscription will also remove the project (ensuring consistency)
    } catch (err: unknown) {
      // Catch as unknown
      console.error('Error deleting project:', err)
      error.value = err instanceof Error ? err.message : 'An unknown error occurred.' // Safely access message
    }
  }

  // --- Getters ---
  // (Can add getters later if needed, e.g., getProjectById)

  return {
    projects,
    loading,
    error,
    projectsLoaded, // Export projectsLoaded state
    subscribeToProjects,
    unsubscribeFromProjects,
    addProject,
    updateProject,
    deleteProject,
  }
})
