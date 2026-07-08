# HSK Mandarin Prep

AI-powered HSK 3.0 exam preparation for learners targeting HSK levels 1–3. The app ships with a freemium model on day one: free users get SRS flashcards, limited daily practice, and one mock exam; Pro subscribers unlock unlimited AI practice, all mock exams, AI writing feedback, and detailed weakness analytics.

The product UI is in English. Syllabus content follows the official HSK 3.0 standard (GF0025-2021).

## Quick start (Phase 1 beta — Supabase only)

No Stripe or OpenAI required for founder testing.

1. Follow **[docs/launch/01-supabase-setup.md](docs/launch/01-supabase-setup.md)** — create Supabase project, run migrations 001–003
2. `cp .env.example .env.local` and fill Supabase keys + `NEXT_PUBLIC_APP_URL`
3. `./scripts/check-phase1-env.sh` — verify env
4. `npm run dev` → run **[docs/launch/02-smoke-test.md](docs/launch/02-smoke-test.md)**
5. Recruit testers with **[docs/launch/03-founder-beta-post.md](docs/launch/03-founder-beta-post.md)**

## Features

| Feature | Free | Pro |
| --- | --- | --- |
| SRS flashcards (HSK 1–3) | ✓ | ✓ |
| AI practice questions | 20/day | Unlimited |
| Mock exams | 1 | All |
| Weakness dashboard | Summary | Full detail |
| AI writing score | — | ✓ |

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Auth & database | Supabase (magic-link auth, Postgres) |
| Payments | Stripe Checkout (subscription) |
| AI | OpenAI API (practice generation, writing scoring) |
| Testing | Vitest, Testing Library |
| Deployment | Vercel |

## Local development

### Prerequisites

- Node.js 18+
- npm
- A [Supabase](https://supabase.com) project
- A [Stripe](https://stripe.com) account (test mode is fine for local dev)
- An [OpenAI](https://platform.openai.com) API key

### Setup

```bash
# Install dependencies
npm install

# Copy env template and fill in values (see table below)
cp .env.example .env.local

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

Copy `.env.example` to `.env.local` and fill in every value before running locally or deploying.

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL (Settings → API) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key — used by Stripe webhooks to update `profiles.plan` server-side |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key (`sk_test_…` or `sk_live_…`). Checkout returns 503 if missing |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook signing secret (`whsec_…`) |
| `NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY` | Yes | Stripe Price ID for the Pro monthly subscription ($9.99/mo) |
| `NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY` | Yes | Stripe Price ID for the Pro yearly subscription ($69/yr) |
| `OPENAI_API_KEY` | Yes | OpenAI API key for practice generation and writing scoring |
| `NEXT_PUBLIC_APP_URL` | Yes | Public app URL. Use `http://localhost:3000` locally; set to your production domain on Vercel |

## Supabase setup

### 1. Create a project

Create a new Supabase project at [supabase.com](https://supabase.com). Note the project URL and API keys for `.env.local`.

### 2. Run migrations

Open the Supabase SQL Editor and run both migration files in order:

1. **`supabase/migrations/001_init.sql`** — creates `profiles`, `practice_attempts`, `mock_exam_attempts`, `srs_cards`, indexes, and the `handle_new_user` trigger that auto-creates a profile on signup.
2. **`supabase/migrations/002_stripe_customer_id.sql`** — adds `stripe_customer_id` to `profiles` for subscription lifecycle updates.

### 3. Enable magic-link auth

In the Supabase dashboard:

1. Go to **Authentication → Providers → Email**.
2. Enable the Email provider.
3. Confirm **Confirm email** is enabled (recommended).
4. Under **Authentication → URL Configuration**, add these redirect URLs:
   - `http://localhost:3000/auth/callback` (local)
   - `https://<your-production-domain>/auth/callback` (production)

The login page (`/login`) sends a magic link via `signInWithOtp`. After the user clicks the link, `/auth/callback` exchanges the code for a session and upserts a `profiles` row with `plan = 'free'`.

## Stripe setup

### 1. Create products and prices

In the Stripe Dashboard (test mode for local dev):

1. Create a product named **HSK Mandarin Prep Pro**.
2. Add two recurring prices:
   - **Monthly** — $9.99/month
   - **Yearly** — $69/year
3. Copy each Price ID (`price_…`) into:
   - `NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY`
   - `NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY`

### 2. Configure webhook events

Register a webhook endpoint that listens for:

| Event | Purpose |
| --- | --- |
| `checkout.session.completed` | Upgrade user to Pro after successful checkout |
| `customer.subscription.deleted` | Downgrade user to Free when subscription ends |

**Production endpoint:** `https://<your-domain>/api/stripe/webhook`

**Local development** — forward events with the Stripe CLI:

```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe login

# Forward webhooks to your local Next.js server
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

The CLI prints a webhook signing secret (`whsec_…`). Set it as `STRIPE_WEBHOOK_SECRET` in `.env.local`.

### 3. Test the flow

1. Sign in at `/login`.
2. Go to `/pricing` and click **Upgrade to Pro**.
3. Complete checkout with a [Stripe test card](https://stripe.com/docs/testing#cards) (e.g. `4242 4242 4242 4242`).
4. Confirm the webhook fires and `profiles.plan` updates to `pro` in Supabase.

## Founder cohort

Grant complimentary Pro access to early supporters without going through Stripe. Edit the email list in `scripts/founder-cohort.sql`, then run it in the Supabase SQL Editor:

```sql
-- scripts/founder-cohort.sql
update profiles
set
  plan = 'pro',
  founder_cohort = true
where email in (
  'founder1@example.com',
  'founder2@example.com'
);
```

Replace the placeholder emails with your founder list before running.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Next.js dev server on port 3000 |
| `npm run build` | Production build (must pass before deploy) |
| `npm run start` | Serve the production build locally |
| `npm test` | Run Vitest test suite once |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run lint` | Run ESLint |

## Deployment (Vercel)

This app is designed for [Vercel](https://vercel.com). No deploy is performed from this repo automatically — follow the checklist below when you are ready.

### Deploy steps

1. Push the `feature/mvp-implementation` branch and import the repo in Vercel.
2. Set the framework preset to **Next.js**.
3. Add all environment variables from the table above in **Project Settings → Environment Variables**.
4. Set `NEXT_PUBLIC_APP_URL` to your production URL (e.g. `https://hskmandarinprep.com`).
5. Deploy. Vercel runs `npm run build` automatically.

### Post-deploy checklist

- [ ] Supabase redirect URL includes `https://<domain>/auth/callback`
- [ ] Stripe webhook endpoint points to `https://<domain>/api/stripe/webhook`
- [ ] Stripe webhook uses **live** keys and signing secret in production env vars
- [ ] Both migrations (`001_init.sql`, `002_stripe_customer_id.sql`) have been run on the production Supabase project
- [ ] Smoke test: sign in → practice → mock exam → checkout → confirm Pro plan in Supabase

### Environment variables checklist (Vercel)

Copy every variable from `.env.example` into Vercel. Use live Stripe keys (`sk_live_…`, `whsec_…`) and production Price IDs for the production environment; keep test keys in Preview/Development if desired.

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY`
- [ ] `NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY`
- [ ] `OPENAI_API_KEY`
- [ ] `NEXT_PUBLIC_APP_URL`

## Beta launch checklist

Use this when opening the app to early users.

### Product readiness

- [ ] `npm run build` passes
- [ ] `npm test` passes
- [ ] Supabase migrations applied; magic-link auth tested end-to-end
- [ ] Stripe checkout and webhook tested in test mode, then live mode
- [ ] Founder cohort SQL run for early supporters (if applicable)

### Community outreach

- [ ] Post to [r/ChineseLanguage](https://www.reddit.com/r/ChineseLanguage/) with a short intro: HSK 3.0-aligned prep, free mock exam, AI practice
- [ ] Offer **free Pro for a testimonial** — grant via `scripts/founder-cohort.sql` or a direct `profiles` update in exchange for feedback
- [ ] Include a clear CTA link to the free HSK 3 mock exam (`/mock-exam`)
- [ ] Monitor signups and webhook errors in Stripe/Supabase dashboards for the first 48 hours

### Suggested Reddit post outline

1. **Hook** — "I built a free HSK 3.0 mock exam with AI practice"
2. **What it covers** — HSK 1–3 flashcards, 20 free practice questions/day, one full mock exam
3. **Offer** — Free Pro upgrade for the first N users who leave a testimonial (use founder cohort SQL)
4. **Link** — Production URL + `/mock-exam` direct link
5. **Disclaimer** — Not affiliated with Hanban/chinesetest.cn; syllabus aligned to GF0025-2021

## Project structure

```
src/
  app/
    (marketing)/     # Landing page, SEO content
    (app)/           # Authenticated app (dashboard, practice, flashcards, mock exam)
    api/             # API routes (Stripe, practice, SRS, writing score)
    auth/callback/   # Magic-link session exchange
  components/        # UI components
  data/syllabus/     # HSK 1–3 word lists (JSON)
  lib/               # Entitlements, SRS, OpenAI, Supabase, Stripe helpers
supabase/migrations/ # Database schema
scripts/             # One-off SQL (founder cohort)
tests/               # Vitest unit tests
```

## License

Private — not for redistribution.
