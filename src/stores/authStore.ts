import { defineStore } from 'pinia'
import { ref } from 'vue'
import { StackClientApp } from '@stackframe/stack' // Import Stack SDK for Neon Auth
import useAuth from '@/composables/useAuth' // Import the auth composable
import { useProjectStore } from './projectStore' // Import projectStore

let resolveAuthLoaded: (value?: unknown) => void
const authLoadedPromise = new Promise((resolve) => {
  resolveAuthLoaded = resolve
})

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<any | null>(null) // Neon Auth user type
  const loading = ref<boolean>(true) // Initially loading while checking auth state
  const error = ref<string | null>(null)

  // Initialize Stack client for Neon Auth
  const stackClient = new StackClientApp(import.meta.env.VITE_STACK_PROJECT_ID)

  const {
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    signOutUser,
    error: authError,
  } = useAuth() // Use the auth composable

  // Initialize auth state on store creation
  const initializeAuth = async () => {
    try {
      const user = await stackClient.auth.getUser()
      currentUser.value = user
      loading.value = false
      resolveAuthLoaded()

      // If user exists, trigger initial data fetch
      if (user) {
        console.log('Auth state initialized: User found, triggering initial data fetch.')
        const projectStore = useProjectStore()
        projectStore.subscribeToProjects()
      } else {
        console.log('Auth state initialized: No user found.')
      }
    } catch (err) {
      console.error('Error initializing auth:', err)
      loading.value = false
      resolveAuthLoaded()
    }
  }

  // Call initialize on store creation
  initializeAuth()

  // Actions for login, logout, etc.
  const login = async (email: string, password: string) => {
    error.value = null // Clear previous errors
    await signInWithEmail(email, password)
    error.value = authError.value // Propagate error from composable
  }

  const logout = async () => {
    error.value = null // Clear previous errors
    await signOutUser()
    currentUser.value = null // Clear user immediately
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
    authLoadedPromise, // Export the promise
  }
})
