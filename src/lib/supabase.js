import { createClient } from '@supabase/supabase-js'

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim()
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim()

// Accept the Project URL even if it was copied with a service path attached
// (e.g. ".../rest/v1" or ".../auth/v1"). Supabase-js needs the bare origin.
const url = rawUrl
  .replace(/\/+$/, '')
  .replace(/\/(rest|auth|storage|realtime|functions)\/v1$/, '')

export const isSupabaseConfigured = Boolean(
  url &&
    anonKey &&
    !url.includes('your-project-ref') &&
    !anonKey.includes('your-anon')
)

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      },
      realtime: { params: { eventsPerSecond: 10 } }
    })
  : null
