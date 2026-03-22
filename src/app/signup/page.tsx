"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { Compass, Mail, Lock, User, AlertCircle, CheckCircle } from "lucide-react";

export default function SignupPage() {
  const { signUp, loading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    try {
      await signUp(email, password, name);
      setDone(true);
    } catch (err: any) {
      setError(err.message || "Sign up failed");
    }
  };

  if (done) return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="w-full max-w-sm text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[var(--color-success)] flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Check your email</h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
        </p>
        <Link href="/login" className="block text-sm text-[var(--color-primary)] font-medium hover:underline">
          Back to sign in
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="w-full max-w-sm space-y-6">
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
              <AlertCircle className="w-4 h-4 flex-shrink-0" /><p>{error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: "Full name", icon: User, type: "text", val: name, set: setName, ph: "Your name" },
              { label: "Email", icon: Mail, type: "email", val: email, set: setEmail, ph: "you@example.com" },
              { label: "Password", icon: Lock, type: "password", val: password, set: setPassword, ph: "Min 8 characters" },
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
            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-60 mt-2">
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
          <p className="text-center text-sm text-[var(--color-text-secondary)]">
            Already have an account?{" "}
            <Link href="/login" className="text-[var(--color-primary)] font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
