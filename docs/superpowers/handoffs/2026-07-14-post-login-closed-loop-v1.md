# Handoff — 2026-07-14 Post-login closed-loop v1

**Status:** EOD archived — resume tomorrow with live Free/Pro smoke  
**Branch:** `feature/mvp-implementation`  
**Worktree:** `/Users/eric/cursor_projects/hsk-mandarin-prep/.worktrees/mvp-implementation`  
**Production (Vercel):** binds to **`feature/mvp-implementation`**, not `main`  
**Live:** https://hsk-mandarin-prep.vercel.app  
**Spec (locked doctrine):** `docs/superpowers/specs/2026-07-14-post-login-closed-loop-design.md` (rev 2)  
**Related:** `2026-07-14-auth-aware-user-journey-design.md`, `docs/testing/journey-audit-2026-07-14.md`  
**Personas:** Free `wangkejay@126.com`; Pro `657696471@qq.com`  
**Git tip (pushed):** `b2fe482` on `origin/feature/mvp-implementation`  
**Feature commit:** `e9ee975` — `fix(journey): close post-login Free/Pro loops (rev 2)`

---

## EOD snapshot (2026-07-14 evening)

| Item | State |
|------|--------|
| Rev 2 closed-loop code | Shipped in `e9ee975` |
| Migration `009` | Applied on Supabase (founder confirmed) |
| Local unit + Playwright smoke | 27 unit + 19 e2e passed |
| Push | Done → `origin/feature/mvp-implementation` @ `b2fe482` |
| Vercel deploy | Should track branch; **confirm production build picked tip** before live smoke |
| Live Free funnel walkthrough | **Not done yet** (tomorrow P0) |
| Live Pro plan-retention check | **Not done yet** (tomorrow P0) |

Untracked throwaway (do not commit): `docs/prototypes/`

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

## Migration

**File:** `supabase/migrations/009_post_login_closed_loop.sql` — **applied**

Adds: `onboarding_prefs_at`, `diagnosis_completed_at`, `w1_cleared_at`, `coach_last_error`, `coach_last_run_at`  
Drops: `journey_horizon_weeks` DEFAULT 12  
Backfills prefs + diagnosis from existing attempts / journeys

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
| E2E | `e2e/authenticated/journey-auth-matrix.spec.ts`, `e2e/public/journey-doors.spec.ts` |

---

## Verification (local, 2026-07-14)

- Vitest: **27 passed** (`resolve-continue-href` + `week-unlock`)
- Playwright: **19 passed** (journey doors + public deps + auth matrix: JNY-PUB-*, JNY-AUTH-004, JNY-GAP-001..004)

---

## Tomorrow — start here

### P0 live smoke (do first)

1. Confirm Vercel production is on **`b2fe482`** (or later) — not a stale deploy.
2. **Free** `wangkejay@126.com` (reset learner data if mid-funnel leftover):
   - login → onboarding (date **or** unsure confirm) → diagnosis → score → **Dashboard stays** (no bounce to paper)
   - pending → Retry if needed → Week 1 tasks appear → clear W1 → **Pro CTA** still shows
   - Account menu: email + Free + Sign out
3. **Pro** `657696471@qq.com`:
   - re-login; `profiles.plan` stays **pro**
   - marketing “Start free Week 1” does **not** land on `/login`
4. If bounce returns: inspect `learner_profiles.diagnosis_completed_at` vs `journey_started_at`

Reset helper (if needed): `node scripts/reset-user-data.mjs wangkejay@126.com`

### P1 polish (after live smoke green)

- [ ] Surface dedicated coach **error** banner (`coach_last_error` copy; Retry already exists)
- [ ] Soft-disable tool links in header while `diagnosis_done` (today: hard redirect to Dashboard)

### Done checklist

- [x] Migration `009` on Supabase
- [x] Code commit + push (`e9ee975` / tip `b2fe482`)
- [x] Local unit + Playwright smoke
- [ ] Live Free closed-loop walkthrough
- [ ] Live Pro plan-retention + CTA check
