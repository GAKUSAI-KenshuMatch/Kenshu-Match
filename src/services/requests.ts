import { supabase } from "@/lib/supabase/client";
import type { RequestFormat, RequesterType, ResponseAction } from "@/types/database";

export interface NewTrainingRequestInput {
  requester_id: string;
  requester_type: RequesterType;
  title: string;
  description: string;
  expertise_field: string | null;
  budget: number | null;
  participant_count: number | null;
  preferred_format: RequestFormat;
  location: string | null;
  preferred_schedule: string | null;
  target_instructor_id: string | null;
}

export async function createTrainingRequest(input: NewTrainingRequestInput) {
  const { error } = await supabase.from("training_requests").insert(input);
  return { error };
}

/** Unauthenticated / non-instructor preview list (open_requests_public_preview view). */
export async function getOpenRequestsPublicPreview() {
  return supabase.from("open_requests_public_preview").select("*").order("created_at", { ascending: false });
}

export async function getOpenRequestPublicDetail(requestId: string) {
  return supabase.from("open_requests_public_preview").select("*").eq("request_id", requestId).maybeSingle();
}

/** Broadcast (target_instructor_id IS NULL) requests open for an instructor to respond to. */
export async function getOpenRequestsForInstructor() {
  return supabase
    .from("training_requests")
    .select("*, instructor_responses(*), training_reviews(*)")
    .is("target_instructor_id", null)
    .neq("status", "cancelled")
    .order("created_at", { ascending: false });
}

export async function getTrainingRequestDetail(requestId: string) {
  return supabase
    .from("training_requests")
    .select("*, instructor_responses(*), training_reviews(*)")
    .eq("request_id", requestId)
    .maybeSingle();
}

export async function getTrainingRequestWithResponses(requestId: string) {
  return supabase
    .from("training_requests")
    .select("*, instructor_responses(*)")
    .eq("request_id", requestId)
    .maybeSingle();
}

/** Requests directed at a specific instructor (mypage instructor view). */
export async function getRequestsForInstructor(instructorId: string) {
  return supabase
    .from("training_requests")
    .select("*, instructor_responses(*), training_reviews(*)")
    .eq("target_instructor_id", instructorId)
    .order("created_at", { ascending: false });
}

/** Requests posted by a specific requester (mypage requester view). */
export async function getRequestsForRequester(requesterId: string) {
  return supabase
    .from("training_requests")
    .select("*, instructor_responses(*), training_reviews(*)")
    .eq("requester_id", requesterId)
    .order("created_at", { ascending: false });
}

/** Unseen "not selected" broadcast-result badge count, shown on mypage. */
export async function countUnseenNotSelectedResults(instructorId: string) {
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

export async function markResultsSeenByInstructor(responseIds: string[]) {
  if (!responseIds.length) return;
  const { error } = await supabase
    .from("instructor_responses")
    .update({ result_seen_at: new Date().toISOString() })
    .in("response_id", responseIds)
    .is("result_seen_at", null);
  if (error) console.error("markResultsSeenByInstructor error:", error);
}

export async function markResponsesSeenByRequester(responseIds: string[]) {
  if (!responseIds.length) return;
  const { error } = await supabase
    .from("instructor_responses")
    .update({ requester_seen_at: new Date().toISOString() })
    .in("response_id", responseIds)
    .is("requester_seen_at", null);
  if (error) console.error("markResponsesSeenByRequester error:", error);
}

export async function submitInstructorResponse(
  requestId: string,
  instructorId: string,
  action: ResponseAction,
  extra?: { quote_price?: number | null; message?: string | null }
) {
  const { error } = await supabase.from("instructor_responses").insert({
    request_id: requestId,
    instructor_id: instructorId,
    action,
    quote_price: extra?.quote_price ?? null,
    message: extra?.message ?? null,
  });
  return { error };
}

/** Finalizes a request onto one response: marks it selected, accepts the request, unlocks contact info. */
export async function finalizeResponse(params: {
  requestId: string;
  responseId: string;
  requesterId: string;
  instructorId: string;
}) {
  const { requestId, responseId, requesterId, instructorId } = params;

  const { error: e1 } = await supabase
    .from("instructor_responses")
    .update({ is_selected: true })
    .eq("response_id", responseId);
  if (e1) return { error: e1 };

  const { error: e2 } = await supabase
    .from("training_requests")
    .update({ status: "accepted" })
    .eq("request_id", requestId);
  if (e2) return { error: e2 };

  const { error: e3 } = await supabase
    .from("contact_unlocks")
    .insert({ request_id: requestId, response_id: responseId, requester_id: requesterId, instructor_id: instructorId });
  if (e3) return { error: e3 };

  return { error: null };
}

export async function cancelRequest(requestId: string, reason: string | null) {
  const { error } = await supabase
    .from("training_requests")
    .update({ status: "cancelled", cancel_reason: reason, cancelled_at: new Date().toISOString() })
    .eq("request_id", requestId);
  return { error };
}

export async function completeRequest(requestId: string) {
  const { error } = await supabase.from("training_requests").update({ status: "completed" }).eq("request_id", requestId);
  return { error };
}

export async function submitReview(input: {
  request_id: string;
  reviewer_id: string;
  instructor_id: string;
  rating: number;
  comment: string | null;
}) {
  const { error } = await supabase.from("training_reviews").upsert(input, { onConflict: "request_id" });
  return { error };
}

export async function replyToReview(reviewId: string, replyText: string) {
  const { error } = await supabase
    .from("training_reviews")
    .update({ instructor_reply: replyText, replied_at: new Date().toISOString() })
    .eq("review_id", reviewId);
  return { error };
}

/** Instructor's own matching profile (work style / desired rate / expertise ids) used to compute "recommended". */
export async function getMyMatchingProfile(instructorId: string) {
  const { data: profile } = await supabase
    .from("instructor_profiles")
    .select("work_style, desired_rate_min")
    .eq("id", instructorId)
    .maybeSingle();
  const { data: expertiseRows } = await supabase
    .from("instructor_expertise")
    .select("subcategory_id")
    .eq("instructor_id", instructorId);

  return {
    workStyle: profile?.work_style ?? null,
    desiredRateMin: profile?.desired_rate_min ?? null,
    expertiseIds: new Set((expertiseRows || []).map((x) => x.subcategory_id)),
  };
}
