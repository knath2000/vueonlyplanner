// src/types/task.ts
// Define Task Status
export type TaskStatus = 'To Do' | 'Debug' | 'Add Feature' | 'Done'

// Define Task Priority
export type TaskPriority = 'Low' | 'Medium' | 'High'

// Define the Task interface based on the plan and Supabase schema
export interface Task {
  id: string // Supabase uses uuid for id
  project_id: string // Supabase uses uuid for project_id
  user_id: string // Supabase uses uuid for user_id
  title: string
  description?: string | null // Optional description
  status: TaskStatus
  due_date?: string | null // Optional due date (Supabase date/timestamp as string)
  priority?: TaskPriority | null // Optional priority
  created_at: string // Supabase timestamps are strings (ISO 8601)
  updated_at: string // Supabase timestamps are strings (ISO 8601)
  justUpdated?: boolean // Added for UI feedback animation
}

// Type for data needed to create or update a task
export type TaskData = {
  title: string
  description?: string | null // Optional description
  status: TaskStatus
  due_date?: string | null // Optional due date
  priority?: TaskPriority | null // Optional priority
}
