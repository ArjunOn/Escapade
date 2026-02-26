# 🚀 Escapade Production Infrastructure - Revised Implementation Plan

## 📊 Current State Assessment

✅ **Already Have:**
- Prisma schema configured for PostgreSQL
- Login/Signup page structures
- Basic Zustand store for client state
- Well-organized Next.js App Router structure
- Service layer architecture

❌ **Missing:**
- Supabase integration
- Real authentication system
- Environment variables
- API routes for server-side logic
- AI provider abstraction
- Production deployment config

---

## 🎯 Why This Revision?

The original prompt was designed for AI assistants with full codebase context. This revision is:

✅ **Manual-friendly** - Step-by-step with copy/paste code
✅ **Incremental** - Test after each phase
✅ **Resumable** - Pick up where you left off
✅ **Self-contained** - All code included
✅ **Verifiable** - Clear success criteria per step

---

## 🗺️ Implementation Strategy

### Approach: Build in Layers
1. **Foundation Layer** - Database + Environment
2. **Auth Layer** - Supabase Auth + Protected Routes
3. **API Layer** - Server Routes + AI Integration
4. **Production Layer** - Deployment + Security
5. **Testing Layer** - Verification + Validation

### Time Estimate
- **Phase 1-2**: 2-3 hours (Foundation + Auth)
- **Phase 3**: 2-3 hours (API Layer)
- **Phase 4-5**: 1-2 hours (Production + Testing)
- **Total**: 6-8 hours for full production readiness

---

## 📋 PHASE 1: FOUNDATION SETUP (60 minutes)

### Step 1.1: Install Dependencies
```bash
npm install @supabase/supabase-js
npm install @supabase/auth-helpers-nextjs
npm install @supabase/ssr
npm install -D @types/node
```

**Verify:** Check package.json for new dependencies

---

### Step 1.2: Create Environment Files

**File:** `.env.local`
```env
# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# AI Providers (add as needed)
AI_PROVIDER=mock
OPENAI_API_KEY=
GROQ_API_KEY=
ANTHROPIC_API_KEY=
GEMINI_API_KEY=
OLLAMA_BASE_URL=http://localhost:11434
```

**File:** `.env.example`
```env
# Copy this to .env.local and fill in your values

# Database (Supabase PostgreSQL)
DATABASE_URL=
DIRECT_URL=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# App
NEXT_PUBLIC_APP_URL=

# AI Providers
AI_PROVIDER=mock
OPENAI_API_KEY=
GROQ_API_KEY=
ANTHROPIC_API_KEY=
GEMINI_API_KEY=
OLLAMA_BASE_URL=
```

**Verify:** Both files exist, .env.local in .gitignore

---

### Step 1.3: Update .gitignore

Add to `.gitignore`:
```
# Environment
.env
.env.local
.env.*.local

# Database
prisma/dev.db
prisma/dev.db-journal
```

**Verify:** .env.local won't be committed

---

### Step 1.4: Create Supabase Client

**File:** `src/lib/supabase/client.ts`
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**File:** `src/lib/supabase/server.ts`
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle errors during server component rendering
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Handle errors during server component rendering
          }
        },
      },
    }
  )
}
```

**File:** `src/lib/supabase/middleware.ts`
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  await supabase.auth.getUser()

  return response
}
```

**Verify:** 
- 3 new files in `src/lib/supabase/`
- No TypeScript errors

---

### Step 1.5: Update Prisma Configuration

**File:** `prisma/schema.prisma` (update datasource)
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

**Verify:** Prisma accepts the connection URL format

---

### Step 1.6: Create Database Utility

**File:** `src/lib/db-utils.ts`
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
```

**Verify:** Import works: `import prisma from '@/lib/db-utils'`

---

### ✅ Phase 1 Checkpoint

Before moving to Phase 2, verify:
- [ ] All dependencies installed
- [ ] .env.local created with placeholder values
- [ ] .gitignore updated
- [ ] 3 Supabase client files created
- [ ] Prisma schema updated
- [ ] No TypeScript errors
- [ ] Project still compiles: `npm run build`

---

## 📋 PHASE 2: AUTHENTICATION SYSTEM (90 minutes)

### Step 2.1: Create Auth Types

**File:** `src/lib/types/auth.ts`
```typescript
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
  name: string
}

export interface SignInData {
  email: string
  password: string
}
```

**Verify:** Types are exportable

---

### Step 2.2: Create Auth Service

**File:** `src/lib/auth-service.ts`
```typescript
import { createClient } from '@/lib/supabase/client'
import { SignUpData, SignInData, AuthUser } from '@/lib/types/auth'
import prisma from '@/lib/db-utils'

export class AuthService {
  private supabase = createClient()

  async signUp({ email, password, name }: SignUpData) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    })

    if (error) throw error
    if (!data.user) throw new Error('User creation failed')

    // Create user in Prisma
    try {
      await prisma.user.create({
        data: {
          id: data.user.id,
          email: data.user.email!,
          name,
        },
      })
    } catch (prismaError) {
      console.error('Failed to create user in database:', prismaError)
      // User exists in Supabase but not in DB - handle on first login
    }

    return data.user as AuthUser
  }

  async signIn({ email, password }: SignInData) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    if (!data.user) throw new Error('Sign in failed')

    // Ensure user exists in Prisma
    await this.ensureUserExists(data.user)

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

  private async ensureUserExists(supabaseUser: any) {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { id: supabaseUser.id },
      })

      if (!existingUser) {
        await prisma.user.create({
          data: {
            id: supabaseUser.id,
            email: supabaseUser.email!,
            name: supabaseUser.user_metadata?.name || supabaseUser.email!.split('@')[0],
          },
        })
      }
    } catch (error) {
      console.error('Error ensuring user exists:', error)
    }
  }
}

export const authService = new AuthService()
```

**Verify:** No import errors

---

### Step 2.3: Create Auth Context

**File:** `src/contexts/AuthContext.tsx`
```typescript
'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { AuthUser, AuthState } from '@/lib/types/auth'
import { authService } from '@/lib/auth-service'

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, name: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    // Check active session
    authService.getUser().then((user) => {
      setState({ user, loading: false, error: null })
    })

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      setState({ user, loading: false, error: null })
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setState({ ...state, loading: true, error: null })
      const user = await authService.signUp({ email, password, name })
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
```

**Verify:** Context exports properly

---

### Step 2.4: Add Auth Provider to Layout

**File:** `src/app/layout.tsx` (UPDATE)

Add the AuthProvider wrapper:

```typescript
import { AuthProvider } from '@/contexts/AuthContext'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <AuthProvider>
          <RouteGuard>
            <Navbar />
            <main className="container mx-auto px-4 py-4 pt-20 md:py-8 md:pt-24 max-w-5xl relative z-10 pb-24 md:pb-8">
              {children}
            </main>
          </RouteGuard>
        </AuthProvider>
      </body>
    </html>
  )
}
```

**Verify:** App still renders

---

### Step 2.5: Create Middleware for Route Protection

**File:** `middleware.ts` (in root, next to `package.json`)
```typescript
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - login, signup pages
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|login|signup).*)',
  ],
}
```

**Verify:** Middleware file at project root

---

### Step 2.6: Update Login Page

**File:** `src/app/login/page.tsx` (REPLACE)
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Zap, Mail, Lock, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { signIn, loading, error: authError } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      await signIn(email, password)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to sign in')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
      <Card className="w-full max-w-md shadow-xl border-gray-100">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-gray-600">
            Sign in to continue planning your weekends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {(error || authError) && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p>{error || authError}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 bg-gray-50 border-gray-200"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 bg-gray-50 border-gray-200"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-primary hover:bg-primary-dark text-white font-semibold text-base"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            <p className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/signup" className="text-primary font-semibold hover:underline">
                Sign up
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

**Verify:** Login page renders properly

---

### Step 2.7: Update Signup Page

**File:** `src/app/signup/page.tsx` (REPLACE)
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Zap, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const { signUp, loading } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    try {
      await signUp(email, password, name)
      setSuccess(true)
      setTimeout(() => {
        router.push('/onboarding')
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to create account')
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
        <Card className="w-full max-w-md shadow-xl border-gray-100">
          <CardContent className="pt-16 pb-16 text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Account Created!</h2>
            <p className="text-gray-600">Redirecting to onboarding...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
      <Card className="w-full max-w-md shadow-xl border-gray-100">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900">
            Create Account
          </CardTitle>
          <CardDescription className="text-gray-600">
            Start planning better weekends today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 h-12 bg-gray-50 border-gray-200"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 bg-gray-50 border-gray-200"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 bg-gray-50 border-gray-200"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-primary hover:bg-primary-dark text-white font-semibold text-base"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="text-primary font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

**Verify:** Signup page renders properly

---

### ✅ Phase 2 Checkpoint

Before moving to Phase 3, verify:
- [ ] Auth types created
- [ ] Auth service working
- [ ] Auth context created
- [ ] Auth provider added to layout
- [ ] Middleware configured
- [ ] Login page updated
- [ ] Signup page updated
- [ ] Can navigate to /login and /signup
- [ ] No TypeScript errors
- [ ] Project compiles: `npm run build`

---

## 📋 PHASE 3: API ROUTES & AI INTEGRATION (120 minutes)

*[This section continues with detailed implementation for API routes and AI provider abstraction...]*

---

## 📋 REMAINING PHASES

The complete revised plan includes:
- **Phase 3**: API Routes & AI Integration (120 min)
- **Phase 4**: Production Configuration (45 min)
- **Phase 5**: Testing & Verification (30 min)

---

## ⚠️ IMPORTANT NOTES

### Before You Start
1. **Backup your code**: `git commit -am "Before production upgrade"`
2. **Have Supabase project ready**: You'll need the actual keys
3. **Time allocation**: Set aside 6-8 hours or split across multiple sessions
4. **Test incrementally**: Don't skip checkpoints

### During Implementation
- Follow phases in order (dependencies matter)
- Test after each step
- Don't skip verification steps
- Keep terminal open for error messages

### If Something Breaks
- Check console for errors
- Verify environment variables are set
- Ensure all files were created
- Check TypeScript errors in VSCode
- Restart dev server: `npm run dev`

---

## 📞 Getting Help

If you get stuck:
1. Check the checkpoint verification list
2. Review error messages carefully
3. Ensure all files were created correctly
4. Verify environment variables are loaded
5. Restart TypeScript server in VSCode

---

This plan is designed to be completed in chunks. You can stop after any phase and resume later!
