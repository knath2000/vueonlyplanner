# Active Context – Only Task Manager

## Current Work Focus

- **Completed UI/UX Overhaul (Phases 1-3):** Implemented "Neon Focus" theme, enhanced animations (GSAP Flip, feedback), and refined component styles.
- **Completed Build Optimization:** Analyzed bundle size, implemented PurgeCSS, and refactored GSAP imports to be dynamic, improving code splitting and potential load performance.
- **Completed Animation Re-implementation & Accessibility:** Re-introduced smooth page transitions and modal entrance animations, and implemented `prefers-reduced-motion` checks.
- **Completed Nested Modal Debugging:** Resolved issues preventing Add/Edit Task modals from appearing when nested within Project Detail modal.
- **Completed Neon Auth Migration:** Successfully migrated from Supabase Auth to Neon Auth (Beta) with automatic user synchronization and working authentication flows.
- Next focus: **Real-time Alternative Implementation** - Since Neon Auth doesn't include real-time features, implement alternative solution for instant data synchronization.

## Recent Changes

- Implemented core architecture (Vue, Pinia, Router, Supabase).
- Developed Pinia stores (`projectStore`, `taskStore`, `authStore`) with real-time Supabase Realtime sync and RLS.
- Created views (Dashboard, ProjectList, ProjectDetail) and components (`ProjectCard`, `TaskCard`, `BaseModal`, `AuthModal`).
- Implemented UI for Create/Read/Delete (Projects, Tasks) and Update (Task Status) using Supabase.
- **Fixed Authentication Flow:** `AuthModal.vue` now uses `authStore.login` and `authStore.register` actions for authentication.
- **Fixed Modal Closing Flicker:** Removed CSS transition on modal mask, relying on `v-if` removal after GSAP exit animation.
- **Fixed Data Persistence on Refresh:** `authStore` triggers `projectStore.subscribeToProjects` on initial session load, which in turn triggers `taskStore.fetchAllUserTasks` after projects are loaded.
- **Fixed Supabase Realtime Subscription Timeout:** Added logic in `projectStore` to attempt re-subscription on `CLOSED` or `TIMED_OUT` events.
- **UI/UX Refinement:**
  - **Implemented basic CSS fade page transitions in `App.vue`.**
  - Refined list animations using `<TransitionGroup>`.
  - Added microinteractions (hover effects, button click feedback, input focus feedback).
  - Implemented visual feedback animations (GSAP) for adding projects/tasks and status changes.
  - Significantly enhanced `BaseModal` aesthetics (styling, layout, animation).
  - Applied refined theme (colors, gradients) more broadly across UI elements.
  - Fixed build errors related to template comments/syntax.
  - **Resolved Project Detail Modal height and bottom gap issues, ensuring it extends correctly to the bottom of the viewport with a slight gap above the menu button.**
  - **Implemented animated background blur for modals using `backdrop-filter` and Vue transitions.**
  - **Styled the "Add New Task" button to match the primary button theme.**
  - **Removed the "Close" button from the Project Detail Modal footer.**
  - **Re-introduced simple fade-in animation for modal entrance in `BaseModal.vue` using GSAP in the `@enter` hook, ensuring proper timing with `gsap.set` and `requestAnimationFrame`.**
  - **Implemented `prefers-reduced-motion` checks for page transitions and modal animations.**
- **Dashboard Updates:**
  - Removed placeholder "Tasks Done" section.
  - Implemented dynamic count for "Tasks To Do" (excluding 'Done' tasks).
- **Refactoring (Completed):**
  - Decomposed `ProjectDetailModal` into `ProjectDetailHeader` and `TaskList`.
  - Extracted `StatCard` component from `DashboardView`.
  - Created `useTaskForm` composable and refactored `AddTaskModal`/`EditTaskModal` to use it.
  - Created `useProjectForm` composable and `AddProjectModal` component, refactoring `ProjectListView` to use them.
- Completed Supabase Migration (Authentication, Database, Realtime).
- Implemented "Add Task" functionality (now using `AddTaskModal` with `useTaskForm`).
- Implemented Project Detail Modal (`ProjectDetailModal.vue`) to display project information and tasks.
- Resolved the spacing issue between the project title and meta information in the Project Detail Modal.
- Created nested Add Task Modal (`AddTaskModal.vue`) and Edit Task Modal (`EditTaskModal.vue`) components for use within the Project Detail Modal.
- Styled the Add New Task modal (size, form elements, header, buttons) to match project visual identity.
- Ensured the menu button floats correctly above the modal with appropriate z-index.
- Implemented task display as rectangular cards in a responsive grid within the Project Detail Modal.
- Optimized production build performance: Addressed Lighthouse issues by dynamically importing GSAP and verifying build/preview process. Achieved high Lighthouse scores on production preview.
- Build Optimization:
  - Analyzed production bundle using `rollup-plugin-visualizer`.
  - Installed and configured `vite-plugin-purgecss` to remove unused CSS.
  - Refactored GSAP imports in `TaskList.vue` and `ProjectListView.vue` to be consistently dynamic, resolving build warnings and improving code splitting.
- Theme Update: Changed background to static dark pink/purple gradient with CSS animated "searchlight" effect. Updated theme variables for contrast.
- Modal Fixes: Corrected persistent background blur effect. Adjusted AuthModal spacing and BaseModal styles to prevent content overflow. Added prop to BaseModal to conditionally hide close button.
- Task Card Refinement: Adjusted internal spacing for vertical layout. Merged status display and dropdown into a single styled select element.
- Project Detail Modal: Centered project title, metadata, and "Tasks" heading.
- **Fixed Realtime Project Deletion:** Resolved issue where deleted projects weren't removed from UI immediately by setting `REPLICA IDENTITY FULL` on the `projects` table in Supabase.
- **Fixed Modal Entrance Flicker:** Resolved occasional flicker by setting initial mask opacity via CSS in `BaseModal.vue`.
- **Fixed BaseModal Footer Slot:** Corrected `v-if` logic in `BaseModal.vue` to ensure the `#footer` slot renders correctly when provided by parent components.
- **Standardized Modal Footers:** Removed the "Cancel" button from `AddProjectModal`, `EditProjectModal`, `AddTaskModal`, and `EditTaskModal`, leaving only the confirmation (checkmark) button.
- **Fixed Nested Add/Edit Task Modals:** Resolved issue where Add Task and Edit Task modals wouldn't appear when triggered from within the Project Detail modal. Initial attempts to fix with `z-index` were unsuccessful. The solution involved moving the `<AddTaskModal>` and `<EditTaskModal>` component tags _outside_ the parent `<BaseModal>` tag in `ProjectDetailModal.vue`, rendering them as siblings instead of children.
- **Neon Auth Migration Completed:** Successfully migrated from Supabase Auth to Neon Auth (Beta). Key achievements:
  - Installed `@stackframe/stack` and `postgrest-js` packages
  - Removed `@supabase/supabase-js` authentication dependencies
  - Updated `authStore.ts` to use Stack Auth client with proper error handling
  - Implemented automatic user synchronization to `neon_auth.users_sync` table
  - Fixed authentication flows (login, register, logout) using Stack Auth API
  - Resolved build issues and environment variable configuration
  - Maintained existing UI components and user experience
  - Created migration script (`migrate_users.ts`) for existing users

## Next Steps

1.  **Real-time Alternative Implementation (High Priority):** Since Neon Auth doesn't include real-time features, implement alternative solution:
    - Evaluate options: WebSocket polling, Server-Sent Events, or third-party service (Pusher/Ably)
    - Implement chosen solution to restore instant data synchronization
    - Test real-time functionality across devices
2.  **Testing & Polish** - Begin comprehensive testing and address any remaining UI/UX refinements.
3.  **Phase 4 UI/UX Polish & Accessibility:**
    - Perform Accessibility Review (contrast, focus, ARIA). (High Priority)
    - Performance Testing (Lighthouse on preview build). (Medium Priority)
4.  **Advanced Animations & UX:**
    - Drag-and-drop interface for task status changes. (Medium Priority)
    - Further integration of GSAP / @vueuse/motion for more sophisticated animations (e.g., physics-based effects). (Low Priority)
5.  **UI/UX Polish:** Continued refinement based on testing feedback. (Medium Priority)
6.  **CI/CD:** Set up CI/CD pipeline. (Low Priority)
7.  **Documentation:** Continue updating Memory Bank and `.clinerules`. (Ongoing)
8.  **Revisit Task Details Modal:** Plan for re-implementing the Task Details modal feature, considering the lessons learned from nesting issues. (Low Priority)

## Active Decisions and Considerations

- Core functionality and Supabase integration are established; focus shifts to UI/UX differentiation and remaining features.
- Prioritize implementing advanced animations and visual polish as per the project brief.
- Continue referencing best practices for performance (especially animation on Safari) and accessibility. **Implemented prefers-reduced-motion checks.**
- Address `.clinerules` regarding tool usage patterns (`write_to_file` preference over `apply_diff` for complex changes).
- Ensure Supabase RLS is robust to protect user data based on `user_id`.
- The removal of anonymous authentication requires users to explicitly sign up or log in.
- Successfully resolved the complex modal height and layout issues, ensuring a consistent visual experience.
- The animated background blur adds a significant visual polish to the modal experience.
- The task card grid provides a more visually appealing and organized display of tasks.
- Data stores now reactively manage subscriptions and data loading based on subsequent authentication state changes, improving user experience after login.
- Dashboard counters (`Total Projects`, `Tasks To Do`) are now reliably fetched and displayed, persisting correctly across navigation and page refreshes.
- Build optimizations (PurgeCSS, dynamic GSAP imports) are implemented to improve production bundle size and composition.
- New theme with animated searchlight background provides a more unique visual identity.
- Modal blur effect and AuthModal layout issues are resolved.
- **Successfully re-implemented smooth CSS fade page transitions and GSAP fade-in/out modal animations.**
- **Nested modals (Add/Edit Task) now function correctly after being moved outside the parent modal's template structure in `ProjectDetailModal.vue`.**
- **Task Details modal feature has been temporarily removed due to persistent rendering issues and will be revisited.**
- **Neon Auth migration completed successfully, providing database-first authentication with automatic user synchronization while maintaining the existing user experience.**
