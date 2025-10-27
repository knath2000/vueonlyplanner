# Tech Context – Only Task Manager

## Core Technologies

- **Vue.js 3.x** (Composition API) – Main frontend framework (In use)
- **Pinia** – State management (Installed and implemented, including authStore)
- **Vue Router 4.x** – Routing with animated transitions and auth guards (Installed and implemented). Navigation guards adjusted for auth state loading.
- **Neon Auth (Beta)** – Authentication service integrated with Neon Postgres (Recently migrated from Supabase Auth)
- **Supabase SDK** – PostgreSQL Database and Realtime subscriptions (Database layer retained, Auth migrated to Neon Auth)
- **GSAP** – Advanced animation library (Installed and actively used for modal animations and feedback animations)
- **Vite** – Build tool and dev server (In use)
- **TypeScript** – Type safety and maintainability (In use)

## Development Setup

- **Node.js** (LTS version recommended)
- **Vite** for fast local development and optimized builds (In use)
- **ESLint** and **Prettier** for code quality and formatting (In use, identified minor issues)
- **rollup-plugin-visualizer** (via Vite config) for analyzing production bundle size (Used)
- **vite-plugin-purgecss** (via Vite config) for removing unused CSS in production builds (Implemented)
- **BrowserStack** or similar for cross-browser/device testing (Planned)
- **Lighthouse** for performance and accessibility audits (Planned)

## Key Dependencies (Installed)

- `vue@3.x`
- `pinia`
- `vue-router@4.x`
- `@supabase/supabase-js` (Database operations only, Auth removed)
- `@stackframe/stack` (Neon Auth SDK)
- `postgrest-js` (For direct Postgres queries if needed)
- `gsap`
- `@vueuse/motion`
- `typescript`
- `vite`
- `vite-plugin-purgecss`
- `vuedraggable` (For planned drag-and-drop)

## Platform Constraints

- **Primary Target:** Safari on iOS/macOS (Optimization pending)
- **Secondary:** Chrome, Firefox, Edge (Basic compatibility likely, thorough testing pending)
- **Accessibility:** Must meet WCAG 2.1 AA standards (Implementation pending, including modal accessibility). **Initial implementation of prefers-reduced-motion checks is complete.**

## Integration Notes

**Neon Auth Migration (Completed):**
- **Migration from Supabase Auth to Neon Auth (Beta)** completed successfully
- **Authentication Methods**: Email/password, Google OAuth (GitHub/Microsoft available but not configured)
- **User Synchronization**: Automatic sync to `neon_auth.users_sync` table with <1 second delay
- **Database Integration**: Direct SQL joins with user data, foreign key relationships, RLS support
- **SDK**: `@stackframe/stack` for client-side auth operations
- **Environment Variables**: 
  - `VITE_STACK_PROJECT_ID` (Client-side)
  - `VITE_STACK_PUBLISHABLE_CLIENT_KEY` (Client-side)
  - `STACK_SECRET_KEY` (Server-side for admin operations)

**Supabase Integration (Database Layer Retained):**
- PostgreSQL database used for data storage
- Row Level Security (RLS) implemented for data access control
- Realtime sync implemented via Supabase Realtime channels **managed reactively within Pinia stores based on subsequent authentication state changes**
- **Important: For Realtime `DELETE` events to function correctly, the relevant table (e.g., `projects`) must have its `REPLICA IDENTITY` set to `FULL` via SQL (`ALTER TABLE public.projects REPLICA IDENTITY FULL;`).**

**Authentication Flow:**
- On application initialization and Supabase session restoration, `authStore` explicitly triggers `projectStore.subscribeToProjects()` to ensure data is loaded
- `projectStore` includes logic to attempt re-subscription on `CLOSED` or `TIMED_OUT` events
- User data is automatically synchronized from Neon Auth to the database

**Animations:** Vue `<transition>` used for basic CSS fade page transitions and `<TransitionGroup>` used for list animations. GSAP actively used for modal entrance/exit (via transition hooks) and feedback animations (add project/task, status change). **Implemented animated background blur for modals using `backdrop-filter` applied directly to mask.** **Dynamically importing GSAP across all components improved initial load performance and code splitting.** **CSS animation used for background "searchlight" effect.** Performance optimization pending. **Implemented prefers-reduced-motion checks to disable animations if preferred.**

**Styling:** Theme updated to use a static dark pink/purple gradient background with an animated CSS "searchlight" effect. CSS variables adjusted for contrast. Applied to modals, cards, buttons, and other UI elements. **PurgeCSS implemented to remove unused styles in production builds.**

**Modals:** `BaseModal.vue` serves as the foundation. Specific modals (`AuthModal.vue`, `AddProjectModal.vue`, `EditProjectModal.vue`, `AddTaskModal.vue`, `EditTaskModal.vue`, `ProjectDetailModal.vue`) created for distinct functions. `ProjectDetailModal` decomposed into `ProjectDetailHeader` and `TaskList`. Form logic within Add/Edit modals for Projects and Tasks is managed by reusable composables (`useProjectForm.ts`, `useTaskForm.ts`). **Added `showCloseButton` prop to `BaseModal` and adjusted default container styles to prevent content overflow in `AuthModal`.**

**CI/CD:** Not yet implemented.

## References

- Google Search: Best practices for animated web apps on Safari/iOS, Supabase integration with Vue 3, animation performance tips, modern modal design, multi-color palettes, CSS gradients, Supabase Auth best practices, Supabase Row Level Security (RLS), Supabase Realtime
- Apple Human Interface Guidelines (web/animation)
- Neon Auth Documentation: https://neon.com/docs/neon-auth/overview
- Stack Auth Documentation: https://docs.stack-auth.com/
