import { defineStore } from 'pinia'
import { ref, watch } from 'vue' // Import watch
import { supabase } from '@/supabase' // Import the supabase client
// Remove Firestore imports
import { useAuthStore } from './authStore' // Import authStore
import { useTaskStore } from './taskStore' // Import taskStore
import type { Project } from '@/types/project' // Assuming you have a types file for Project
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js' // Import Realtime types

// Define the Project interface based on the plan (Section 4.1)
// Moved to types/project.ts

export const useProjectStore = defineStore('projects', () => {
  const projects = ref<Project[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const projectsLoaded = ref(false) // Add state to track if projects have been loaded

  // Supabase Realtime channel
  let projectsChannel: RealtimeChannel | null = null // Explicitly type projectsChannel

  const authStore = useAuthStore() // Get auth store instance
  const taskStore = useTaskStore() // Get task store instance

  // --- Actions ---

  // Subscribe to real-time project updates
  async function subscribeToProjects() {
    if (projectsChannel) {
      console.log('Already subscribed to projects')
      return // Avoid multiple subscriptions
    }

    await authStore.authLoadedPromise // Wait for auth state to load

    if (!authStore.currentUser) {
      console.log('User not authenticated, cannot subscribe to projects.')
      loading.value = false
      return
    }

    loading.value = true // Indicate initial loading
    error.value = null

    // Supabase Realtime subscription
    projectsChannel = supabase
      .channel('public:projects') // Channel name, can be table name
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `user_id=eq.${authStore.currentUser.id}`,
        }, // Filter by user_id
        (payload: RealtimePostgresChangesPayload<Project>) => {
          // Explicitly type payload
          console.log('Change received!', payload)
          // Handle different event types (INSERT, UPDATE, DELETE)
          if (payload.eventType === 'INSERT') {
            projects.value.unshift(payload.new as Project) // Add new project
          } else if (payload.eventType === 'UPDATE') {
            const index = projects.value.findIndex((p: Project) => p.id === payload.old.id) // Explicitly type p
            if (index !== -1) {
              projects.value[index] = payload.new as Project // Update project
            }
          } else if (payload.eventType === 'DELETE') {
            projects.value = projects.value.filter((p: Project) => p.id !== payload.old.id) // Explicitly type p
          }
        },
      )
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to projects channel')
          // Initial data fetch after subscription
          const { data, error: fetchError } = await supabase
            .from('projects')
            .select('*')
            .eq('user_id', authStore.currentUser!.id) // Filter initial fetch by user_id, added non-null assertion
            .order('created_at', { ascending: false }) // Order by created_at

          if (fetchError) {
            console.error('Error fetching initial projects:', fetchError)
            error.value = 'Failed to fetch projects.'
          } else {
            projects.value = data as Project[]
            loading.value = false // Loading finished after initial fetch
            projectsLoaded.value = true // Set projectsLoaded to true
            // Fetch all tasks for dashboard count *after* projects are loaded
            taskStore.fetchAllUserTasks()
          }
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to projects channel')
          error.value = 'Failed to subscribe to project updates.'
          loading.value = false
        } else if (status === 'CLOSED' || status === 'TIMED_OUT') {
          console.log(`Project channel ${status}. Attempting to re-subscribe...`)
          // Clean up the old channel and attempt to re-subscribe after a delay
          unsubscribeFromProjects() // Clean up
          setTimeout(() => {
            subscribeToProjects() // Attempt re-subscription
          }, 5000) // Retry after 5 seconds
        }
      })
  }

  // Unsubscribe when needed (e.g., on user logout or component unmount if store is instance-based)
  function unsubscribeFromProjects() {
    if (projectsChannel) {
      supabase.removeChannel(projectsChannel)
      projectsChannel = null
      projects.value = [] // Clear projects on unsubscribe
      console.log('Unsubscribed from projects')
    }
  }

  // Watch for authentication changes
  watch(
    () => authStore.currentUser,
    (newUser, oldUser) => {
      if (newUser && !oldUser) {
        // User logged in
        console.log('Auth state changed: User logged in, subscribing to projects.')
        subscribeToProjects()
      } else if (!newUser && oldUser) {
        // User logged out
        console.log('Auth state changed: User logged out, unsubscribing from projects.')
        unsubscribeFromProjects()
      }
      // Handle initial load case where user might already be logged in
      // This is covered by the initial check within subscribeToProjects using authLoadedPromise
    },
    { immediate: false }, // Don't run immediately, let subscribeToProjects handle initial load check
  )

  // Add Project
  async function addProject(
    newProjectData: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'user_id'>,
  ) {
    // Updated Omit type
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
    loading.value = true
    error.value = null

    if (!authStore.currentUser) {
      console.error('User not authenticated, cannot update project.')
      error.value = 'User not authenticated.'
      loading.value = false
      return
    }

    try {
      const { error: updateError } = await supabase
        .from('projects')
        .update({
          ...updatedData,
          // updated_at will be set by database default
        })
        .eq('id', id)
        .eq('user_id', authStore.currentUser.id) // Ensure user owns the project

      if (updateError) throw updateError

      // Realtime subscription will update the project in the state
    } catch (err: unknown) {
      // Catch as unknown
      console.error('Error updating project:', err)
      error.value = err instanceof Error ? err.message : 'An unknown error occurred.' // Safely access message
    } finally {
      loading.value = false
    }
  }

  // Delete Project
  async function deleteProject(id: string) {
    loading.value = true
    error.value = null

    if (!authStore.currentUser) {
      console.error('User not authenticated, cannot delete project.')
      error.value = 'User not authenticated.'
      loading.value = false
      return
    }

    try {
      const { error: deleteError } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('user_id', authStore.currentUser.id) // Ensure user owns the project

      if (deleteError) throw deleteError

      // Realtime subscription will remove the project from the state
    } catch (err: unknown) {
      // Catch as unknown
      console.error('Error deleting project:', err)
      error.value = err instanceof Error ? err.message : 'An unknown error occurred.' // Safely access message
    } finally {
      loading.value = false
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
