import { createClient } from "@/lib/supabase/client";
import type { ResponseAction } from "@/types/database";

export async function submitInstructorResponse(
  requestId: string,
  instructorId: string,
  action: ResponseAction,
  extra?: { quote_price?: number | null; message?: string | null }
) {
  const supabase = createClient();
  const { error } = await supabase.from("instructor_responses").insert({
    request_id: requestId,
    instructor_id: instructorId,
    action,
    quote_price: extra?.quote_price ?? null,
    message: extra?.message ?? null,
  });
  return { error };
}

export async function markResultsSeenByInstructor(responseIds: string[]) {
  if (!responseIds.length) return;
  const supabase = createClient();
  const { error } = await supabase
    .from("instructor_responses")
    .update({ result_seen_at: new Date().toISOString() })
    .in("response_id", responseIds)
    .is("result_seen_at", null);
  if (error) console.error("markResultsSeenByInstructor error:", error);
}

export async function markResponsesSeenByRequester(responseIds: string[]) {
  if (!responseIds.length) return;
  const supabase = createClient();
  const { error } = await supabase
    .from("instructor_responses")
    .update({ requester_seen_at: new Date().toISOString() })
    .in("response_id", responseIds)
    .is("requester_seen_at", null);
  if (error) console.error("markResponsesSeenByRequester error:", error);
}

/** Unseen "not selected" broadcast-result badge count, shown on mypage. */
export async function countUnseenNotSelectedResults(instructorId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("training_requests")
    .select("request_id, instructor_responses!inner(instructor_id, is_selected, result_seen_at)")
    .is("target_instructor_id", null)
    .eq("status", "accepted")
    .eq("instructor_responses.instructor_id", instructorId)
    .eq("instructor_responses.is_selected", false)
    .is("instructor_responses.result_seen_at", null);
  if (error || !data) return 0;
  return data.length;
}
