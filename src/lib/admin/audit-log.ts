import { createClient } from "@/lib/supabase/client";

/**
 * Writes one row to the shared `public.admin_audit_logs` table via the
 * `admin_write_audit_log()` SECURITY DEFINER RPC (the table itself has no
 * direct INSERT policy — this RPC is the only writer, shared with
 * engineer-match-platform's own admin panel since it's the same DB
 * function). Every admin mutation in Kenshu-Match's own /admin should call
 * this so both platforms' admin actions land in one audit trail.
 *
 * Failure here is logged but never thrown — an audit-log hiccup should
 * never block the actual admin action from completing.
 */
export async function writeAdminAuditLog(params: {
  actionType: string;
  targetType: string;
  targetId: string;
  beforeData?: unknown;
  afterData?: unknown;
  reason?: string;
}) {
  const supabase = createClient();
  const { error } = await supabase.rpc("admin_write_audit_log", {
    p_action_type: params.actionType,
    p_target_type: params.targetType,
    p_target_id: params.targetId,
    p_before_data: params.beforeData ?? null,
    p_after_data: params.afterData ?? null,
    p_reason: params.reason ?? null,
  });
  if (error) {
    console.error("writeAdminAuditLog failed", error);
  }
}
