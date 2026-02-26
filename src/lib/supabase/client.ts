import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  // Provide dummy values during build if not configured
  const url = supabaseUrl && supabaseUrl.startsWith('https://') 
    ? supabaseUrl 
    : 'https://placeholder.supabase.co'
  const key = supabaseKey || 'placeholder-anon-key'
  
  return createBrowserClient(url, key)
}
