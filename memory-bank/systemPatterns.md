# System Patterns – Only Task Manager

## System Architecture Overview

- **Frontend Framework:** Vue.js 3.x (Composition API)
- **State Management:** Pinia (Implemented, including authStore)
- **Routing:** Vue Router with basic animated transitions (fade) implemented. Navigation guards adjusted to wait for auth state loading.
- **Backend/Data:** Supabase (PostgreSQL Database, Authentication, Realtime subscriptions) (Implemented)
- **Build Tool:** Vite for fast development and optimized builds
- **Hosting:** Vercel or Netlify for CI/CD and deployment (Planned)

## Component Structure

- **App Shell:** Handles layout, navigation (`App.vue`). Basic navigation implemented, including conditional display based on authentication status.
- **Views:** Dashboard, Project List implemented with basic functionality. Project Details view replaced by a modal. Task Details view exists as placeholder.
- **Reusable Components:** `ProjectCard`, `TaskCard`, `BaseModal` (significantly enhanced), `AuthModal` implemented. **Created `ProjectDetailModal.vue` (now decomposed), `AddTaskModal.vue`, `EditTaskModal.vue`, `ProjectDetailHeader.vue`, `TaskList.vue`, `AddProjectModal.vue`, `StatCard.vue`.**
- **Composables:** Reusable logic extracted into composables (`src/composables/`), notably `useTaskForm.ts` and `useProjectForm.ts` for managing modal form state and submission.
- **UI Library:** Custom-built approach. Theme variables defined. GSAP utilized for modal animations and feedback animations.

## State & Data Flow

- **Pinia Store Modules:** Separate stores implemented for projects (`projectStore`), tasks (`taskStore`), and authentication (`authStore`). Auth store manages user state and handles auth state changes via Supabase listener. **Data stores (`projectStore`, `taskStore`) now `watch` the `authStore.currentUser` state to reactively manage data fetching and subscriptions upon subsequent login/logout events.**
- **Initial Data Load on Refresh:** On application initialization and Supabase session restoration, `authStore` explicitly triggers `projectStore.subscribeToProjects()`. After the initial project fetch within `projectStore.subscribeToProjects()` completes, `projectStore` triggers `taskStore.fetchAllUserTasks()` to populate dashboard data. This ensures data persistence across refreshes when logged in.
- **Supabase Integration:** Realtime subscriptions (`supabase.channel().on()`) implemented in stores for automatic UI updates on data changes. **Subscriptions are now managed reactively based on authentication state changes (for projects) and explicit calls combined with auth state changes (for tasks). `projectStore` includes logic to attempt re-subscription on `CLOSED` or `TIMED_OUT` events.** CRUD actions defined using Supabase client (`from().select/insert/update/delete`). Data filtering by user implemented using Row Level Security (RLS) and client-side queries (`eq('user_id', auth.uid())`). **Important: For Realtime `DELETE` events to function correctly, the relevant table (e.g., `projects`) must have its `REPLICA IDENTITY` set to `FULL` via SQL (`ALTER TABLE public.projects REPLICA IDENTITY FULL;`).**
- **Authentication:** Implemented using Supabase Auth (Email/Password, Google OAuth). Anonymous sign-in has been removed from the initial flow.

## Routing

- **Routes:** Defined for Dashboard and Project List. The `/project-details` and `/auth` routes have been removed.
- **Navigation Guard:** Implemented to wait for the initial authentication state (including Supabase session loading) before allowing navigation to protected routes. Redirects unauthenticated users to the login modal.

## Animation & UI/UX Patterns

- **Navigation Transitions:** Basic CSS fade page transitions implemented in `App.vue` using Vue's `<transition>`.
- **List Animations:** Refined add/remove animations using `<TransitionGroup>` for projects and tasks, ensuring consistency. **Tasks are now displayed as rectangular cards in a responsive grid.**
- **Feedback Animations:** Implemented hover effects, button click feedback, input focus feedback. Added GSAP-based pulse animations for adding projects/tasks and status changes. **Implemented animated background blur for modals.**
- **Modal Animations:** GSAP is used for modal entrance and exit (`BaseModal.vue` via `@enter` and `@leave` hooks) with simple fade-in/out. **Implemented prefers-reduced-motion checks to disable modal animations if preferred.**
- **Game-Inspired UI:** Theme variables refined. Modal components (`BaseModal`, `AuthModal`) significantly enhanced for aesthetics. "Add Project" refactored to use a modal instead of inline input. Microinteractions added. **Project Detail Modal layout, including height, gap, and background blur, is complete.** **Add Task Modal styling and size are complete.**

## Security & Best Practices

- **Supabase Row Level Security (RLS):** Implemented policies to ensure users can only access and modify their own data based on `user_id`.
- **Performance:** Basic Vue/Vite setup. Optimization for animations, lazy loading, code splitting pending. **Dynamically importing GSAP improved initial load performance.**
- **Testing:** Not yet implemented.

## References

- Google Search: Best animated Vue apps, game UI patterns, Safari animation performance, modern modal design, multi-color palettes, CSS gradients, Supabase Auth best practices, Supabase Row Level Security (RLS), Supabase Realtime
- Apple Human Interface Guidelines (web/animation)
