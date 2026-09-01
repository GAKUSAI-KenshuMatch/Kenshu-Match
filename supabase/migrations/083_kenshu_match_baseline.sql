-- 083_kenshu_match_baseline.sql
--
-- Baseline capture of Kenshu-Match's own schema. Written retroactively on
-- 2026-09-01 by introspecting the live database via the Supabase Studio SQL
-- Editor (information_schema, pg_constraint, pg_policies, pg_views,
-- pg_proc) -- not derived from guesses. This Supabase project
-- (gsqaggzafutqeypkamae) is SHARED with engineer-match-platform; migrations
-- 001-082 in this same folder belong to that app and are copied here only
-- so the Supabase CLI's migration ledger stays consistent across both
-- repos. Nothing below touches engineer-match's tables.
--
-- Everything below is Kenshu-Match's own domain: instructor <-> requester
-- (company/individual) training matching. All statements are idempotent
-- (IF NOT EXISTS / DROP+CREATE) so this file is safe to re-run.
--
-- IMPORTANT: these objects already exist live. Do NOT `supabase db push`
-- this file blindly -- if push reports it needs to run, prefer confirming
-- first, then mark it applied instead:
--   supabase migration repair --status applied 083
-- Only actually execute this file's DDL if bootstrapping a *fresh* database
-- that doesn't have these objects yet.
--
-- Known pre-existing quirks captured as-is (not introduced by this file --
-- see conversation history for details, left for a future decision):
--   * instructor_profiles has both an old policy set (*_self, plain
--     auth.uid()=id) and a newer role-checked set (*_own / *_admin using
--     private.current_user_role()) active at the same time -- redundant,
--     not contradictory, but worth cleaning up eventually.
--   * instructor_profiles_select_applicant_company references
--     engineer-match's applications/opportunities tables -- lets a company
--     see an instructor's profile if that same person also applied to one
--     of the company's engineer-match job postings. Cross-app by design or
--     accident is undetermined; left untouched here.
--   * instructor_profiles.prefecture (singular, varchar(20)) coexists with
--     prefectures (text[]) -- looks like a superseded column that was never
--     dropped. Kept as-is.
--   * src/types/database.ts is missing a few live columns (rating_avg,
--     is_featured, training_subcategories.description,
--     instructor_responses.reveal_contact/created_at) and has
--     training_requests.expertise_field as nullable when it's actually
--     NOT NULL live. Follow-up: sync database.ts to this file.

-- ============================================================
-- Tables
-- ============================================================

create table if not exists public.requester_profiles (
    id uuid primary key references public.users(id) on delete cascade,
    company_name text,
    website text,
    phone text,
    address text,
    department text,
    "position" text,
    notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.instructor_profiles (
    id uuid primary key references public.users(id) on delete cascade,
    is_public boolean not null default true,
    is_featured boolean not null default false,
    prefecture varchar(20),
    prefectures text[],
    years_of_experience integer,
    self_pr text,
    work_style varchar(20),
    desired_rate_min integer,
    desired_rate_max integer,
    certifications text[],
    portfolio_url varchar(255),
    avatar_url varchar(255),
    contact_email text,
    contact_phone text,
    rating_avg numeric not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint chk_instructor_profiles_self_pr_length check (char_length(self_pr) <= 2000),
    constraint chk_instructor_profiles_rate_min check (desired_rate_min >= 0),
    constraint chk_instructor_profiles_rate_max check (desired_rate_max >= 0),
    constraint chk_instructor_profiles_rate_order check (desired_rate_min <= desired_rate_max),
    constraint chk_instructor_profiles_years check (years_of_experience >= 0 and years_of_experience <= 50),
    constraint chk_instructor_profiles_rating_avg check (rating_avg >= 0 and rating_avg <= 5),
    constraint chk_instructor_profiles_work_style check (work_style in ('ONLINE','ONSITE','HYBRID'))
);

create table if not exists public.training_categories (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    sort_order integer not null,
    created_at timestamptz not null default now(),
    constraint training_categories_name_key unique (name)
);

create table if not exists public.training_subcategories (
    id uuid primary key default gen_random_uuid(),
    category_id uuid not null references public.training_categories(id) on delete restrict,
    name text not null,
    description text,
    sort_order integer not null,
    created_at timestamptz not null default now(),
    constraint training_subcategories_category_id_name_key unique (category_id, name)
);

create table if not exists public.instructor_expertise (
    instructor_id uuid not null references public.instructor_profiles(id) on delete cascade,
    subcategory_id uuid not null references public.training_subcategories(id) on delete cascade,
    created_at timestamptz not null default now(),
    primary key (instructor_id, subcategory_id)
);

create table if not exists public.training_requests (
    request_id uuid primary key default gen_random_uuid(),
    requester_id uuid not null references public.users(id) on delete restrict,
    requester_type text not null,
    title text not null,
    description text not null,
    expertise_field uuid not null references public.training_subcategories(id),
    budget numeric,
    preferred_format text not null,
    location text,
    preferred_schedule text,
    target_instructor_id uuid references public.users(id) on delete set null,
    status text not null default 'pending',
    cancel_reason text,
    cancelled_at timestamptz,
    created_at timestamptz not null default now(),
    participant_count integer,
    constraint training_requests_participant_count_positive check (participant_count is null or participant_count > 0),
    constraint training_requests_requester_type_check check (requester_type = any (array['company','individual'])),
    constraint training_requests_preferred_format_check check (preferred_format = any (array['online','offline','both'])),
    constraint training_requests_status_check check (status = any (array['pending','accepted','cancelled','completed'])),
    constraint training_requests_location_required_unless_online check (preferred_format = 'online' or location is not null)
);

create table if not exists public.instructor_responses (
    response_id uuid primary key default gen_random_uuid(),
    request_id uuid not null references public.training_requests(request_id) on delete restrict,
    instructor_id uuid not null references public.users(id) on delete restrict,
    action text not null,
    quote_price numeric,
    message text,
    reveal_contact boolean not null default false,
    is_selected boolean not null default false,
    created_at timestamptz not null default now(),
    result_seen_at timestamptz,
    requester_seen_at timestamptz,
    constraint instructor_responses_action_check check (action = any (array['accept','quote','reject','withdrawn'])),
    constraint instructor_responses_quote_price_required check (action <> 'quote' or quote_price is not null),
    constraint instructor_responses_unique_per_request unique (request_id, instructor_id)
);

create table if not exists public.training_reviews (
    review_id uuid primary key default gen_random_uuid(),
    request_id uuid not null references public.training_requests(request_id) on delete restrict,
    reviewer_id uuid not null references public.users(id) on delete restrict,
    instructor_id uuid not null references public.users(id) on delete restrict,
    rating smallint not null,
    comment text,
    instructor_reply text,
    replied_at timestamptz,
    created_at timestamptz not null default now(),
    constraint training_reviews_rating_check check (rating >= 1 and rating <= 5),
    constraint training_reviews_unique_per_request unique (request_id)
);

create table if not exists public.contact_unlocks (
    unlock_id uuid primary key default gen_random_uuid(),
    request_id uuid not null references public.training_requests(request_id) on delete restrict,
    response_id uuid not null references public.instructor_responses(response_id) on delete restrict,
    requester_id uuid not null references public.users(id) on delete restrict,
    instructor_id uuid not null references public.users(id) on delete restrict,
    unlocked_at timestamptz not null default now(),
    constraint contact_unlocks_unique_per_request unique (request_id)
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.requester_profiles enable row level security;
alter table public.instructor_profiles enable row level security;
alter table public.training_categories enable row level security;
alter table public.training_subcategories enable row level security;
alter table public.instructor_expertise enable row level security;
alter table public.training_requests enable row level security;
alter table public.instructor_responses enable row level security;
alter table public.training_reviews enable row level security;
alter table public.contact_unlocks enable row level security;

-- ---- requester_profiles ----
drop policy if exists requester_profiles_insert_own on public.requester_profiles;
create policy requester_profiles_insert_own on public.requester_profiles
  for insert to authenticated with check (auth.uid() = id);

drop policy if exists requester_profiles_select_own on public.requester_profiles;
create policy requester_profiles_select_own on public.requester_profiles
  for select to authenticated using (auth.uid() = id);

drop policy if exists requester_profiles_select_via_unlock on public.requester_profiles;
create policy requester_profiles_select_via_unlock on public.requester_profiles
  for select to authenticated using (
    exists (select 1 from public.contact_unlocks cu
            where cu.requester_id = requester_profiles.id and cu.instructor_id = auth.uid())
  );

drop policy if exists requester_profiles_update_own on public.requester_profiles;
create policy requester_profiles_update_own on public.requester_profiles
  for update to authenticated using (auth.uid() = id);

-- ---- instructor_profiles ----
drop policy if exists instructor_profiles_insert_self on public.instructor_profiles;
create policy instructor_profiles_insert_self on public.instructor_profiles
  for insert to public with check (auth.uid() = id);

drop policy if exists instructor_profiles_insert_own on public.instructor_profiles;
create policy instructor_profiles_insert_own on public.instructor_profiles
  for insert to authenticated with check (
    id = (select auth.uid()) and (select private.current_user_role()) = 'INSTRUCTOR'
  );

drop policy if exists instructor_profiles_admin_insert on public.instructor_profiles;
create policy instructor_profiles_admin_insert on public.instructor_profiles
  for insert to authenticated with check ((select private.current_user_role()) = 'ADMIN');

drop policy if exists instructor_profiles_update_self on public.instructor_profiles;
create policy instructor_profiles_update_self on public.instructor_profiles
  for update to public using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists instructor_profiles_update_own on public.instructor_profiles;
create policy instructor_profiles_update_own on public.instructor_profiles
  for update to authenticated
  using (id = (select auth.uid()) and (select private.current_user_role()) = 'INSTRUCTOR')
  with check (id = (select auth.uid()) and (select private.current_user_role()) = 'INSTRUCTOR');

drop policy if exists instructor_profiles_admin_update on public.instructor_profiles;
create policy instructor_profiles_admin_update on public.instructor_profiles
  for update to authenticated
  using ((select private.current_user_role()) = 'ADMIN')
  with check ((select private.current_user_role()) = 'ADMIN');

drop policy if exists instructor_profiles_admin_delete on public.instructor_profiles;
create policy instructor_profiles_admin_delete on public.instructor_profiles
  for delete to authenticated using ((select private.current_user_role()) = 'ADMIN');

drop policy if exists instructor_profiles_select_own on public.instructor_profiles;
create policy instructor_profiles_select_own on public.instructor_profiles
  for select to authenticated using (
    (select private.current_user_is_active()) and id = (select auth.uid())
  );

drop policy if exists instructor_profiles_select_admin on public.instructor_profiles;
create policy instructor_profiles_select_admin on public.instructor_profiles
  for select to authenticated using ((select private.current_user_role()) = 'ADMIN');

drop policy if exists instructor_profiles_select_public on public.instructor_profiles;
create policy instructor_profiles_select_public on public.instructor_profiles
  for select to anon, authenticated using (is_public = true);

drop policy if exists instructor_profiles_select_via_unlock on public.instructor_profiles;
create policy instructor_profiles_select_via_unlock on public.instructor_profiles
  for select to authenticated using (
    exists (select 1 from public.contact_unlocks cu
            where cu.instructor_id = instructor_profiles.id and cu.requester_id = auth.uid())
  );

-- NOTE: references engineer-match's applications/opportunities tables.
-- Kept verbatim -- see header comment. Requires those tables to exist
-- (they do, via the copied engineer-match migrations in this folder).
drop policy if exists instructor_profiles_select_applicant_company on public.instructor_profiles;
create policy instructor_profiles_select_applicant_company on public.instructor_profiles
  for select to authenticated using (
    (select private.current_user_is_active())
    and exists (
      select 1 from public.applications a join public.opportunities o on o.id = a.opportunity_id
      where a.applicant_id = instructor_profiles.id and o.posted_by = (select auth.uid())
    )
  );

-- ---- training_categories ----
drop policy if exists "Public can view training categories" on public.training_categories;
create policy "Public can view training categories" on public.training_categories
  for select to anon, authenticated using (true);

-- ---- training_subcategories ----
drop policy if exists "Public can view training subcategories" on public.training_subcategories;
create policy "Public can view training subcategories" on public.training_subcategories
  for select to anon, authenticated using (true);

drop policy if exists authenticated_can_insert_subcategories on public.training_subcategories;
create policy authenticated_can_insert_subcategories on public.training_subcategories
  for insert to authenticated with check (true);

-- ---- instructor_expertise ----
drop policy if exists instructor_expertise_select_all on public.instructor_expertise;
create policy instructor_expertise_select_all on public.instructor_expertise
  for select to anon, authenticated using (true);

drop policy if exists instructor_expertise_insert_own on public.instructor_expertise;
create policy instructor_expertise_insert_own on public.instructor_expertise
  for insert to authenticated with check (auth.uid() = instructor_id);

drop policy if exists instructor_expertise_delete_own on public.instructor_expertise;
create policy instructor_expertise_delete_own on public.instructor_expertise
  for delete to authenticated using (auth.uid() = instructor_id);

-- ---- training_requests ----
drop policy if exists training_requests_insert_own_requester on public.training_requests;
create policy training_requests_insert_own_requester on public.training_requests
  for insert to public with check (auth.uid() = requester_id);

drop policy if exists training_requests_select_own_requester on public.training_requests;
create policy training_requests_select_own_requester on public.training_requests
  for select to public using (auth.uid() = requester_id);

drop policy if exists training_requests_select_for_instructors on public.training_requests;
create policy training_requests_select_for_instructors on public.training_requests
  for select to authenticated using (
    (target_instructor_id is null and status = 'pending')
    or target_instructor_id = auth.uid()
    or exists (select 1 from public.instructor_responses ir
               where ir.request_id = training_requests.request_id and ir.instructor_id = auth.uid())
  );

drop policy if exists training_requests_update_own_requester on public.training_requests;
create policy training_requests_update_own_requester on public.training_requests
  for update to public using (auth.uid() = requester_id) with check (auth.uid() = requester_id);

-- ---- instructor_responses ----
drop policy if exists instructor_responses_insert_own_instructor on public.instructor_responses;
create policy instructor_responses_insert_own_instructor on public.instructor_responses
  for insert to public with check (
    auth.uid() = instructor_id
    and exists (select 1 from public.training_requests tr
                where tr.request_id = instructor_responses.request_id and tr.status = 'pending')
  );

drop policy if exists instructor_responses_select_own_instructor on public.instructor_responses;
create policy instructor_responses_select_own_instructor on public.instructor_responses
  for select to public using (auth.uid() = instructor_id);

drop policy if exists instructor_responses_select_owning_requester on public.instructor_responses;
create policy instructor_responses_select_owning_requester on public.instructor_responses
  for select to public using (public.is_requester_of_request(request_id));

drop policy if exists instructor_responses_update_own_instructor on public.instructor_responses;
create policy instructor_responses_update_own_instructor on public.instructor_responses
  for update to public using (auth.uid() = instructor_id) with check (auth.uid() = instructor_id);

drop policy if exists instructor_responses_update_owning_requester on public.instructor_responses;
create policy instructor_responses_update_owning_requester on public.instructor_responses
  for update to public using (public.is_requester_of_request(request_id));

-- ---- training_reviews ----
drop policy if exists training_reviews_insert_own on public.training_reviews;
create policy training_reviews_insert_own on public.training_reviews
  for insert to authenticated with check (
    auth.uid() = reviewer_id
    and exists (select 1 from public.training_requests tr
                where tr.request_id = training_reviews.request_id
                  and tr.requester_id = auth.uid()
                  and tr.target_instructor_id = training_reviews.instructor_id)
  );

drop policy if exists training_reviews_insert_own_reviewer on public.training_reviews;
create policy training_reviews_insert_own_reviewer on public.training_reviews
  for insert to public with check (
    auth.uid() = reviewer_id
    and exists (select 1 from public.training_requests tr
                where tr.request_id = training_reviews.request_id and tr.requester_id = auth.uid())
  );

drop policy if exists training_reviews_select on public.training_reviews;
create policy training_reviews_select on public.training_reviews
  for select to anon, authenticated using (
    auth.uid() = reviewer_id
    or auth.uid() = instructor_id
    or exists (select 1 from public.instructor_profiles ip
               where ip.id = training_reviews.instructor_id and ip.is_public = true)
  );

drop policy if exists training_reviews_update_own_instructor_reply on public.training_reviews;
create policy training_reviews_update_own_instructor_reply on public.training_reviews
  for update to public using (auth.uid() = instructor_id) with check (auth.uid() = instructor_id);

drop policy if exists training_reviews_update_reply on public.training_reviews;
create policy training_reviews_update_reply on public.training_reviews
  for update to authenticated using (auth.uid() = instructor_id) with check (auth.uid() = instructor_id);

-- ---- contact_unlocks ----
drop policy if exists contact_unlocks_insert_owning_requester on public.contact_unlocks;
create policy contact_unlocks_insert_owning_requester on public.contact_unlocks
  for insert to public with check (
    auth.uid() = requester_id
    and exists (select 1 from public.training_requests tr
                where tr.request_id = contact_unlocks.request_id and tr.requester_id = auth.uid())
  );

drop policy if exists contact_unlocks_select_participants on public.contact_unlocks;
create policy contact_unlocks_select_participants on public.contact_unlocks
  for select to public using (auth.uid() = requester_id or auth.uid() = instructor_id);

-- ============================================================
-- Views
-- ============================================================

create or replace view public.instructor_public_directory as
 select ip.id,
    u.name,
    ip.prefectures,
    ip.years_of_experience,
    ip.self_pr,
    ip.work_style,
    ip.desired_rate_min,
    ip.desired_rate_max,
    ip.portfolio_url,
    ip.avatar_url,
    ip.certifications,
    coalesce(rv.avg_rating, 0::numeric) as rating_avg,
    coalesce(rv.review_count, 0::bigint) as review_count,
    ip.created_at,
    coalesce((select array_agg(sc.name order by sc.name)
              from public.instructor_expertise ie
              join public.training_subcategories sc on sc.id = ie.subcategory_id
              where ie.instructor_id = ip.id), array[]::text[]) as expertise_fields,
    ip.is_featured
   from public.instructor_profiles ip
     join public.users u on u.id = ip.id
     left join (
        select instructor_id, avg(rating)::numeric(3,2) as avg_rating, count(*) as review_count
        from public.training_reviews
        group by instructor_id
     ) rv on rv.instructor_id = ip.id
  where ip.is_public = true and u.status = 'ACTIVE';

create or replace view public.open_requests_public_preview as
 select request_id,
    title,
    description,
    requester_type,
    preferred_format,
    budget,
    location,
    preferred_schedule,
    expertise_field,
    participant_count,
    created_at
   from public.training_requests tr
  where status = 'pending' and target_instructor_id is null;

-- ============================================================
-- Functions
-- ============================================================

create or replace function public.complete_oauth_profile(p_role text, p_name text)
 returns void
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
DECLARE
  v_email text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF p_role NOT IN ('INSTRUCTOR', 'COMPANY', 'INDIVIDUAL') THEN
    RAISE EXCEPTION 'Invalid role: %', p_role;
  END IF;
  SELECT email INTO v_email FROM auth.users WHERE id = auth.uid();
  INSERT INTO public.users (id, role, name, email)
  VALUES (
    auth.uid(),
    p_role,
    COALESCE(NULLIF(TRIM(p_name), ''), split_part(v_email, '@', 1)),
    lower(v_email)
  )
  ON CONFLICT (id) DO NOTHING;
END;
$function$;
