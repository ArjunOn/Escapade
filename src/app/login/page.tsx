"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useAppStore } from "@/store";
import Link from "next/link";
import { Compass, Mail, Lock, AlertCircle, Eye, EyeOff, UserPlus } from "lucide-react";
import { validateEmail } from "@/lib/validation";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, loading, user } = useAuth();
  const { userProfile } = useAppStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [noAccountFound, setNoAccountFound] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already signed in
  useEffect(() => {
    if (user && !loading) {
      router.replace(userProfile?.onboardingCompleted ? "/" : "/onboarding");
    }
  }, [user, loading, userProfile, router]);

  const handleEmailChange = (v: string) => {
    setEmail(v);
    setNoAccountFound(false);
    if (errors.email && v) {
      const check = validateEmail(v);
      if (check.valid) setErrors(e => ({ ...e, email: undefined }));
    }
  };

  const handlePasswordChange = (v: string) => {
    setPassword(v);
    if (errors.password && v) setErrors(e => ({ ...e, password: undefined }));
  };

  const validate = () => {
    const next: typeof errors = {};
    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) next.email = emailCheck.error;
    if (!password) next.password = "Password is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNoAccountFound(false);
    setErrors({});
    if (!validate()) return;

    setSubmitting(true);
    try {
      await signIn(email, password);
    } catch (err: any) {
      const code = err?.code ?? "";
      if (code === "invalid_credentials") {
        setNoAccountFound(true);
        setErrors({ form: err.message });
      } else {
        setErrors({ form: err.message || "Sign in failed — please try again." });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const isLoading = loading || submitting;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-4 py-8">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary)] flex items-center justify-center shadow-lg">
            <Compass className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">Welcome back</h1>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">Sign in to your Escapade account</p>
          </div>
        </div>

        <div className="card p-6 space-y-5">
          {errors.form && !noAccountFound && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>{errors.form}</p>
            </div>
          )}

          {noAccountFound && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-3">
              <div className="flex items-start gap-2.5 text-amber-800 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>No account found with these credentials. Check your details or create a new account.</p>
              </div>
              <Link
                href={`/signup?email=${encodeURIComponent(email)}`}
                className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-amber-700 text-white text-sm font-medium hover:bg-amber-800 transition-colors"
              >
                <UserPlus className="w-4 h-4" /> Create a free account
              </Link>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--color-text-secondary)]">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={e => handleEmailChange(e.target.value)}
                  onBlur={() => {
                    const check = validateEmail(email);
                    if (!check.valid) setErrors(e => ({ ...e, email: check.error }));
                  }}
                  placeholder="you@example.com"
                  className={cn(
                    "w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 bg-[var(--color-bg-alt)] text-[var(--color-text-primary)] transition-colors",
                    errors.email
                      ? "border-red-400 focus:ring-red-300"
                      : "border-[var(--color-border)] focus:ring-[var(--color-primary)]"
                  )}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--color-text-secondary)]">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={e => handlePasswordChange(e.target.value)}
                  placeholder="••••••••"
                  className={cn(
                    "w-full pl-9 pr-10 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 bg-[var(--color-bg-alt)] text-[var(--color-text-primary)] transition-colors",
                    errors.password
                      ? "border-red-400 focus:ring-red-300"
                      : "border-[var(--color-border)] focus:ring-[var(--color-primary)]"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-60 mt-1"
            >
              {isLoading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--color-border)]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-[var(--color-surface)] text-[var(--color-text-muted)]">or</span>
            </div>
          </div>

          <p className="text-center text-sm text-[var(--color-text-secondary)]">
            No account yet?{" "}
            <Link href="/signup" className="text-[var(--color-primary)] font-semibold hover:underline">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
