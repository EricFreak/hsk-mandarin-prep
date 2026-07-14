# Handoff — 2026-07-14 Post-login closed-loop v1

**Branch:** `feature/mvp-implementation`  
**Worktree:** `/Users/eric/cursor_projects/hsk-mandarin-prep/.worktrees/mvp-implementation`  
**Production (Vercel):** binds to **`feature/mvp-implementation`**, not `main`  
**Live:** https://hsk-mandarin-prep.vercel.app  
**Spec (locked doctrine):** `docs/superpowers/specs/2026-07-14-post-login-closed-loop-design.md` (rev 2)  
**Related:** `2026-07-14-auth-aware-user-journey-design.md`, `docs/testing/journey-audit-2026-07-14.md`  
**Personas:** Free `wangkejay@126.com`; Pro `657696471@qq.com`  
**Git:** changes are **uncommitted** on this branch (do not assume shipped until commit + migrate + deploy)

---

## What this cut fixes (product)

Doctrine: **diagnosis score = user milestone; coach gen = status; Dashboard = durable home. Kill Waiting Room as a place.**

| P0 from audit | Fix in this cut |
|---------------|-----------------|
| Diagnosis → Dashboard bounce back to paper | `diagnosis_done` stage + `allowDiagnosisHome`; tools redirect to `/dashboard` not `/diagnosis` |
| No Sign out / account chrome | `AccountMenu` (email + plan + Sign out) on app header |
| Diagnosis burns free mock quota | Submit + mock page count exclude `hsk3-diagnosis` / `hsk3-placement` |
| Auth callback can wipe Pro | `ensureProfileWithoutClobberingPlan` |
| Free W1 clear kills Pro CTA | `w1_cleared_at`; Free clear does **not** advance `current_week_index` |
| Client-only fire-and-forget coach | Server `void runCoach(...)` on diagnosis submit + Dashboard Retry |
| Sub-routes skip journey guards | `requireJourneyRoute` on journey/plans/progress/attempts/[id] |
| Silent date discard on “I’m not sure” | Confirm beat in `OnboardingForm` |
| Horizon `DEFAULT 12` corrupts stage | Migration `009` drops default; `onboarding_prefs_at` stamp |

---

## Normative stages (code)

```
needs_exam_prefs → needs_diagnosis → diagnosis_done → complete
```

Resolver: `src/lib/auth/resolve-continue-href.ts`  
Guards: `src/lib/auth/continue-destination.ts` (`requireJourneyRoute`)

| Stage | User may… | Must not… |
|-------|-----------|-----------|
| `needs_exam_prefs` | `/onboarding` | tools / dashboard |
| `needs_diagnosis` | `/diagnosis` | tools |
| `diagnosis_done` | Dashboard (+ status banner) | blank diagnosis paper; tools until `complete` |
| `complete` | tools + full nav | forced retake of diagnosis |

---

## Migration (required before prod smoke)

**File:** `supabase/migrations/009_post_login_closed_loop.sql`

Adds: `onboarding_prefs_at`, `diagnosis_completed_at`, `w1_cleared_at`, `coach_last_error`, `coach_last_run_at`  
Drops: `journey_horizon_weeks` DEFAULT 12  
Backfills prefs + diagnosis from existing attempts / journeys

**Ops checklist**

1. Apply `009` on Supabase (staging then production)
2. Deploy this branch to Vercel
3. Reset Free learner prefs for a clean funnel run on `wangkejay@126.com` if needed
4. Smoke Free path: login → onboarding (date **or** unsure confirm) → diagnosis → score → **Dashboard stays** → Retry if pending → Week 1 → clear → Pro CTA
5. Smoke Pro path: `657696471@qq.com` stays Pro after re-login; no Free overwrite

---

## Key code map

| Area | Paths |
|------|--------|
| Stage resolver | `src/lib/auth/resolve-continue-href.ts` |
| Session + guards | `src/lib/auth/continue-destination.ts` |
| Auth callback | `src/app/auth/callback/route.ts` |
| Migration | `supabase/migrations/009_post_login_closed_loop.sql` |
| Onboarding API + UI | `src/app/api/onboarding/route.ts`, `src/components/onboarding/OnboardingForm.tsx` |
| Diagnosis route | `src/app/(app)/diagnosis/page.tsx` (legacy `/placement` redirect) |
| Mock submit / quota | `src/app/api/mock-exam/submit/route.ts`, `src/app/(app)/mock-exam/page.tsx` |
| Free W1 clear | `src/lib/coach/journey/persist-journey.ts`, `week-unlock.ts` |
| Account chrome | `src/components/app/AccountMenu.tsx`, `AppHeader.tsx` |
| Coach pending UI | `src/components/dashboard/DashboardView.tsx` |
| Unit tests | `tests/lib/auth/resolve-continue-href.test.ts`, `tests/lib/coach/journey/week-unlock.test.ts` |
| E2E (auth matrix / doors) | `e2e/authenticated/journey-auth-matrix.spec.ts`, `e2e/public/journey-doors.spec.ts` |

---

## Verification done locally

- Vitest: `resolve-continue-href` + `week-unlock` — **27 passed** (2026-07-14)

## Not done in this cut / follow-ups

- [ ] Apply migration `009` on remote Supabase
- [ ] Commit + deploy (explicit founder ask)
- [ ] Full Playwright re-run after migrate (auth matrix assumes stamps)
- [ ] Dedicated coach **error** banner (pending banner + Retry exists; surface `coach_last_error` copy)
- [ ] Soft-disable tool links in header while `diagnosis_done` (guards hard-redirect; chrome soft reason is nicer)
- [ ] End-to-end Free funnel smoke with `wangkejay@126.com` on live after deploy

---

## How to resume tomorrow

1. Confirm `009` applied
2. Walk Free persona closed loop once; if bounce returns, check `diagnosis_completed_at` vs `journey_started_at` on `learner_profiles`
3. Walk Pro re-auth; confirm `profiles.plan` stays `pro`
4. Only then commit if founder requests
