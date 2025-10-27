import { ref } from 'vue'
import { supabase } from '@/supabase' // Import the supabase client
import type { User } from '@supabase/supabase-js' // Import Supabase User type

const useAuth = () => {
  const user = ref<User | null>(null) // Reactive user state
  const error = ref<string | null>(null)
  const loading = ref<boolean>(false)

  // Supabase handles auth state changes internally and via onAuthStateChange in the store

  const signUpWithEmail = async (email: string, password: string) => {
    loading.value = true
    error.value = null
    try {
      const { data, error: authError } = await supabase.auth.signUp({ email, password })
      if (authError) throw authError
      user.value = data.user // Update local user ref (optional, store is primary)
    } catch (err: any) {
      // Catch as any for Supabase errors
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
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) throw authError
      user.value = data.user // Update local user ref (optional, store is primary)
    } catch (err: any) {
      // Catch as any for Supabase errors
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
      const { data, error: authError } = await supabase.auth.signInWithOAuth({ provider: 'google' })
      if (authError) throw authError
      // Supabase redirects for OAuth, user state will be updated on callback
    } catch (err: any) {
      // Catch as any for Supabase errors
      console.error('Google Signin error:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // Remove signInAnonymously as Supabase doesn't have a direct equivalent

  const signOutUser = async () => {
    loading.value = true
    error.value = null
    try {
      const { error: authError } = await supabase.auth.signOut()
      if (authError) throw authError
      user.value = null // Clear local user ref
    } catch (err: any) {
      // Catch as any for Supabase errors
      console.error('Signout error:', err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  return {
    user, // Note: The authStore's currentUser is the primary source of truth
    error,
    loading,
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    // signInAnonymously is removed
    signOutUser,
  }
}

export default useAuth
