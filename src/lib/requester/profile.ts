import { createClient } from "@/lib/supabase/client";
import type { RequesterProfileRow } from "@/types/database";

export async function getRequesterProfile(userId: string) {
  const supabase = createClient();
  return supabase.from("requester_profiles").select("*").eq("id", userId).maybeSingle();
}

export async function upsertRequesterProfile(payload: Partial<RequesterProfileRow> & { id: string }) {
  const supabase = createClient();
  const { error } = await supabase.from("requester_profiles").upsert(payload, { onConflict: "id" });
  return { error };
}

/** Bulk-fetch requester contact info (users + requester_profiles) for a set of ids. */
export async function getRequesterContacts(ids: string[]) {
  const map: Record<string, { id: string; name?: string; email?: string } & Partial<RequesterProfileRow>> = {};
  if (!ids.length) return map;

  const supabase = createClient();
  const { data: users } = await supabase.from("users").select("id, name, email").in("id", ids);
  users?.forEach((u) => {
    map[u.id] = { ...map[u.id], ...u };
  });

  const { data: profiles } = await supabase.from("requester_profiles").select("*").in("id", ids);
  profiles?.forEach((p) => {
    map[p.id] = { ...map[p.id], ...p };
  });

  return map;
}
