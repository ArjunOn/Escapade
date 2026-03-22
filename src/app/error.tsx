"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to console in dev; in prod send to your error tracking service
    console.error("[Escapade Error]", error);
  }, [error]);

  const isAuthError =
    error?.message?.toLowerCase().includes("refresh token") ||
    error?.message?.toLowerCase().includes("session");

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] p-6">
      <div className="max-w-md w-full text-center space-y-5">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7 text-[var(--color-error)]" />
        </div>

        <div>
          <h1 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
            {isAuthError ? "Session expired" : "Something went wrong"}
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {isAuthError
              ? "Your login session has expired. Please sign in again."
              : "An unexpected error occurred. Try refreshing the page."}
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          {isAuthError ? (
            <Link
              href="/login"
              className="btn-primary rounded-full px-5 py-2 text-sm"
            >
              Sign in again
            </Link>
          ) : (
            <button
              onClick={reset}
              className="btn-primary rounded-full px-5 py-2 text-sm flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Try again
            </button>
          )}
          <Link
            href="/"
            className="btn-ghost rounded-full px-5 py-2 text-sm border border-[var(--color-border)]"
          >
            Go home
          </Link>
        </div>

        {process.env.NODE_ENV === "development" && (
          <details className="text-left mt-4">
            <summary className="text-xs text-[var(--color-text-muted)] cursor-pointer">
              Error details (dev only)
            </summary>
            <pre className="mt-2 text-xs bg-[var(--color-bg-alt)] p-3 rounded-xl overflow-auto text-red-600">
              {error.message}
              {error.stack && "\n\n" + error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
