import { createClient } from "@/lib/supabase/client";
import { writeAdminAuditLog } from "./audit-log";

export type AdminSubcategoryRow = {
  id: string;
  category_id: string;
  category_name: string;
  name: string;
  description: string | null;
  sort_order: number;
  created_at: string;
  created_by: string | null;
  instructor_count: number;
  request_count: number;
};

/**
 * Full subcategory list with per-row usage counts, for the admin
 * moderation page. Usage is computed client-side from two flat selects
 * (instructor_expertise.subcategory_id, training_requests.expertise_field)
 * rather than a DB-side aggregate — fine at this data volume, and avoids
 * needing a new RPC just for counting.
 *
 * Requires the `training_requests_select_admin` RLS policy (ADMIN can see
 * all training_requests) or request_count will silently read as 0 for
 * everything.
 */
export async function getSubcategoriesForAdmin(): Promise<{
  data: AdminSubcategoryRow[] | null;
  error: { message: string } | null;
}> {
  const supabase = createClient();

  const [subcategoriesRes, expertiseRes, requestsRes] = await Promise.all([
    supabase
      .from("training_subcategories")
      .select("id, category_id, name, description, sort_order, created_at, created_by, training_categories(name)")
      .order("category_id")
      .order("sort_order"),
    supabase.from("instructor_expertise").select("subcategory_id"),
    supabase.from("training_requests").select("expertise_field"),
  ]);

  if (subcategoriesRes.error) return { data: null, error: subcategoriesRes.error };

  const instructorCounts = new Map<string, number>();
  for (const row of expertiseRes.data || []) {
    instructorCounts.set(row.subcategory_id, (instructorCounts.get(row.subcategory_id) || 0) + 1);
  }
  const requestCounts = new Map<string, number>();
  for (const row of requestsRes.data || []) {
    requestCounts.set(row.expertise_field, (requestCounts.get(row.expertise_field) || 0) + 1);
  }

  // The hand-rolled Database type (src/types/database.ts) doesn't carry FK
  // relationship metadata, so supabase-js can't infer the embedded
  // training_categories(name) shape — same workaround already used in
  // src/lib/instructor/expertise.ts's getTrainingSubcategoryOptions() callers.
  const subcategories = (subcategoriesRes.data || []) as unknown as {
    id: string;
    category_id: string;
    name: string;
    description: string | null;
    sort_order: number;
    created_at: string;
    created_by: string | null;
    training_categories: { name: string } | null;
  }[];

  const rows: AdminSubcategoryRow[] = subcategories.map((s) => ({
    id: s.id,
    category_id: s.category_id,
    category_name: s.training_categories?.name || "",
    name: s.name,
    description: s.description,
    sort_order: s.sort_order,
    created_at: s.created_at,
    created_by: s.created_by,
    instructor_count: instructorCounts.get(s.id) || 0,
    request_count: requestCounts.get(s.id) || 0,
  }));

  return { data: rows, error: null };
}

export async function renameSubcategory(row: AdminSubcategoryRow, newName: string) {
  const trimmed = newName.trim();
  if (!trimmed || trimmed === row.name) return { error: null };

  const supabase = createClient();
  // .select("id") is required here, not cosmetic: without it, an UPDATE
  // that RLS silently filters out (0 rows matched — e.g. the admin RLS
  // policy isn't applied yet, or this user isn't actually ADMIN at the DB
  // level) returns error: null with no indication nothing changed. Forcing
  // a returned row lets us detect that case explicitly below instead of
  // reporting a false success.
  const { data, error } = await supabase
    .from("training_subcategories")
    .update({ name: trimmed })
    .eq("id", row.id)
    .select("id");
  if (error) return { error };
  if (!data || data.length === 0) {
    return { error: { message: "更新対象が見つかりませんでした（権限設定が反映されていない可能性があります）" } };
  }

  await writeAdminAuditLog({
    actionType: "subcategory_rename",
    targetType: "training_subcategory",
    targetId: row.id,
    beforeData: { name: row.name },
    afterData: { name: trimmed },
  });

  return { error: null };
}

/**
 * Only safe to call when the row's instructor_count and request_count are
 * both 0 — the page hides the delete action otherwise. The DB has no
 * cascade from training_requests.expertise_field, so a delete while in use
 * would fail on a foreign-key violation anyway; the UI check just avoids
 * showing a broken button.
 */
export async function deleteSubcategory(row: AdminSubcategoryRow) {
  const supabase = createClient();
  // Same reasoning as renameSubcategory: .select("id") forces a real
  // affected-rows signal instead of a silent RLS no-op reading as success.
  const { data, error } = await supabase.from("training_subcategories").delete().eq("id", row.id).select("id");
  if (error) return { error };
  if (!data || data.length === 0) {
    return { error: { message: "削除対象が見つかりませんでした（権限設定が反映されていない可能性があります）" } };
  }

  await writeAdminAuditLog({
    actionType: "subcategory_delete",
    targetType: "training_subcategory",
    targetId: row.id,
    beforeData: { name: row.name, category_id: row.category_id },
  });

  return { error: null };
}
