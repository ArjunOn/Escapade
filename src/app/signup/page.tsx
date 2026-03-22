"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { Compass, Mail, Lock, User, AlertCircle, Chrome } from "lucide-react";

const FacebookIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

export default function SignupPage() {
  const router = useRouter();
  const { signUp, signInWithGoogle, signInWithFacebook, loading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [oauthLoading, setOauthLoading] = useState<"google" | "facebook" | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Please enter your full name"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    try {
      await signUp(email, password, name.trim());
      // Email confirmation is OFF in Supabase — user is signed in immediately
      // Redirect to onboarding to collect preferences
      router.replace("/onboarding");
    } catch (err: any) {
      setError(err.message || "Sign up failed — please try again");
    }
  };

  const handleGoogle = async () => {
    setError("");
    setOauthLoading("google");
    try {
      await signInWithGoogle();
      // Browser will redirect to /auth/callback — nothing to do here
    } catch (err: any) {
      setError(err.message || "Google sign-in failed");
      setOauthLoading(null);
    }
  };

  const handleFacebook = async () => {
    setError("");
    setOauthLoading("facebook");
    try {
      await signInWithFacebook();
    } catch (err: any) {
      setError(err.message || "Facebook sign-in failed");
      setOauthLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-4 py-8">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)] flex items-center justify-center shadow-lg">
            <Compass className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">Create your account</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">Start discovering events near you</p>
        </div>

        <div className="card p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* OAuth buttons */}
          <div className="space-y-2">
            <button onClick={handleGoogle} disabled={!!oauthLoading || loading}
              className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-alt)] transition-colors disabled:opacity-60">
              {oauthLoading === "google" ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Chrome className="w-4 h-4 text-[#4285F4]" />
              )}
              Continue with Google
            </button>
            <button onClick={handleFacebook} disabled={!!oauthLoading || loading}
              className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-alt)] transition-colors disabled:opacity-60">
              {oauthLoading === "facebook" ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <FacebookIcon />
              )}
              Continue with Facebook
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[var(--color-border)]" />
            <span className="text-xs text-[var(--color-text-muted)]">or sign up with email</span>
            <div className="flex-1 h-px bg-[var(--color-border)]" />
          </div>

          {/* Email form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {[
              { label: "Full name", icon: User,  type: "text",     val: name,     set: setName,     ph: "Your name"         },
              { label: "Email",     icon: Mail,  type: "email",    val: email,    set: setEmail,    ph: "you@example.com"  },
              { label: "Password",  icon: Lock,  type: "password", val: password, set: setPassword, ph: "Min 8 characters"  },
            ].map(({ label, icon: Icon, type, val, set, ph }) => (
              <div key={label} className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--color-text-secondary)]">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                  <input type={type} required value={val} onChange={e => set(e.target.value)} placeholder={ph}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] bg-[var(--color-bg-alt)]" />
                </div>
              </div>
            ))}
            <button type="submit" disabled={loading || !!oauthLoading}
              className="w-full py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-60 mt-1">
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="text-center text-xs text-[var(--color-text-muted)]">
            By signing up you agree to our Terms of Service and Privacy Policy.
          </p>

          <p className="text-center text-sm text-[var(--color-text-secondary)]">
            Already have an account?{" "}
            <Link href="/login" className="text-[var(--color-primary)] font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
