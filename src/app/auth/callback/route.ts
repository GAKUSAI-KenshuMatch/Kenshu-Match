import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Exchanges a Supabase PKCE `code` for a session after Google sign-in.
 * @supabase/ssr's browser and server clients both default to flowType:
 * "pkce" (node_modules/@supabase/ssr/dist/main/createBrowserClient.js), so
 * the OAuth redirect carries a `?code=` query param that must be exchanged
 * server-side -- it is not auto-detected client-side the way the old
 * implicit-flow supabase-js client's hash-fragment tokens were.
 *
 * Always redirects to /mypage on success: AuthContext's own
 * needsProfileCompletion check (src/contexts/AuthContext.tsx) already
 * detects a missing public.users row after the session loads and bounces to
 * /complete-profile from there, so that decision isn't duplicated here.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}/mypage`);
    }
    console.error("[auth/callback] exchangeCodeForSession failed:", error);
  }

  return NextResponse.redirect(`${origin}/login`);
}
