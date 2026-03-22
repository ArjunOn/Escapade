"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useAppStore } from "@/store";
import Link from "next/link";
import { Compass, Mail, Lock, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, loading, user } = useAuth();
  const { userProfile } = useAppStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // If already signed in, redirect appropriately
  useEffect(() => {
    if (user && !loading) {
      if (!userProfile?.onboardingCompleted) {
        router.replace("/onboarding");
      } else {
        router.replace("/");
      }
    }
  }, [user, loading, userProfile, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await signIn(email, password);
      // Redirect handled by useEffect above once auth state updates
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)] flex items-center justify-center shadow-lg">
            <Compass className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">Welcome back</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">Sign in to your Escapade account</p>
        </div>

        <div className="card p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--color-text-secondary)]">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-bg-alt)]" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--color-text-secondary)]">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-bg-alt)]" />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-60">
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="text-center text-sm text-[var(--color-text-secondary)]">
            No account?{" "}
            <Link href="/signup" className="text-[var(--color-primary)] font-medium hover:underline">Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
