# Phase 1 smoke test checklist

Run after `npm run dev` with Supabase configured. ~10 minutes.

## A. Marketing (no login)

- [ ] `/` loads — hero, pricing table, CTA visible
- [ ] `/hsk-2-vs-3` loads — comparison table, link to chinesetest.cn
- [ ] `/pricing` loads — Free vs Pro cards

## B. Auth

- [ ] `/login` — enter your email, click magic link
- [ ] Email arrives, link opens app, lands on dashboard or home
- [ ] Supabase **Authentication** → **Users** shows your account
- [ ] **Table Editor** → `profiles` has row with `plan = free`

## C. Core loop (logged in)

- [ ] `/flashcards` — see a card (hanzi), tap flip, grade 1–5, next card loads
- [ ] `/practice` — select HSK 1, answer MCQ, see feedback, next question
- [ ] Answer until you hit daily limit message (or change plan to pro in DB for testing)
- [ ] `/mock-exam` — complete full exam (listening + reading + writing)
- [ ] See score on results screen
- [ ] Click **Review exam** → attempt detail shows your answers
- [ ] `/mock-exam/attempts` — history list loads
- [ ] `/dashboard` — shows plan, latest score, weakness summary
- [ ] `/mistakes` — wrong practice/mock answers listed (after wrong answers)

## D. Paywall (free user)

- [ ] Complete 2nd mock exam attempt → blocked with upgrade CTA
- [ ] Dashboard weakness detail blurred / limited for free user

## E. Founder Pro (manual)

In Supabase SQL Editor, run `scripts/founder-cohort.sql` with your email.

- [ ] Refresh app — dashboard shows Pro
- [ ] Unlimited practice works
- [ ] Second mock exam allowed
- [ ] Full weakness breakdown visible

## Pass criteria

All items in A–C pass. D–E optional for first run.

If A passes but C fails, check migrations **003–005** (RLS + mock metadata + practice snapshots). See `docs/testing/app-test-matrix.md`.
