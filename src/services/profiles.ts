import { supabase } from "@/lib/supabase/client";
import type { InstructorProfileRow, RequesterProfileRow } from "@/types/database";

export async function getRequesterProfile(userId: string) {
  return supabase.from("requester_profiles").select("*").eq("id", userId).maybeSingle();
}

export async function upsertRequesterProfile(payload: Partial<RequesterProfileRow> & { id: string }) {
  const { error } = await supabase.from("requester_profiles").upsert(payload, { onConflict: "id" });
  return { error };
}

export async function getInstructorProfile(userId: string) {
  return supabase.from("instructor_profiles").select("*").eq("id", userId).maybeSingle();
}

/** Used by the mypage instructor status card: a lighter-weight column set. */
export async function getInstructorProfileSummary(userId: string) {
  return supabase
    .from("instructor_profiles")
    .select("id, is_public, prefectures, self_pr, contact_email, contact_phone")
    .eq("id", userId)
    .maybeSingle();
}

export async function upsertInstructorProfile(payload: Partial<InstructorProfileRow> & { id: string }) {
  const { error } = await supabase.from("instructor_profiles").upsert(payload, { onConflict: "id" });
  return { error };
}

export async function getInstructorExpertiseIds(instructorId: string) {
  const { data } = await supabase
    .from("instructor_expertise")
    .select("subcategory_id")
    .eq("instructor_id", instructorId);
  return (data || []).map((r) => r.subcategory_id);
}

/**
 * Replaces an instructor's expertise rows: delete-all then re-insert the
 * selected subcategory ids. Mirrors instructor-profile-edit.html exactly
 * (simple and reliable, per its own comment).
 */
export async function replaceInstructorExpertise(instructorId: string, subcategoryIds: string[]) {
  const { error: deleteError } = await supabase
    .from("instructor_expertise")
    .delete()
    .eq("instructor_id", instructorId);
  if (deleteError) return { error: deleteError };

  if (subcategoryIds.length) {
    const rows = subcategoryIds.map((subcategory_id) => ({ instructor_id: instructorId, subcategory_id }));
    const { error: insertError } = await supabase.from("instructor_expertise").insert(rows);
    if (insertError) return { error: insertError };
  }
  return { error: null };
}

/** Bulk-fetch requester contact info (users + requester_profiles) for a set of ids. */
export async function getRequesterContacts(ids: string[]) {
  const map: Record<string, { id: string; name?: string; email?: string } & Partial<RequesterProfileRow>> = {};
  if (!ids.length) return map;

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

/** Bulk-fetch instructor contact info (unlocked instructor_profiles columns) for a set of ids. */
export async function getInstructorContacts(ids: string[]) {
  if (!ids.length) return {} as Record<string, { id: string; contact_email: string | null; contact_phone: string | null }>;
  const { data } = await supabase
    .from("instructor_profiles")
    .select("id, contact_email, contact_phone")
    .in("id", ids);
  const map: Record<string, { id: string; contact_email: string | null; contact_phone: string | null }> = {};
  data?.forEach((i) => {
    map[i.id] = i;
  });
  return map;
}
