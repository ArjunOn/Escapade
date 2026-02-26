import { User as SupabaseUser } from '@supabase/supabase-js'

export interface AuthUser extends SupabaseUser {
  email: string
}

export interface AuthState {
  user: AuthUser | null
  loading: boolean
  error: string | null
}

export interface SignUpData {
  email: string
  password: string
  username: string
}

export interface SignInData {
  email: string
  password: string
}
