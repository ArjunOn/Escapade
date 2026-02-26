'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { AuthUser, AuthState } from '@/lib/types/auth'
import { authService } from '@/lib/auth-service'
import { useAppStore } from '@/lib/store'

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, username: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const setAuthUser = useAppStore((state) => state.setAuthUser)
  const clearStore = useAppStore((state) => state.logout)
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    // Check active session
    authService.getUser().then((user) => {
      setState({ user, loading: false, error: null })
      if (user?.email) {
        setAuthUser(user.email, (user.user_metadata as { username?: string })?.username)
      } else {
        clearStore()
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      setState({ user, loading: false, error: null })
      if (user?.email) {
        setAuthUser(user.email, (user.user_metadata as { username?: string })?.username)
      } else {
        clearStore()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, username: string) => {
    try {
      setState({ ...state, loading: true, error: null })
      const user = await authService.signUp({ email, password, username })
      setState({ user, loading: false, error: null })
    } catch (error: any) {
      setState({ ...state, loading: false, error: error.message })
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setState({ ...state, loading: true, error: null })
      const user = await authService.signIn({ email, password })
      setState({ user, loading: false, error: null })
    } catch (error: any) {
      setState({ ...state, loading: false, error: error.message })
      throw error
    }
  }

  const signOut = async () => {
    try {
      await authService.signOut()
      setState({ user: null, loading: false, error: null })
      clearStore()
    } catch (error: any) {
      setState({ ...state, error: error.message })
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ ...state, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
