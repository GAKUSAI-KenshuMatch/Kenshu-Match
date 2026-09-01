import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";
import { getSupabaseEnv } from "./env";

/**
 * Server-side Supabase client for Server Components, Server Actions, and
 * Route Handlers. `cookies()` is async (required since Next.js 15, and the
 * only mode Next.js 16 supports), so this factory is async too.
 *
 * Server Components can read cookies but cannot write them — the `setAll`
 * catch below is expected there and is harmless as long as `src/proxy.ts` is
 * refreshing the session on every request.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseEnv();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component render — cookies can't be set
          // here. Safe to ignore: src/proxy.ts refreshes the session and
          // Server Actions / Route Handlers can still set cookies normally.
        }
      },
    },
  });
}
