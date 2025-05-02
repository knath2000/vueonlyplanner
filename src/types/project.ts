// src/types/project.ts
// Remove Firebase Timestamp import

// Define the Project interface based on the plan and Supabase schema
export interface Project {
  id: string // Supabase uses uuid for id
  user_id: string // Supabase uses uuid for user_id
  name: string
  color: string
  created_at: string // Supabase timestamps are strings (ISO 8601)
  updated_at: string // Supabase timestamps are strings (ISO 8601)
}

// Type for data needed to create or update a project
export type ProjectData = {
  name: string
  color: string
}
