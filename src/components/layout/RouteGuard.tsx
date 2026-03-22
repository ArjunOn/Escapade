"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

// Routes accessible without any auth
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/signup",
  "/auth/callback",
  "/auth/complete",
];

// Routes that require auth but NOT completed onboarding
const ONBOARDING_EXEMPT = ["/onboarding", "/auth/complete"];

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const redirecting = useRef(false);

  useEffect(() => {
    if (loading) return;
    if (redirecting.current) return;

    const isPublic = PUBLIC_ROUTES.some(r => pathname === r || pathname.startsWith("/auth/"));
    const isOnboardingExempt = ONBOARDING_EXEMPT.some(r => pathname.startsWith(r));

    if (!user && !isPublic) {
      // Unauthenticated on protected route → login
      redirecting.current = true;
      router.replace("/login");
      return;
    }

    redirecting.current = false;
  }, [user, loading, pathname, router]);

  // Show spinner only during initial auth load
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[var(--color-text-muted)]">Loading…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
