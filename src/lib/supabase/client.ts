import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { getSupabaseEnv } from "./env";

/**
 * Browser-side Supabase client. Create a fresh instance where it's used
 * (component/hook scope) rather than caching a module-level singleton — this
 * is the pattern @supabase/ssr's own Next.js App Router docs recommend, since
 * a cached singleton can misbehave across Fast Refresh / RSC boundaries.
 *
 * Session is stored in cookies (not localStorage) so src/proxy.ts and Server
 * Components/Actions can read the same auth state as the browser.
 */
export function createClient() {
  const { url, anonKey } = getSupabaseEnv();
  return createBrowserClient<Database>(url, anonKey);
}
