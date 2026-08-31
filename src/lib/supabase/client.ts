import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env.local and fill in your Supabase project values."
  );
}

// A single browser-side Supabase client, same auth model as the legacy site:
// email/password + Google OAuth, session persisted by supabase-js itself
// (localStorage), no server-rendered/cookie-based session. All pages that
// use this client are Client Components ('use client').
export const supabase = createClient<Database>(supabaseUrl!, supabaseAnonKey!);
