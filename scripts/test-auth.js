// Simple script to test auth flow
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function testAuth() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  console.log('Testing Supabase connection...')

  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    console.log('✅ Supabase connection successful')
    console.log('Session:', data.session ? 'Active' : 'No active session')
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message)
    process.exit(1)
  }
}

testAuth()
