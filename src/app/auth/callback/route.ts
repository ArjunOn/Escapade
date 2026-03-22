import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/";

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Check if new user needs onboarding
      // We can't read Zustand store server-side, so redirect to a client page that handles it
      return NextResponse.redirect(new URL("/auth/complete", request.url));
    }
  }

  // Auth failed — redirect to login with error
  return NextResponse.redirect(new URL("/login?error=oauth_failed", request.url));
}
