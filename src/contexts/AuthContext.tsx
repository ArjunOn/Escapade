'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { AuthUser, AuthState } from '@/lib/types/auth'
import { authService } from '@/lib/auth-service'
import { useAppStore } from '@/lib/store'

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, username: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithFacebook: () => Promise<void>
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
    let mounted = true

    authService.getUser().then((user) => {
      if (!mounted) return
      setState({ user, loading: false, error: null })
      if (user?.email) {
        setAuthUser(user.email, (user.user_metadata as any)?.username || (user.user_metadata as any)?.full_name)
      } else {
        clearStore()
      }
    }).catch(() => {
      if (!mounted) return
      setState({ user: null, loading: false, error: null })
      clearStore()
    })

    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      if (!mounted) return
      setState({ user, loading: false, error: null })
      if (user?.email) {
        setAuthUser(user.email, (user.user_metadata as any)?.username || (user.user_metadata as any)?.full_name || (user.user_metadata as any)?.name)
      } else {
        clearStore()
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const signUp = async (email: string, password: string, username: string) => {
    setState(s => ({ ...s, loading: true, error: null }))
    try {
      const user = await authService.signUp({ email, password, username })
      setState({ user, loading: false, error: null })
      if (user?.email) {
        setAuthUser(user.email, username)
      }
    } catch (error: any) {
      setState(s => ({ ...s, loading: false, error: error.message }))
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    setState(s => ({ ...s, loading: true, error: null }))
    try {
      const user = await authService.signIn({ email, password })
      setState({ user, loading: false, error: null })
    } catch (error: any) {
      setState(s => ({ ...s, loading: false, error: error.message }))
      throw error
    }
  }

  const signOut = async () => {
    try {
      await authService.signOut()
    } catch { /* always clear locally */ }
    setState({ user: null, loading: false, error: null })
    clearStore()
  }

  const signInWithGoogle = async () => {
    setState(s => ({ ...s, loading: true, error: null }))
    try {
      await authService.signInWithGoogle()
      // OAuth redirects the browser — no further action needed here
    } catch (error: any) {
      setState(s => ({ ...s, loading: false, error: error.message }))
      throw error
    }
  }

  const signInWithFacebook = async () => {
    setState(s => ({ ...s, loading: true, error: null }))
    try {
      await authService.signInWithFacebook()
    } catch (error: any) {
      setState(s => ({ ...s, loading: false, error: error.message }))
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ ...state, signUp, signIn, signOut, signInWithGoogle, signInWithFacebook }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
