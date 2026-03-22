"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useAppStore } from "@/store";
import { Loader2 } from "lucide-react";

// This page handles post-OAuth redirect.
// It waits for the auth state to settle, then sends the user to onboarding (new) or dashboard (returning).
export default function AuthCompletePage() {
  const { user, loading } = useAuth();
  const { userProfile } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    // Give the store a moment to hydrate from the auth state change
    const t = setTimeout(() => {
      if (!userProfile?.onboardingCompleted) {
        router.replace("/onboarding");
      } else {
        router.replace("/");
      }
    }, 600);
    return () => clearTimeout(t);
  }, [user, loading, userProfile, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
        <p className="text-sm text-[var(--color-text-secondary)]">Signing you in…</p>
      </div>
    </div>
  );
}
