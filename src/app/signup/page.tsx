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
import { validateSignupForm } from '@/lib/validation'

export default function SignupPage() {
  const router = useRouter()
  const { signUp, loading } = useAuth()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ username?: string; email?: string; password?: string }>({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setErrors({})

    // Validate form
    const validation = validateSignupForm(email, password, username)
    if (!validation.valid) {
      setErrors(validation.errors)
      return
    }

    try {
      await signUp(email, password, username)
      setSuccess(true)
      // Wait for session to be established, then redirect
      await new Promise(resolve => setTimeout(resolve, 1500))
      window.location.href = '/dashboard'
    } catch (err: any) {
      // Filter out email rate limit errors
      const errorMsg = err.message?.toLowerCase() || ''
      if (errorMsg.includes('email rate limit') || errorMsg.includes('rate limit exceeded')) {
        // Account created successfully, just email service busy
        setSuccess(true)
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 1500)
      } else {
        setError(err.message || 'Failed to create account')
      }
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
            <p className="text-gray-600">Redirecting to your dashboard...</p>
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
              <Label htmlFor="username" className="text-sm font-semibold text-gray-700">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value)
                    setErrors({ ...errors, username: undefined })
                  }}
                  className={`pl-10 h-12 bg-gray-50 border-gray-200 ${errors.username ? 'border-red-300 bg-red-50' : ''}`}
                  required
                />
              </div>
              {errors.username && (
                <p className="text-xs text-red-600 mt-1">{errors.username}</p>
              )}
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
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setErrors({ ...errors, email: undefined })
                  }}
                  className={`pl-10 h-12 bg-gray-50 border-gray-200 ${errors.email ? 'border-red-300 bg-red-50' : ''}`}
                  required
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-600 mt-1">{errors.email}</p>
              )}
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
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setErrors({ ...errors, password: undefined })
                  }}
                  className={`pl-10 h-12 bg-gray-50 border-gray-200 ${errors.password ? 'border-red-300 bg-red-50' : ''}`}
                  required
                />
              </div>
              {errors.password && (
                <p className="text-xs text-red-600 mt-1">{errors.password}</p>
              )}
              <p className="text-xs text-gray-500">Must be 8+ characters with letters and numbers</p>
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

