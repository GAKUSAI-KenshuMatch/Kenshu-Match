# Kenshu-Match (KenshuLink)

研修講師 × 企業/個人 マッチングプラットフォーム — a matching platform connecting IT training instructors with companies/individuals who need training.

## Tech stack
- Next.js 16 (App Router, `src/app`)
- React 19, TypeScript
- Tailwind CSS v4
- Supabase (Postgres + Auth + RLS) — shared Supabase project with `engineer-match-platform`, project id `gsqaggzafutqeypkamae`

## Getting started
1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in your Supabase project's URL + anon key (Supabase dashboard -> Settings -> API)
3. `npm run dev` — runs at http://localhost:3000

## Scripts
- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run start` — run a production build
- `npm run lint` — ESLint

## Project structure
- `src/app/` — pages (App Router)
- `src/lib/` — Supabase queries/mutations, grouped by domain (instructor, requester, requests)
- `src/components/` — shared UI
- `src/types/database.ts` — hand-maintained DB types (known to drift from the live schema — see `supabase/migrations/083_kenshu_match_baseline.sql` header comments)
- `supabase/migrations/083_kenshu_match_baseline.sql` — a retroactive snapshot of the live schema, not safe to blindly `supabase db push`

## Known gaps / open items
See project notes for the full production-readiness audit (shared DB with engineer-match-platform, no admin panel, notifications/chat/payment not built, no tests/CI, etc.) before treating this as launch-ready.

## Ownership
Currently maintained solo by Shakib (GAKUSAI).
