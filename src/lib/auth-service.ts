import { createClient } from '@/lib/supabase/client'
import { SignUpData, SignInData, AuthUser } from '@/lib/types/auth'

export class AuthService {
  private supabase = createClient()

  async signUp({ email, password, username }: SignUpData) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    })

    if (error) {
      const msg = error.message?.toLowerCase() || ''
      // Email rate limit — the account was still created
      if (msg.includes('email rate limit') || msg.includes('rate limit')) {
        if (data?.user) return data.user as AuthUser
        // Try signing in immediately to confirm creation
        try {
          const r = await this.supabase.auth.signInWithPassword({ email, password })
          if (r.data?.user) return r.data.user as AuthUser
        } catch { /* swallow */ }
        throw new Error('Account created but email service is busy. Please try signing in.')
      }
      throw error
    }

    if (!data.user) throw new Error('User creation failed')
    return data.user as AuthUser
  }

  async signIn({ email, password }: SignInData) {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    if (!data.user) throw new Error('Sign in failed')
    return data.user as AuthUser
  }

  async signOut() {
    // Always clear local session even if server call fails
    try {
      await this.supabase.auth.signOut()
    } catch {
      // Force-clear the local session on any error
      await this.supabase.auth.signOut({ scope: 'local' })
    }
  }

  async getUser(): Promise<AuthUser | null> {
    try {
      const { data, error } = await this.supabase.auth.getUser()
      if (error) {
        // Stale / invalid refresh token — clear it silently
        const msg = error.message?.toLowerCase() || ''
        if (
          msg.includes('refresh token') ||
          msg.includes('invalid') ||
          msg.includes('not found') ||
          msg.includes('session')
        ) {
          await this.supabase.auth.signOut({ scope: 'local' })
          return null
        }
        return null
      }
      return data.user as AuthUser | null
    } catch {
      return null
    }
  }

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return this.supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user as AuthUser | null ?? null)
    })
  }
}

export const authService = new AuthService()
