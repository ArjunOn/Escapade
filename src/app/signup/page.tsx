"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { Compass, Mail, Lock, User, AlertCircle, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { validateSignupForm } from "@/lib/validation";
import { cn } from "@/lib/utils";

// Password strength helper
function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  if (score <= 1) return { score, label: "Weak", color: "#ef4444" };
  if (score <= 2) return { score, label: "Fair", color: "#f97316" };
  if (score <= 3) return { score, label: "Good", color: "#eab308" };
  return { score, label: "Strong", color: "#22c55e" };
}

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signUp, loading, user } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string; email?: string; password?: string; confirmPassword?: string; form?: string
  }>({});
  const [submitting, setSubmitting] = useState(false);

  // Already signed in
  useEffect(() => {
    if (user && !loading) router.replace("/onboarding");
  }, [user, loading, router]);

  const strength = getPasswordStrength(password);

  // Clear individual field errors on change
  const field = (key: keyof typeof errors, value: string, setter: (v: string) => void) => {
    setter(value);
    if (errors[key]) setErrors(e => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const next: typeof errors = {};
    const checks = validateSignupForm(email, password, name.trim());
    if (checks.errors.email) next.email = checks.errors.email;
    if (checks.errors.password) next.password = checks.errors.password;
    if (checks.errors.username) next.name = checks.errors.username;
    if (!confirmPassword) {
      next.confirmPassword = "Please confirm your password";
    } else if (confirmPassword !== password) {
      next.confirmPassword = "Passwords do not match";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!validate()) return;

    setSubmitting(true);
    try {
      await signUp(email, password, name.trim());
      router.replace("/onboarding");
    } catch (err: any) {
      const code = err?.code ?? "";
      if (code === "email_exists") {
        setErrors({
          email: "An account with this email already exists.",
          form: "already_exists",
        });
      } else {
        setErrors({ form: err.message || "Sign up failed — please try again." });
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
            <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">Create your account</h1>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">Start discovering events near you</p>
          </div>
        </div>

        <div className="card p-6 space-y-5">
          {/* Generic form error */}
          {errors.form && errors.form !== "already_exists" && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>{errors.form}</p>
            </div>
          )}

          {/* Email already exists prompt */}
          {errors.form === "already_exists" && (
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-3">
              <div className="flex items-start gap-2.5 text-blue-800 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>An account with this email already exists.</p>
              </div>
              <Link
                href={`/login?email=${encodeURIComponent(email)}`}
                className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-blue-700 text-white text-sm font-medium hover:bg-blue-800 transition-colors"
              >
                Sign in instead
              </Link>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Full name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--color-text-secondary)]">Full name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                <input
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={e => field("name", e.target.value, setName)}
                  placeholder="Your name"
                  className={cn(
                    "w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 bg-[var(--color-bg-alt)] text-[var(--color-text-primary)] transition-colors",
                    errors.name
                      ? "border-red-400 focus:ring-red-300"
                      : "border-[var(--color-border)] focus:ring-[var(--color-primary)]"
                  )}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--color-text-secondary)]">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={e => field("email", e.target.value, setEmail)}
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

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--color-text-secondary)]">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={e => field("password", e.target.value, setPassword)}
                  placeholder="Min 8 characters"
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
              {/* Strength meter */}
              {password && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{
                          background: strength.score >= i ? strength.color : "var(--color-border)",
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-xs" style={{ color: strength.color }}>
                    {strength.label}
                  </p>
                </div>
              )}
              {errors.password && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.password}
                </p>
              )}
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--color-text-secondary)]">Confirm password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                <input
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={e => field("confirmPassword", e.target.value, setConfirmPassword)}
                  placeholder="Re-enter password"
                  className={cn(
                    "w-full pl-9 pr-10 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 bg-[var(--color-bg-alt)] text-[var(--color-text-primary)] transition-colors",
                    errors.confirmPassword
                      ? "border-red-400 focus:ring-red-300"
                      : confirmPassword && confirmPassword === password
                      ? "border-green-400 focus:ring-green-300"
                      : "border-[var(--color-border)] focus:ring-[var(--color-primary)]"
                  )}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {confirmPassword && confirmPassword === password && (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  )}
                  <button
                    type="button"
                    onClick={() => setShowConfirm(s => !s)}
                    className="text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-60 mt-1"
            >
              {isLoading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="text-center text-xs text-[var(--color-text-muted)]">
            By signing up you agree to our Terms of Service and Privacy Policy.
          </p>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--color-border)]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-[var(--color-surface)] text-[var(--color-text-muted)]">or</span>
            </div>
          </div>

          <p className="text-center text-sm text-[var(--color-text-secondary)]">
            Already have an account?{" "}
            <Link href="/login" className="text-[var(--color-primary)] font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
