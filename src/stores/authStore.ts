import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { StackClientApp } from '@stackframe/stack'

// Initialize Stack client for Neon Auth
const stackClient = new StackClientApp({
  projectId: import.meta.env.VITE_STACK_PROJECT_ID,
  publishableClientKey: import.meta.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY,
  tokenStore: "cookie" // for Vue.js apps
})

export const useAuthStore = defineStore('auth', () => {
  // State
  const currentUser = ref<any | null>(null)
  const loading = ref(true) // Start with loading true
  const error = ref<string | null>(null)
  const authLoadedPromise = ref<Promise<void>>()

  // Initialize auth state
  const initAuth = async () => {
    if (authLoadedPromise.value) return authLoadedPromise.value

    authLoadedPromise.value = new Promise(async (resolve) => {
      try {
        loading.value = true
        error.value = null

        // Get current user from Stack
        const user = await stackClient.getUser()
        currentUser.value = user

        console.log('Auth initialized:', user ? 'User found' : 'No user')
      } catch (err: any) {
        console.error('Auth initialization error:', err)
        error.value = err.message || 'Failed to initialize authentication'
        currentUser.value = null
      } finally {
        loading.value = false
        resolve()
      }
    })

    return authLoadedPromise.value
  }

  // Login action
  const login = async (email: string, password: string) => {
    if (!stackClient) {
      error.value = 'Authentication service not available'
      return false
    }

    loading.value = true
    error.value = null

    try {
      const result = await stackClient.signInWithCredential({
        email,
        password,
        noRedirect: true
      })

      if (result.status === 'error') {
        error.value = result.error.message
        return false
      } else {
        currentUser.value = await stackClient.getUser()
        return true
      }
    } catch (err: any) {
      console.error('Login error:', err)
      error.value = err.message || 'Login failed'
      return false
    } finally {
      loading.value = false
    }
  }

  // Register action
  const register = async (email: string, password: string) => {
    if (!stackClient) {
      error.value = 'Authentication service not available'
      return false
    }

    loading.value = true
    error.value = null

    try {
      const result = await stackClient.signUpWithCredential({
        email,
        password,
        noRedirect: true
      })

      if (result.status === 'error') {
        error.value = result.error.message
        return false
      } else {
        currentUser.value = await stackClient.getUser()
        return true
      }
    } catch (err: any) {
      console.error('Registration error:', err)
      error.value = err.message || 'Registration failed'
      return false
    } finally {
      loading.value = false
    }
  }

  // Login with Google
  const loginWithGoogle = async () => {
    if (!stackClient) {
      error.value = 'Authentication service not available'
      return false
    }

    loading.value = true
    error.value = null

    try {
      await stackClient.signInWithOAuth('google')
      // OAuth redirects, user state will be updated on callback
      return true
    } catch (err: any) {
      console.error('Google login error:', err)
      error.value = err.message || 'Google login failed'
      return false
    } finally {
      loading.value = false
    }
  }

  // Logout action
  const logout = async () => {
    if (!stackClient) {
      error.value = 'Authentication service not available'
      return
    }

    error.value = null // Clear previous errors
    try {
      const user = await stackClient.getUser()
      if (user) {
        await user.signOut()
      }
      currentUser.value = null // Clear user immediately
    } catch (err: any) {
      console.error('Logout error:', err)
      error.value = err.message || 'Logout failed'
    }
  }

  // Initialize auth on store creation
  initAuth()

  // Computed
  const isAuthenticated = computed(() => currentUser.value !== null)

  return {
    // State
    currentUser,
    loading,
    error,
    authLoadedPromise,

    // Actions
    initAuth,
    login,
    register,
    loginWithGoogle,
    logout,

    // Computed
    isAuthenticated,
  }
})
