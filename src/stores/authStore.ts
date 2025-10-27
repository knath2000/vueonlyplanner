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

  // Initialize Stack client for Neon Auth with error handling
  let stackClient: StackClientApp | null = null

  try {
    const projectId = import.meta.env.VITE_STACK_PROJECT_ID
    const publishableKey = import.meta.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY

    if (!projectId || !publishableKey) {
      console.error('Neon Auth: Missing required environment variables')
      console.error('VITE_STACK_PROJECT_ID:', projectId ? '✓ Set' : '✗ Missing')
      console.error('VITE_STACK_PUBLISHABLE_CLIENT_KEY:', publishableKey ? '✓ Set' : '✗ Missing')
      throw new Error('Neon Auth environment variables not configured')
    }

    stackClient = new StackClientApp({
      projectId,
      publishableClientKey: publishableKey,
      tokenStore: "cookie"
    })
  } catch (err) {
    console.error('Failed to initialize Neon Auth client:', err)
    error.value = 'Authentication service not configured'
    loading.value = false
    resolveAuthLoaded()
  }

  const {
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    signOutUser,
    error: authError,
  } = useAuth() // Use the auth composable

  // Initialize auth state on store creation
  const initializeAuth = async () => {
    if (!stackClient) {
      console.error('Cannot initialize auth: Stack client not available')
      return
    }

    try {
      const user = await stackClient.getUser({ or: "return-null" })
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

  // Call initialize only if stackClient is available
  if (stackClient) {
    initializeAuth()
  }

  // Actions for login, logout, etc.
  const login = async (email: string, password: string) => {
    if (!stackClient) {
      error.value = 'Authentication service not available'
      return
    }

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
    if (!stackClient) {
      error.value = 'Authentication service not available'
      return
    }

    error.value = null // Clear previous errors
    await signUpWithEmail(email, password)
    error.value = authError.value // Propagate error from composable
  }

  // Optional: Google Sign-In action
  const signInWithGoogleAction = async () => {
    if (!stackClient) {
      error.value = 'Authentication service not available'
      return
    }

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
