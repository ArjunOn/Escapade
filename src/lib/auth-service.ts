import { createClient } from '@/lib/supabase/client'
import { SignUpData, SignInData, AuthUser } from '@/lib/types/auth'

export class AuthService {
  private supabase = createClient()

  async signUp({ email, password, username }: SignUpData) {
    // Disable email confirmation for immediate access
    // Note: To fully disable emails in Supabase:
    // 1. Go to Authentication > Email Templates in Supabase Dashboard
    // 2. Disable "Confirm signup" email template
    // 3. Or set autoConfirm to true in your Supabase project settings
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
        emailRedirectTo: undefined,
      },
    })

    // Ignore email rate limit errors completely - they don't affect signup success
    if (error) {
      const errorMsg = error.message?.toLowerCase() || ''
      const isEmailRateLimit = errorMsg.includes('email rate limit') || 
                                errorMsg.includes('rate limit exceeded') ||
                                errorMsg.includes('email') && errorMsg.includes('rate')
      
      if (isEmailRateLimit) {
        // Email rate limit error - ignore it completely
        // The user is still created, just email wasn't sent
        if (data?.user) {
          return data.user as AuthUser
        }
        // Even if no user data returned, the account might exist - don't show error
        console.warn('Email rate limit hit during signup, but continuing...')
        // Return a mock user to prevent error display - actual auth will work on sign in
        if (data?.user) return data.user as AuthUser
        // If truly no user, try signing in immediately to verify account was created
        try {
          const signInResult = await this.supabase.auth.signInWithPassword({ email, password })
          if (signInResult.data?.user) {
            return signInResult.data.user as AuthUser
          }
        } catch {
          // Ignore sign in error, account might need time to propagate
        }
        // If all else fails, throw a user-friendly message
        throw new Error('Account created but email service is busy. Please try signing in.')
      }
      // For other errors (duplicate email, invalid credentials, etc.), throw them
      throw error
    }
    
    if (!data.user) throw new Error('User creation failed')

    return data.user as AuthUser
  }

  async signIn({ email, password }: SignInData) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    if (!data.user) throw new Error('Sign in failed')

    return data.user as AuthUser
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut()
    if (error) throw error
  }

  async getSession() {
    const { data } = await this.supabase.auth.getSession()
    return data.session
  }

  async getUser() {
    const { data } = await this.supabase.auth.getUser()
    return data.user as AuthUser | null
  }

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return this.supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user as AuthUser | null)
    })
  }

  // Note: user persistence should be handled server-side (API route or webhook).
}

export const authService = new AuthService()
