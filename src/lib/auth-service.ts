import { createClient } from '@/lib/supabase/client'
import { SignUpData, SignInData, AuthUser } from '@/lib/types/auth'

export class AuthService {
  private supabase = createClient()

  async signUp({ email, password, username }: SignUpData) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, full_name: username },
      },
    })

    if (error) {
      const msg = error.message?.toLowerCase() || ''
      if (msg.includes('email rate limit') || msg.includes('rate limit')) {
        if (data?.user) return data.user as AuthUser
        try {
          const r = await this.supabase.auth.signInWithPassword({ email, password })
          if (r.data?.user) return r.data.user as AuthUser
        } catch { /* swallow */ }
        throw new Error('Account created — please try signing in.')
      }
      if (msg.includes('already registered') || msg.includes('already exists')) {
        throw new Error('An account with this email already exists. Please sign in instead.')
      }
      throw error
    }

    if (!data.user) throw new Error('Sign up failed — please try again.')
    return data.user as AuthUser
  }

  async signIn({ email, password }: SignInData) {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password })
    if (error) {
      const msg = error.message?.toLowerCase() || ''
      if (msg.includes('invalid') || msg.includes('credentials')) {
        throw new Error('Incorrect email or password.')
      }
      throw error
    }
    if (!data.user) throw new Error('Sign in failed — please try again.')
    return data.user as AuthUser
  }

  async signInWithGoogle(redirectTo?: string) {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTo || `${window.location.origin}/auth/callback`,
        queryParams: { access_type: 'offline', prompt: 'select_account' },
      },
    })
    if (error) throw error
    return data
  }

  async signInWithFacebook(redirectTo?: string) {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: redirectTo || `${window.location.origin}/auth/callback`,
      },
    })
    if (error) throw error
    return data
  }

  async signOut() {
    try {
      await this.supabase.auth.signOut()
    } catch {
      await this.supabase.auth.signOut({ scope: 'local' })
    }
  }

  async getUser(): Promise<AuthUser | null> {
    try {
      const { data, error } = await this.supabase.auth.getUser()
      if (error) {
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
