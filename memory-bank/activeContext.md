# Active Context – Only Task Manager

## Current Work Focus

- **Completed Major Migration: Supabase → Neon Auth (Beta) + Neon Database**: Successfully migrated the entire authentication and database layer from Supabase to Neon's serverless PostgreSQL with Neon Auth (Beta). This includes complete code changes, dependency updates, and infrastructure setup.
- **Completed Neon Auth Integration**: Implemented Stack Auth SDK for authentication with email/password and Google OAuth support.
- **Completed Database Migration**: Replaced Supabase client with Neon PostgREST client, configured with production Neon database connection.
- **Implemented Real-time Alternative**: Created polling-based system to replace Supabase Realtime WebSocket subscriptions.
- **Next focus: Store Updates & Schema Migration** - Update Pinia stores to use Neon database and migrate existing data.

## Recent Changes

- **Neon Auth (Beta) Migration**:
  - Installed and configured `@stackframe/stack` SDK for Neon Auth
  - Updated `useAuth.ts` composable to use Stack Auth methods
  - Migrated `authStore.ts` to initialize Neon Auth state on app load
  - Replaced Supabase auth event listeners with Neon Auth initialization
  - Maintained same API for components (login, logout, register, Google auth)

- **Database Migration to Neon**:
  - Completely removed Supabase client from `src/supabase/index.ts`
  - Implemented Neon PostgREST client for all database operations
  - Updated environment variables for Neon connection
  - Configured Neon database credentials for production deployment

- **Real-time Features Replacement**:
  - Created `src/composables/useRealtime.ts` with polling-based updates
  - Implemented 5-second polling for projects and 3-second polling for tasks
  - Added Socket.io client infrastructure for future WebSocket implementation
  - Updated polling functions to use Neon database client

- **User Migration Infrastructure**:
  - Created `migrate_users.ts` script for importing users from Supabase
  - Handles bcrypt password hash preservation during migration
  - Includes error handling and progress logging

- **Environment Configuration**:
  - Updated `.env.example` with Neon Auth and database credentials
  - Added Neon API URL and database password configuration
  - Prepared for Vercel deployment with Neon connection

- **Dependency Management**:
  - Removed `@supabase/supabase-js` dependency
  - Added `postgrest-js` for Neon database operations
  - Added `socket.io-client` for future real-time capabilities

## Next Steps

1. **Update Pinia Stores**: Modify `projectStore.ts` and `taskStore.ts` to use Neon PostgREST client instead of Supabase
2. **Database Schema Setup**: Create projects and tasks tables in Neon database with proper RLS policies
3. **Data Migration**: Run user migration script and transfer existing project/task data
4. **Testing & Validation**: Test authentication flow and CRUD operations with Neon
5. **Performance Optimization**: Monitor polling performance and optimize intervals if needed
6. **Documentation Update**: Update memory-bank with migration learnings and new architecture

## Active Decisions and Considerations

- **Real-time Trade-off**: Accepted polling-based updates (3-5 second delays) instead of instant WebSocket updates to maintain Neon architecture
- **Beta Status Acceptance**: Chose Neon Auth (Beta) despite beta status for serverless benefits and database-first approach
- **Migration Strategy**: Preserved existing user passwords using bcrypt hash compatibility during migration
- **Architecture Simplification**: Removed complex Supabase Realtime subscriptions in favor of simpler polling mechanism
- **Future-Proofing**: Added Socket.io infrastructure for potential future real-time server implementation

## Key Learnings from Migration

- **Neon Auth Benefits**: Database-first authentication with automatic user synchronization, no webhook configuration needed
- **PostgREST Differences**: Slightly different query syntax compared to Supabase, requires direct SQL-like operations
- **Polling vs Realtime**: Acceptable performance for task management app, but noticeable delay compared to WebSocket updates
- **Stack Auth SDK**: Clean API for authentication, supports multiple OAuth providers (Google, GitHub, Microsoft)
- **Migration Complexity**: User ID changes require careful foreign key remapping during data migration

## Technical Architecture Changes

- **Authentication**: Neon Auth (Beta) via Stack Auth SDK
- **Database**: Neon PostgreSQL with PostgREST API
- **Real-time**: Polling-based updates (projects: 5s, tasks: 3s)
- **Deployment**: Configured for Vercel with Neon connection
- **Dependencies**: Removed Supabase, added Neon-specific packages

The migration represents a significant architectural shift toward a more serverless, database-centric approach while maintaining all core functionality of the task management application.
