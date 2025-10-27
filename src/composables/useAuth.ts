import { ref } from 'vue'
import { StackClientApp } from '@stackframe/stack' // Import Stack SDK for Neon Auth

const useAuth = () => {
  const user = ref<any | null>(null) // Neon Auth user type
  const error = ref<string | null>(null)
  const loading = ref<boolean>(false)

  // Initialize Stack client for Neon Auth
  const stackClient = new StackClientApp({
    projectId: import.meta.env.VITE_STACK_PROJECT_ID,
    publishableClientKey: import.meta.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY,
    tokenStore: "cookie" // for Vue.js apps
  })

  const signUpWithEmail = async (email: string, password: string) => {
    loading.value = true
    error.value = null
    try {
      const result = await stackClient.signUpWithCredential({
        email,
        password,
        noRedirect: true
      })

      if (result.status === "error") {
        error.value = result.error.message
      } else {
        user.value = await stackClient.getUser()
      }
    } catch (err: any) {
      console.error('Signup error:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const signInWithEmail = async (email: string, password: string) => {
    loading.value = true
    error.value = null
    try {
      const result = await stackClient.signInWithCredential({
        email,
        password,
        noRedirect: true
      })

      if (result.status === "error") {
        error.value = result.error.message
      } else {
        user.value = await stackClient.getUser()
      }
    } catch (err: any) {
      console.error('Signin error:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const signInWithGoogle = async () => {
    loading.value = true
    error.value = null
    try {
      await stackClient.signInWithOAuth('google')
      // OAuth redirects, user state will be updated on callback
    } catch (err: any) {
      console.error('Google Signin error:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const signOutUser = async () => {
    loading.value = true
    error.value = null
    try {
      if (user.value) {
        await user.value.signOut()
        user.value = null
      }
    } catch (err: any) {
      console.error('Signout error:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    error,
    loading,
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    signOutUser,
  }
}

export default useAuth
