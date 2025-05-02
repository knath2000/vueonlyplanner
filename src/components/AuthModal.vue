<template>
  <div>
    <h2>{{ isLogin ? 'Login' : 'Sign Up' }}</h2>

    <form @submit.prevent="onSubmit">
      <div class="form-group">
        <label for="email" class="form-label">Email:</label>
        <!-- Added form-label class -->
        <input
          type="email"
          id="email"
          v-model="email"
          required
          :disabled="authStore.loading"
          class="input-enhanced"
        />
        <!-- Added input-enhanced class -->
      </div>

      <div class="form-group">
        <label for="password" class="form-label">Password:</label>
        <!-- Added form-label class -->
        <input
          type="password"
          id="password"
          v-model="password"
          required
          :disabled="authStore.loading"
          class="input-enhanced"
        />
        <!-- Added input-enhanced class -->
      </div>

      <!-- Use global button classes -->
      <button type="submit" :disabled="authStore.loading" class="btn btn-primary-enhanced">
        {{ isLogin ? 'Login' : 'Sign Up' }}
      </button>
    </form>

    <p v-if="authStore.error" class="error-message">{{ authStore.error }}</p>

    <!-- Use global button classes -->
    <button @click="toggleMode" :disabled="authStore.loading" class="btn btn-secondary-enhanced">
      {{ isLogin ? 'Need an account? Sign Up' : 'Have an account? Login' }}
    </button>

    <!-- Optional: Social Login Buttons -->
    <!--
    <button @click="signInWithGoogle" :disabled="loading">Sign in with Google</button>
    -->
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue' // Import watch
// import useAuth from '@/composables/useAuth' // No longer needed for direct calls
import { useAuthStore } from '@/stores/authStore' // Import the auth store
// Remove useRouter as routing is handled by parent

defineProps<{
  show: boolean // Prop to control modal visibility
}>()

const emit = defineEmits(['close']) // Emit close event

const isLogin = ref(true) // Toggle between login and signup mode
const email = ref('')
const password = ref('')

// const { signUpWithEmail, signInWithEmail, loading, error } = useAuth() // Use store actions instead
const authStore = useAuthStore() // Use the auth store
// Remove router instance

// Watch for successful authentication and emit close event
watch(
  () => authStore.currentUser,
  (newUser) => {
    if (newUser) {
      emit('close') // Close modal on successful login/signup
    }
  },
)

const toggleMode = () => {
  isLogin.value = !isLogin.value
  authStore.error = null // Clear store error when toggling mode
}

const onSubmit = async () => {
  if (isLogin.value) {
    // Use the store's login action
    await authStore.login(email.value, password.value)
  } else {
    // Use the store's register action
    await authStore.register(email.value, password.value)
  }
}

// Optional: Google Sign-In handler
/*
const handleGoogleSignIn = async () => {
  await signInWithGoogle();
  emit('close'); // Close modal after Google sign-in
};
*/

// Remove handleBackgroundClick as BaseModal handles background clicks
</script>

<style scoped>
h2 {
  font-family: var(--font-display); /* Use display font */
  color: var(--color-text-heading); /* Use heading text color */
  margin-top: 0; /* Remove top margin */
  margin-bottom: var(--space-lg); /* Reduce bottom margin */
  text-align: center;
  font-size: 1.8rem; /* Larger size */
}

form {
  /* background-color: var(--color-surface-modal); */ /* Background is handled by BaseModal */
  padding: var(--space-lg) 0 0 0; /* Add padding above form elements, remove others */
  /* border-radius: var(--border-radius-medium); */ /* Handled by BaseModal */
  /* box-shadow: var(--box-shadow-card); */ /* Handled by BaseModal */
  display: grid;
  gap: var(--space-lg); /* Reduce gap */
  width: 100%;
  /* border: 1px solid var(--color-border); */ /* Remove border */
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs); /* Use spacing variable */
}

/* Use global .form-label style from main.css */
/* .form-group label { ... } */

/* Use global .input-enhanced style from main.css */
/* .form-group input[type='email'], ... */
/* .form-group input[type='email']:focus, ... */

/* Remove local button styles, rely on global .btn-* classes */
/* button { ... } */
/* button.primary-button { ... } */
/* button.secondary-button { ... } */
/* button:hover:not(:disabled) { ... } */
/* button.secondary-button:hover:not(:disabled) { ... } */
/* button:disabled { ... } */

/* Keep error message style */
.error-message {
  color: var(--color-error);
  margin-top: 1rem;
  text-align: center;
  font-size: 0.9rem;
  font-weight: 600;
}

/* Add specific margin for the toggle button */
.btn-secondary-enhanced {
  margin-top: var(--space-md);
}
</style>
