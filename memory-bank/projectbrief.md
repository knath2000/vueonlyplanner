# Only Task Manager – Project Brief

## Project Overview

Only Task Manager is a feature-rich, visually engaging project and task management web application. It is designed for software developers and visually-oriented users who seek a playful, game-like experience for managing projects and tasks. The application is optimized for Safari on iOS and macOS, with a focus on delivering a highly unique, colorful, and animated UI/UX that stands apart from standard macOS/iOS conventions. **Recent enhancements to modal styling, including an animated background blur and task display as interactive cards, further enhance the visual engagement and game-like feel.**

## Objectives

- Deliver a robust, real-time project and task management tool.
- Prioritize a vibrant, animated, and interactive user interface inspired by modern game and top-rated animated web app patterns. **Completed work on modal layouts, background blur, and task card display significantly contributes to this objective.**
- Ensure seamless, real-time data sync and collaboration across devices using Supabase (PostgreSQL Database and Realtime).
- Provide a responsive, accessible experience tailored for Safari on iOS/macOS, while maintaining cross-browser compatibility.

## Target Audience

- Software developers
- Visually-oriented users
- Users seeking a playful, non-traditional approach to productivity tools

## Key Features

- User Authentication (Email/Password, Google Sign-in options)
- Animated, game-like UI/UX with custom color palette and component library. **Includes smooth CSS fade page transitions, animated modal fade-in/out, enhanced modal styling, animated background blur, and task cards. Implemented prefers-reduced-motion accessibility checks.**
- Project and task CRUD operations, with task categorization (To Do, Debug, Add Feature, Done). **Task display is now a responsive grid of cards.**
- Animated navigation transitions between Dashboard, Project List, and Task Details
- Real-time data sync via Supabase Realtime (Data filtering by user implemented via RLS and client queries)
- Authentication UI presented in a modal popup.
- Accessibility and responsiveness for iOS/macOS Safari
- Advanced animation using libraries like GSAP or VueUse/motion
- Custom animated feedback for all user actions

## Technical Requirements

- Vue.js 3.x with Composition API
- Vue Router for navigation with custom animated transitions and auth guards
- Pinia or Vuex for state management
- Supabase SDK integration (PostgreSQL, Auth, Realtime - implemented)
- Modern animation libraries compatible with Vue
- CI/CD pipeline for automated testing and deployment (Vercel/Netlify)
- Documentation and design system for future expansion

## Differentiators

- Highly unique, colorful, and animated interface. **Includes smooth CSS fade page transitions, animated modal fade-in/out, enhanced modal effects, and task card display. Implemented prefers-reduced-motion accessibility checks.**
- Game-inspired UI/UX patterns
- Real-time, cloud-synced collaboration
- Optimized for Apple platforms, with best-in-class animation performance

## Alignment with Best Practices

- All design, technology, and workflow decisions are grounded in current best practices and recent Google Search insights, ensuring innovation and robustness for the target audience.
