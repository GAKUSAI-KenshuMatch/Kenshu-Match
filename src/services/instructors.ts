import { supabase } from "@/lib/supabase/client";
import type { InstructorPublicDirectoryRow } from "@/types/database";

export interface CategoryWithSubcategories {
  id?: string;
  name: string;
  sort_order?: number;
  training_subcategories: { id: string; name: string }[];
}

/** Full taxonomy (used by instructor filters, request forms, profile-edit expertise picker). */
export async function getTrainingCategoriesWithSubcategories() {
  return supabase
    .from("training_categories")
    .select("id, name, sort_order, training_subcategories(id, name)")
    .order("sort_order");
}

/** Lightweight taxonomy for <select> options (id + category name / subcategory name). */
export async function getTrainingSubcategoryOptions() {
  return supabase
    .from("training_subcategories")
    .select("id, name, category_id, training_categories(name)")
    .order("name");
}

export async function getInstructorDirectory() {
  return supabase.from("instructor_public_directory").select("*").order("rating_avg", { ascending: false });
}

export async function getFeaturedInstructors(limit = 6) {
  return supabase
    .from("instructor_public_directory")
    .select("*")
    .eq("is_featured", true)
    .order("rating_avg", { ascending: false })
    .limit(limit);
}

export async function getInstructorById(id: string) {
  return supabase.from("instructor_public_directory").select("*").eq("id", id).maybeSingle();
}

export async function getInstructorReviews(instructorId: string) {
  return supabase
    .from("training_reviews")
    .select("rating, comment, created_at")
    .eq("instructor_id", instructorId)
    .order("created_at", { ascending: false });
}

export async function getMatchingCandidateInstructors() {
  return supabase
    .from("instructor_public_directory")
    .select("id, name, work_style, desired_rate_min, rating_avg, prefectures, self_pr");
}

export async function getInstructorNames(ids: string[]) {
  const map: Record<string, Pick<InstructorPublicDirectoryRow, "id" | "name">> = {};
  if (!ids.length) return map;
  const { data, error } = await supabase.from("instructor_public_directory").select("id, name").in("id", ids);
  if (error) {
    console.error("instructor_public_directory query error:", error);
  }
  data?.forEach((i) => {
    map[i.id] = i;
  });
  return map;
}

export async function getInstructorExpertiseInstructorIds(subcategoryId: string) {
  const { data } = await supabase
    .from("instructor_expertise")
    .select("instructor_id")
    .eq("subcategory_id", subcategoryId);
  return new Set((data || []).map((x) => x.instructor_id));
}

/**
 * Finds (or creates) a subcategory by name within a category. Used both by
 * the "add a field not in the list" flows on post-request/instructor-detail
 * (always under the "その他" category) and on instructor-profile-edit
 * (under whichever category the user is browsing).
 */
export async function findOrCreateSubcategory(categoryId: string, name: string) {
  const { data: existing, error: findError } = await supabase
    .from("training_subcategories")
    .select("id, name")
    .eq("category_id", categoryId)
    .ilike("name", name)
    .maybeSingle();

  if (findError) return { error: findError };
  if (existing) return { data: existing };

  const { data: maxRow } = await supabase
    .from("training_subcategories")
    .select("sort_order")
    .eq("category_id", categoryId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextSortOrder = (maxRow?.sort_order || 0) + 1;

  const { data: created, error: createError } = await supabase
    .from("training_subcategories")
    .insert({ category_id: categoryId, name, sort_order: nextSortOrder })
    .select("id, name")
    .single();

  if (createError) return { error: createError };
  return { data: created };
}

export async function getOtherCategory() {
  return supabase.from("training_categories").select("id, name").eq("name", "その他").maybeSingle();
}
