# Tech Context – Only Task Manager

## Core Technologies

- **Vue.js 3.x** (Composition API) – Main frontend framework (In use)
- **Pinia** – State management (Implemented, including authStore with Neon Auth integration)
- **Vue Router 4.x** – Routing with animated transitions and auth guards (Implemented)
- **Neon Auth (Beta)** – Authentication via Stack Auth SDK (Newly implemented)
- **Neon PostgreSQL** – Serverless database with PostgREST API (Newly implemented)
- **GSAP** – Advanced animation library (In use)
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

## Key Dependencies (Updated for Neon Migration)

- `vue@3.x`
- `pinia`
- `vue-router@4.x`
- `@stackframe/stack` (Neon Auth SDK - newly added)
- `postgrest-js` (Neon database client - newly added)
- `socket.io-client` (Future real-time capabilities - newly added)
- `gsap`
- `@vueuse/motion`
- `typescript`
- `vite`
- `vite-plugin-purgecss`

## Platform Constraints

- **Primary Target:** Safari on iOS/macOS (Optimization pending)
- **Secondary:** Chrome, Firefox, Edge (Basic compatibility likely, thorough testing pending)
- **Accessibility:** Must meet WCAG 2.1 AA standards (Implementation pending, including modal accessibility). **Implemented prefers-reduced-motion checks.**
- **Database:** Neon PostgreSQL with serverless scaling and automatic user synchronization

## Integration Notes

**Neon Auth (Beta) Integration:**
- Authentication handled via Stack Auth SDK (`@stackframe/stack`)
- User data automatically synchronized to `neon_auth.users_sync` table
- Supports email/password and OAuth (Google, GitHub, Microsoft)
- No webhook configuration required - users sync automatically (<1 second delay)
- Project configured in Neon Console with Stack Auth integration

**Neon Database Integration:**
- PostgREST API for database operations (replaces Supabase client)
- Direct SQL-like queries with automatic RLS enforcement
- Foreign key relationships supported with user data
- Connection configured for Vercel deployment
- Database URL: `postgresql://neondb_owner:npg_YcDpvHF36uKO@ep-summer-mouse-adaentlg-pooler.c-2.us-east-1.aws.neon.tech/neondb`

**Real-time Features (Polling-based):**
- Replaced Supabase Realtime WebSocket subscriptions with polling
- Projects poll every 5 seconds, tasks every 3 seconds
- Socket.io client added for future WebSocket server implementation
- Acceptable performance for task management use case

**Animations:**
- Vue `<transition>` used for basic CSS fade page transitions and `<TransitionGroup>` used for list animations
- GSAP actively used for modal entrance/exit (via transition hooks) and feedback animations (add project/task, status change)
- **Implemented animated background blur for modals using `backdrop-filter` applied directly to mask**
- **Dynamically importing GSAP across all components improved initial load performance and code splitting**
- **CSS animation used for background "searchlight" effect**
- Performance optimization pending
- **Implemented prefers-reduced-motion checks to disable animations if preferred**

**Styling:**
- Theme updated to use a static dark pink/purple gradient background with an animated CSS "searchlight" effect
- CSS variables adjusted for contrast
- Applied to modals, cards, buttons, and other UI elements
- **PurgeCSS implemented to remove unused styles in production builds**

**Modals:**
- `BaseModal.vue` serves as the foundation
- Specific modals (`AuthModal.vue`, `AddProjectModal.vue`, `EditProjectModal.vue`, `AddTaskModal.vue`, `EditTaskModal.vue`, `ProjectDetailModal.vue`) created for distinct functions
- `ProjectDetailModal` decomposed into `ProjectDetailHeader` and `TaskList`
- Form logic within Add/Edit modals for Projects and Tasks is managed by reusable composables (`useProjectForm.ts`, `useTaskForm.ts`)
- **Added `showCloseButton` prop to `BaseModal` and adjusted default container styles to prevent content overflow in `AuthModal`**

## Migration from Supabase

**Completed Migration Steps:**
1. ✅ Installed Neon Auth SDK and PostgREST client
2. ✅ Removed Supabase client dependency
3. ✅ Updated authentication composable to use Stack Auth
4. ✅ Migrated auth store to Neon Auth initialization
5. ✅ Replaced database client with Neon PostgREST
6. ✅ Implemented polling-based real-time replacement
7. ✅ Created user migration script with bcrypt hash preservation
8. ✅ Updated environment configuration for Neon
9. ✅ Configured for Vercel deployment

**Key Architectural Changes:**
- **Authentication**: From Supabase Auth → Neon Auth (Beta) via Stack SDK
- **Database**: From Supabase PostgreSQL → Neon PostgreSQL with PostgREST
- **Real-time**: From WebSocket subscriptions → Polling-based updates
- **Dependencies**: Removed `@supabase/supabase-js`, added Neon-specific packages

## References

- Google Search: Best practices for animated web apps on Safari/iOS, Neon Auth integration with Vue 3, animation performance tips, modern modal design, multi-color palettes, CSS gradients, Neon Auth best practices, PostgREST API patterns, Neon Row Level Security (RLS), Neon serverless PostgreSQL
- Apple Human Interface Guidelines (web/animation)
- Neon Documentation: Auth setup, PostgREST API, database branching
- Stack Auth Documentation: SDK integration, OAuth providers
