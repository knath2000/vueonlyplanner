// src/supabase/index.ts - Now using Neon Database + PostgREST only
import { PostgrestClient } from 'postgrest-js'

// Neon PostgREST client for all database operations
const neonApiUrl = import.meta.env.VITE_NEON_API_URL
const neonPassword = import.meta.env.VITE_NEON_DB_PASSWORD

if (!neonApiUrl || !neonPassword) {
  throw new Error('Neon API URL and password must be provided in environment variables.')
}

export const db = new PostgrestClient(`${neonApiUrl}/rest/v1`, {
  headers: {
    'apikey': neonPassword,
    'Authorization': `Bearer ${neonPassword}`,
  },
})
