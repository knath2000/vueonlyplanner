import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore' // Import auth store

// Remove HomeView import if no longer used directly, or keep if needed elsewhere
// import HomeView from '../views/HomeView.vue'
import DashboardView from '../views/DashboardView.vue'
import ProjectListView from '../views/ProjectListView.vue'
import TaskDetailsView from '../views/TaskDetailsView.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/', // Make Dashboard the home route
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }, // Requires authentication
    },
    {
      path: '/projects',
      name: 'project-list',
      component: ProjectListView,
      meta: { requiresAuth: true }, // Requires authentication
    },
    {
      // Dynamic route for specific task details within a project
      path: '/project/:projectId/task/:taskId',
      name: 'task-details',
      component: TaskDetailsView,
      props: true, // Automatically pass route params as props to the component
      meta: { requiresAuth: true }, // Requires authentication
    },
    // Add other routes as needed
  ],
})

// Navigation Guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Wait for the initial auth state check to complete
  await authStore.authLoadedPromise

  const requiresAuth = to.meta.requiresAuth
  const isAuthenticated = authStore.currentUser !== null

  if (requiresAuth && !isAuthenticated) {
    // If route requires auth and user is not authenticated, redirect to auth page (no longer exists, maybe redirect to home or show modal?)
    // With anonymous auth, isAuthenticated will always be true after authLoadedPromise resolves,
    // so this block might not be strictly necessary for current functionality,
    // but keeping it for clarity if auth requirements change.
    // For now, we won't redirect to a non-existent auth page.
    // If a route *truly* requires a *permanent* account, this logic would need adjustment.
    // For now, we'll just allow navigation since anonymous auth provides a user.
    next()
  } else {
    // Otherwise, allow navigation
    next()
  }
})

export default router
