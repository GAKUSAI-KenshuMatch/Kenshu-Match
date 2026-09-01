/**
 * Hand-written Supabase types, derived from actual usage in the legacy
 * assets/*.js and *.html files (queries, inserts, updates, selects).
 * No column here is invented — anything not observed in the legacy code is
 * left out. If the real schema has more columns/tables, extend this file
 * rather than guessing further.
 *
 * NOTE: every row shape below is a `type` alias, not an `interface`.
 * @supabase/postgrest-js structurally checks each Row/Insert/Update against
 * `Record<string, unknown>`, and TypeScript's `interface` declarations don't
 * satisfy that check the way object-literal `type` aliases do (a well-known
 * quirk — see supabase/postgrest-js#544) — using `interface` here silently
 * collapses every query result to `never`.
 */

export type UserRole = "INSTRUCTOR" | "COMPANY" | "INDIVIDUAL" | "ADMIN";

export type WorkStyle = "ONLINE" | "ONSITE" | "HYBRID";

export type RequestFormat = "online" | "offline" | "both";

export type RequesterType = "company" | "individual";

export type RequestStatus = "pending" | "accepted" | "completed" | "cancelled";

export type ResponseAction = "accept" | "quote" | "reject" | "withdrawn";

export type UserRow = {
  id: string;
  role: UserRole;
  name: string;
  status: string | null;
  email: string;
};

export type RequesterProfileRow = {
  id: string;
  company_name: string | null;
  website: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  department: string | null;
  position: string | null;
};

export type InstructorProfileRow = {
  id: string;
  is_public: boolean;
  prefectures: string[] | null;
  years_of_experience: number | null;
  self_pr: string | null;
  work_style: WorkStyle | null;
  desired_rate_min: number | null;
  desired_rate_max: number | null;
  certifications: string[] | null;
  portfolio_url: string | null;
  avatar_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
};

export type InstructorExpertiseRow = {
  instructor_id: string;
  subcategory_id: string;
};

export type TrainingCategoryRow = {
  id: string;
  name: string;
  sort_order: number;
};

export type TrainingSubcategoryRow = {
  id: string;
  category_id: string;
  name: string;
  sort_order: number;
};

export type TrainingRequestRow = {
  request_id: string;
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
  status: RequestStatus;
  cancel_reason: string | null;
  cancelled_at: string | null;
  created_at: string;
};

export type InstructorResponseRow = {
  response_id: string;
  request_id: string;
  instructor_id: string;
  action: ResponseAction;
  quote_price: number | null;
  message: string | null;
  is_selected: boolean;
  result_seen_at: string | null;
  requester_seen_at: string | null;
};

export type TrainingReviewRow = {
  review_id: string;
  request_id: string;
  reviewer_id: string;
  instructor_id: string;
  rating: number;
  comment: string | null;
  instructor_reply: string | null;
  replied_at: string | null;
  created_at: string;
};

export type ContactUnlockRow = {
  request_id: string;
  response_id: string;
  requester_id: string;
  instructor_id: string;
};

/** VIEW: public directory of instructor profiles (no contact_email/contact_phone). */
export type InstructorPublicDirectoryRow = {
  id: string;
  name: string | null;
  expertise_fields: string[] | null;
  work_style: WorkStyle | null;
  prefectures: string[] | null;
  desired_rate_min: number | null;
  desired_rate_max: number | null;
  rating_avg: number | null;
  review_count: number | null;
  self_pr: string | null;
  certifications: string[] | null;
  portfolio_url: string | null;
  avatar_url: string | null;
  years_of_experience: number | null;
  is_featured: boolean | null;
};

/** VIEW: public preview of broadcast (target_instructor_id IS NULL) requests. */
export type OpenRequestPublicPreviewRow = {
  request_id: string;
  title: string;
  description: string;
  requester_type: RequesterType;
  created_at: string;
  preferred_format: RequestFormat;
  budget: number | null;
  location: string | null;
  preferred_schedule: string | null;
};

// @supabase/postgrest-js's GenericTable/GenericView require a Relationships
// field structurally (even when empty) or the generic client's type
// inference silently collapses every query result to `never`.
type TableDef<Row> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: [];
};

type ViewDef<Row> = {
  Row: Row;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      users: TableDef<UserRow>;
      requester_profiles: TableDef<RequesterProfileRow>;
      instructor_profiles: TableDef<InstructorProfileRow>;
      instructor_expertise: TableDef<InstructorExpertiseRow>;
      training_categories: TableDef<TrainingCategoryRow>;
      training_subcategories: TableDef<TrainingSubcategoryRow>;
      training_requests: TableDef<TrainingRequestRow>;
      instructor_responses: TableDef<InstructorResponseRow>;
      training_reviews: TableDef<TrainingReviewRow>;
      contact_unlocks: TableDef<ContactUnlockRow>;
    };
    Views: {
      instructor_public_directory: ViewDef<InstructorPublicDirectoryRow>;
      open_requests_public_preview: ViewDef<OpenRequestPublicPreviewRow>;
    };
    Functions: {
      complete_oauth_profile: {
        Args: { p_role: UserRole; p_name: string };
        Returns: void;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
