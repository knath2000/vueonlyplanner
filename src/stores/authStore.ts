import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/supabase' // Import the supabase client
import type { User } from '@supabase/supabase-js' // Import Supabase User type
import useAuth from '@/composables/useAuth' // Import the auth composable
import { useProjectStore } from './projectStore' // Import projectStore

let resolveAuthLoaded: (value?: unknown) => void
const authLoadedPromise = new Promise((resolve) => {
  resolveAuthLoaded = resolve
})

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<User | null>(null)
  const loading = ref<boolean>(true) // Initially loading while checking auth state
  const error = ref<string | null>(null)

  const {
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    // signInAnonymously is removed
    signOutUser,
    error: authError,
  } = useAuth() // Use the auth composable

  // Listen for auth state changes using Supabase
  supabase.auth.onAuthStateChange((event, session) => {
    currentUser.value = session?.user ?? null
    loading.value = false // Set loading to false after initial check
    resolveAuthLoaded() // Resolve the promise

    // If a session exists (user is logged in or session restored), trigger initial data fetch
    if (session) {
      console.log('Auth state changed: Session found, triggering initial data fetch.')
      const projectStore = useProjectStore()
      // Call subscribeToProjects which handles the initial fetch
      projectStore.subscribeToProjects()
    } else {
      console.log('Auth state changed: No session found.')
      // Optional: Clear data in other stores on explicit logout if not handled by their watchers
      // const projectStore = useProjectStore();
      // projectStore.clearProjects(); // Assuming a clearProjects action exists
      // const taskStore = useTaskStore(); // Assuming useTaskStore is imported
      // taskStore.clearTasks(); // Assuming a clearTasks action exists
    }

    // No automatic anonymous sign-in with Supabase
  })

  // Actions for login, logout, etc.
  const login = async (email: string, password: string) => {
    error.value = null // Clear previous errors
    await signInWithEmail(email, password)
    error.value = authError.value // Propagate error from composable
  }

  const logout = async () => {
    error.value = null // Clear previous errors
    await signOutUser()
    error.value = authError.value // Propagate error from composable
  }

  const register = async (email: string, password: string) => {
    error.value = null // Clear previous errors
    await signUpWithEmail(email, password)
    error.value = authError.value // Propagate error from composable
  }

  // Optional: Google Sign-In action
  const signInWithGoogleAction = async () => {
    error.value = null // Clear previous errors
    await signInWithGoogle()
    error.value = authError.value // Propagate error from composable
  }

  return {
    currentUser,
    loading,
    error,
    login,
    logout,
    register,
    signInWithGoogleAction, // Export Google Sign-In action
    // signInAnonymously is removed
    authLoadedPromise, // Export the promise
  }
})
