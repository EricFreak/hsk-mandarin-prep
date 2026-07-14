# Journey audit findings — 2026-07-14

Automated matrix from `2026-07-14-auth-aware-user-journey-design.md` after **Placement → Diagnosis** rename.

## How to run

```bash
# Unit (destination kernel) — no browser / no Supabase
npm test -- tests/lib/auth/resolve-continue-href.test.ts

# UI doors (anonymous marketing + redirects)
npx playwright test e2e/public/journey-doors.spec.ts --project=public

# Auth matrix (needs .env.local Supabase admin + app)
npx playwright test e2e/authenticated/journey-auth-matrix.spec.ts --project=authenticated
```

## Files

| File | Role |
|------|------|
| `src/lib/auth/resolve-continue-href.ts` | Target destination kernel |
| `tests/lib/auth/resolve-continue-href.test.ts` | Unit matrix (12 cases) |
| `e2e/public/journey-doors.spec.ts` | Anonymous CTA / diagnosis door UI |
| `e2e/authenticated/journey-auth-matrix.spec.ts` | Auth × stage UI; `JNY-GAP-*` track known bugs |

## Rename shipped

- Route `/diagnosis` (legacy `/placement` redirects)
- Onboarding CTA → “Continue to diagnosis”
- Marketing primary CTA → “Start free Week 1” → `/login?next=/onboarding`
- Template id `hsk3-diagnosis` (+ legacy `hsk3-placement` accepted on submit)

## Triage (after wiring `resolveContinueHref` — 2026-07-14)

| ID | Severity | Status |
|----|----------|--------|
| JNY-GAP-001 | P0 | **Fixed** — ContinueCta / auth-aware marketing CTAs |
| JNY-GAP-002 | P0 | **Fixed** — `/login` server redirect + `/auth/continue` |
| JNY-GAP-003 | P1 | **Fixed** — `requireJourneyRoute` on tool routes |
| JNY-GAP-004 | P1 | **Fixed** — dashboard uses same resolver (horizon prefs + started) |

## Passing contract (target kernel)

- Anonymous primary door = `/login?next=/onboarding`
- Authed incomplete + any intent → `/onboarding` or `/diagnosis`
- Authed complete + `/mock-exam` intent → `/mock-exam`
- Authed complete + no intent → `/dashboard`
