# Phase 1: Supabase setup (no Stripe required)

Complete this before founder beta. ~15 minutes.

## 1. Create project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
2. Choose region close to your users (e.g. `ap-southeast-1` for Asia)
3. Save the database password

## 2. Run migrations (SQL Editor)

Open **SQL Editor** → **New query**, run in order:

1. `supabase/migrations/001_init.sql`
2. `supabase/migrations/002_stripe_customer_id.sql`
3. `supabase/migrations/003_rls_policies.sql`
4. `supabase/migrations/004_mock_exam_attempt_metadata.sql` — **required for mock exam submit**
5. `supabase/migrations/005_practice_question_snapshots.sql` — **required for AI practice generate**

Each should return success with no errors.

## 3. Enable Email auth (Magic Link)

1. **Authentication** → **Providers** → **Email** → Enable
2. **Authentication** → **URL Configuration**:
   - Site URL: `http://localhost:3000`
   - Redirect URLs add:
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/**` (optional wildcard for dev)

## 4. Copy API keys

**Project Settings** → **API**:

| Key | Env var |
|-----|---------|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| anon public | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| service_role (secret) | `SUPABASE_SERVICE_ROLE_KEY` |

## 5. Local env

```bash
cd /Users/eric/cursor_projects/hsk-mandarin-prep/.worktrees/mvp-implementation
cp .env.example .env.local
```

Fill only these for Phase 1:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Leave Stripe and OpenAI empty — app uses fallbacks without them.

## 6. Start and smoke test

```bash
npm run dev
```

Open http://localhost:3000 and follow `02-smoke-test.md`.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Magic link doesn't redirect | Check Redirect URLs include `/auth/callback` |
| 401 on API routes | Sign in first at `/login` |
| Empty profile after login | Re-run migration 001 (trigger `handle_new_user`) |
| Insert fails on practice/mock | Run migration 003 (RLS policies) |
