# Auth-Aware User Journey — Design Spec

- **Date:** 2026-07-14
- **Status:** Draft for founder approval (post expert-board review)
- **Source of truth (product journey):** `2026-07-13-full-journey-ux-brand-design.md` §§3.2, 5–6  
- **Also:** `2026-07-13-full-journey-coach-positioning.md`, `2026-07-14-homepage-chapter-ownership.md`  
- **Trigger:** Production walkthrough — Pro session (`657696471@qq.com`) clicked marketing “Start free mock exam”, was sent to `/login`, registered a second Free account (`wangkejay@126.com`), landed on `/onboarding`.

---

## 1. One-line outcome

Make **every marketing CTA and app deep-link** resolve by **(auth × plan × onboarding/journey stage)** so users never hit login while already signed in, never silently switch accounts, and Free first-run always follows **exam date → diagnosis → Week 1**, while full Mock Exam stays a tool—not the signup door.

---

## 2. Normative learner state machine

Three independent axes. Destination = f(auth, plan, stage).

### 2.1 Auth

| State | Meaning |
|-------|---------|
| `anonymous` | No valid Supabase session |
| `authenticated` | Valid session; identity = session email |

### 2.2 Plan

| State | Meaning |
|-------|---------|
| `free` | `profiles.plan != 'pro'` |
| `pro` | `profiles.plan == 'pro'` |

Plan only applies when `authenticated`. Anonymous has no plan.

### 2.3 Journey stage (authenticated only)

| Stage id | Definition (normative) | How we know |
|----------|------------------------|-------------|
| `needs_exam_prefs` | No exam preference committed | `target_exam_date` **and** `onboarding_prefs_at` both null *(see §5.1 — replace today’s broken `journey_started_at` combo)* |
| `needs_diagnosis` | Exam prefs saved; journey not bootstrapped | prefs set; `journey_started_at` null |
| `active_w1` | Journey started; current week = 1; week not cleared | `journey_started_at` set; `current_week_index == 1`; week 1 status ≠ `passed` |
| `w1_cleared_free` | Free user finished Week 1 | Week 1 `passed`; plan = free |
| `active_wn` | Executing week N≥2 (Pro), or Pro still on W1 | plan = pro **or** (free still on W1 — covered by `active_w1`) |
| `pro_active` | Pro with journey running | plan = pro; `journey_started_at` set |

For routing tables below we collapse to:

```
incomplete = needs_exam_prefs | needs_diagnosis
complete   = journey_started_at != null
```

---

## 3. Canonical product path (from locked journey spec)

Normative first-run (**no level picker**):

```
Account create
  → Exam date (or “I’m not sure” → 12-week horizon)
  → Diagnosis (short Level 3 diagnostic)
  → First AI report (Free: truncated + 1 evidence gap)
  → Init journey + Week 1
  → Dashboard (slim strip + Zone 1)
```

**After active:** Dashboard owns “what this week”; Practice / Mock Exam are tools; Pricing for upgrade.

**Freemium composite rule (unchanged):**

> Outline always visible. Execution sequential by Passed weeks. Free executes Week 1 only. Primary Pro gate = after Week 1 cleared.

**Diagnosis vs full Mock Exam (normative):**

| Artifact | Role | When |
|----------|------|------|
| **Diagnosis** | Onboarding diagnose | Required once before journey init |
| **Full Mock Exam** | Deeper assess / Sprint tool | Available after `complete`; Free: 1 lifetime mock; Pro: unlimited |

Marketing **must not** promise “start free mock exam” as the signup door if the product door is Diagnosis + Week 1. See §6 Decision A.

---

## 4. Complete journey matrix

### 4.1 Marketing primary CTA (Hero / final CTA / Pricing Free)

**Intended action after Decision A:** “Start free Week 1” / “Start your Level 3 Coach”  
**Resolver:** `resolveContinueHref()` — see §5.2

| Auth | Plan | Stage | Destination | UI note |
|------|------|-------|-------------|---------|
| anonymous | — | — | `/login?next=%2Fonboarding` | Copy: create account / sign in |
| authenticated | free \| pro | `needs_exam_prefs` | `/onboarding` | Never `/login` |
| authenticated | free \| pro | `needs_diagnosis` | `/diagnosis` | Resume diagnose |
| authenticated | free | `active_w1` | `/dashboard` | Continue Week 1 |
| authenticated | free | `w1_cleared_free` | `/dashboard` (+ Pro highlight) | Primary upgrade surface |
| authenticated | pro | `complete` | `/dashboard` | Returning Pro home |
| authenticated | free \| pro | `complete` + deep-linked mock | `/mock-exam` only if CTA variant is tool CTA | Separate secondary CTA (§4.3) |

### 4.2 Marketing Header “Login”

| Auth | Destination | Label |
|------|-------------|-------|
| anonymous | `/login` | **Login** |
| authenticated | `/dashboard` (or §5.2 resume if incomplete) | **Dashboard** (never Login) |

### 4.3 Secondary: “Take a mock exam” (optional, post-story)

Only after journey narrative is clear (e.g. How it works / FAQ / Dashboard). Not Hero primary.

| Auth | Plan | Stage | Destination |
|------|------|-------|-------------|
| anonymous | — | — | `/login?next=%2Fmock-exam` then post-login **must** run §5.2: if incomplete → finish onboarding/diagnosis first, stash mock intent |
| authenticated | * | incomplete | Finish `needs_exam_prefs` / `needs_diagnosis` first; then `/mock-exam` |
| authenticated | free | complete, mocks used ≥1 | `/mock-exam` → existing UpgradeCTA |
| authenticated | free | complete, mocks used =0 | `/mock-exam` |
| authenticated | pro | complete | `/mock-exam` |

### 4.4 `/login` behavior

| Arrival | Session | Behavior |
|---------|---------|----------|
| Any `/login?next=…` | valid | **Do not render auth form.** Redirect via §5.2 using `next` as *intent*, not blind push |
| `/login` | valid | Redirect §5.2 with intent = `/dashboard` |
| `/login` | none | Show Sign in / Sign up |
| Form while session valid | — | **Forbidden** except explicit “Use a different account” → sign out → then form |

**Sign up while another account is logged in is a product bug** (observed: Pro → Free silent switch).

**After Sign up with session established:** `resolveContinueHref(intent)` — default intent onboarding (`next` or `/onboarding`).  
**After Sign in:** same resolver.  
**Magic-link / email confirm `auth/callback`:** must preserve `next` (today it defaults to `/` and drops intent).

### 4.5 App route guards

| Route | anonymous | authenticated + incomplete | authenticated + complete |
|-------|-----------|------------------------------|---------------------------|
| `/onboarding` | → `/login?next=/onboarding` | Show exam-date step (minimal chrome) | → `/dashboard` (already past) |
| `/diagnosis` | → `/login?next=/diagnosis` | Allowed if prefs done; else → `/onboarding` | Soft-allow retake later (MVP: allow; or redirect Dashboard) |
| `/dashboard` | → `/login?next=/dashboard` | → `/onboarding` or `/diagnosis` per stage | Dashboard |
| `/practice`, `/flashcards`, `/mistakes` | → login | **Block** → resume onboarding/diagnosis | OK (entitlements apply) |
| `/mock-exam` | → login w/ next | **Block** until `complete` (stash intent) | OK + Free mock limit |
| `/pricing` | Public or app — show plans | OK | OK; Checkout if Pro CTA |

**Onboarding/diagnosis chrome:** Logo only (or Logo + progress “1 · Exam date → 2 · Diagnosis”). Hide Dashboard / Practice / Mock Exam / Pro until `complete`.

### 4.6 Free vs Pro after journey is active

| Moment | Free | Pro |
|--------|------|-----|
| Diagnosis + first report | ✅ truncated report | ✅ full report |
| Week 1 execution | ✅ full week, MasteryGate | ✅ |
| Week 1 cleared | Celebration + **primary Upgrade to Pro** | Auto-unlock Week 2 tasks |
| Week 2+ execution | Locked (outline visible) | Sequential unlock |
| Full mock volume | 1 mock | Unlimited |
| Writing AI score / weakness detail | Per existing entitlements | Full |
| Mid-Week-1 hard Pro wall | **Forbidden** | — |

### 4.7 End-to-end personas (happy paths)

**A — New anonymous Free (marketing primary CTA)**

```
Home CTA → /login?next=/onboarding
  → Sign up → /onboarding → /diagnosis → report → Dashboard W1
  → Clear W1 → Pro CTA
```

**B — Returning Free, mid Week 1**

```
Home CTA or Header Dashboard → /dashboard (resume W1)
```

**C — Returning Free, Week 1 cleared**

```
→ /dashboard with Pro upgrade as primary surface
```

**D — Returning Pro (the bug case)**

```
Home “Start …” CTA → /dashboard (NOT /login)
Header → Dashboard
Optional tool CTA → /mock-exam
```

**E — Anonymous wants mock specifically (secondary)**

```
→ /login?next=/mock-exam
→ after auth, if incomplete: onboarding → diagnosis → THEN /mock-exam
→ if complete: /mock-exam
```

**F — Session expired mid-app**

```
Any guarded route → /login?next=<current>
→ Sign in → §5.2 with that next
```

---

## 5. Technical design (routing kernel)

### 5.1 Completion flags (fix today’s gate)

**Today (bug-prone):**

```
dashboard redirects to onboarding if !target_exam_date && !journey_started_at
```

Problems: “I’m not sure” leaves `target_exam_date` null; `journey_started_at` only after coach; user can re-enter onboarding loop; tools lack the same gate.

**Normative fields:**

| Field | Set when |
|-------|----------|
| `onboarding_prefs_at` | User submits exam date **or** “I’m not sure” |
| `target_exam_date` | Concrete date or null if unsure |
| `journey_horizon_weeks` | Computed or 12 |
| `journey_started_at` | After diagnosis coach run initializes journey + Week 1 |

```
needs_exam_prefs  ⇔  onboarding_prefs_at IS NULL
needs_diagnosis   ⇔  onboarding_prefs_at IS NOT NULL AND journey_started_at IS NULL
complete          ⇔  journey_started_at IS NOT NULL
```

### 5.2 `resolveContinueHref({ intent?, profile, plan })`

```
if needs_exam_prefs     → /onboarding
if needs_diagnosis      → /diagnosis
if intent is allowed tool path and complete → intent
else → /dashboard
```

Allowed tool intents when complete: `/dashboard`, `/mock-exam`, `/practice`, `/flashcards`, `/mistakes`, `/pricing`, `/dashboard/*`.

Reject open redirects: `intent` must start with `/` and not `//`.

### 5.3 Where resolver runs

| Layer | Responsibility |
|-------|----------------|
| Server layout / page guards | App routes: redirect incomplete users |
| `/login` page (client bootstrap or RSC wrapper) | If session → redirect resolver(intent) |
| `auth/callback` | Pass `next` into resolver after session exchange |
| Marketing CTA / Header | Client or server link builder: anonymous → login+next; authed → resolver |

### 5.4 Account switch

Only path to second account:

1. Visible current identity (email + Free/Pro) in AppHeader when complete  
2. Sign out  
3. Then `/login` Sign up / Sign in  

No Sign up form while session is live.

---

## 6. Decisions for founder lock

### Decision A — Primary marketing CTA (required)

| Option | Copy | `next` / authed dest | Fits journey spec? |
|--------|------|----------------------|--------------------|
| **A1 (recommended)** | “Start free Week 1” / “Start your Level 3 Coach” | onboarding → diagnosis → W1 | ✅ |
| A2 | Keep “Start free mock exam” | Force incomplete → diagnosis first; rename conceptual “mock” to diagnosis in UI | ⚠️ confuses Diagnosis vs Mock |
| A3 | Dual CTA: Coach primary + Mock secondary | As §4.1 + §4.3 | ✅ if hierarchy clear |

**Board recommendation: A1** (or A3 if growth wants a mock hook below the fold). Hero must not claim full mock as the door.

### Decision B — Incomplete users & tool routes

| Option | Behavior |
|--------|----------|
| **B1 (recommended)** | Hard block Practice / Mock / Flashcards / Mistakes until `complete` |
| B2 | Soft allow Mock during onboarding (current accidental behavior) |

**Board: B1** — preserves diagnose → plan story; matches spec §3.2 order.

### Decision C — Diagnosis retake

MVP: after `complete`, `/diagnosis` may redirect to Dashboard (retake = later). Optional Pro feature later.

---

## 7. Expert board review

### 7.1 Product / IA

- Spec already defines door = exam date → diagnosis → Week 1; marketing CTA is the **drift**. Align copy first, then guards.
- “Pro” in AppHeader during onboarding competes with finishing diagnose; hide until `complete`, keep upgrade on Dashboard / Pricing / W1-cleared.

### 7.2 Growth

- Dropping “mock exam” from Hero may reduce click curiosity; mitigate with How-it-works Step 1 honesty (“short diagnosis”) and one post-Week-1 mock prompt.
- Pro returning users clicking marketing CTA should feel **fast resume** (Dashboard), not re-acquisition.

### 7.3 UX

- Minimal chrome on onboarding/diagnosis reduces the exact escape hatch in the screenshot.
- Progress “Step 1 of 2” sets expectation for “Continue to diagnosis”.
- Date input: force `lang="en"` on app shell or custom picker so placeholder isn’t `年/月/日` in English UI.
- Naming: **HSK Level 3** everywhere in learner-facing app copy (marketing naming rules).

### 7.4 Auth / trust

- Silent account switch is a **severity/trust P0**, not a polish item.
- Header must reflect auth reality (Login vs Dashboard).
- Session expiry → login with `next` is the only legitimate “logged-out → login” path for prior users.

### 7.5 Engineering

- One resolver + shared stage helper beats scattered `redirect('/onboarding')` on Dashboard only.
- Add `onboarding_prefs_at` migration; fix “I’m not sure” loop.
- Preserve `next` through `emailRedirectTo` / callback.
- E2E: Pro session + marketing CTA never sees `/login`; anonymous signup lands onboarding; incomplete blocked from `/mock-exam`.

### 7.6 Board verdict

| Issue | Severity | Disposition |
|-------|----------|-------------|
| Authed Pro → `/login` via CTA | P0 | Fix: auth-aware CTA + login short-circuit |
| Sign up over existing session | P0 | Fix: block + explicit switch |
| CTA promises mock; product door is diagnosis/W1 | P0 product | Decision A1/A3 |
| Tool nav during onboarding | P1 | Minimal chrome + B1 guards |
| Incomplete gate only on Dashboard | P1 | Shared resolver |
| “I’m not sure” re-onboarding loop | P1 | `onboarding_prefs_at` |
| Auth callback drops `next` | P1 | Preserve intent |
| Date locale / HSK 3 naming | P2 | Copy + lang |

**Ship order:** P0 auth/account → Decision A copy → P1 gates/flags → P2 polish.

---

## 8. Implementation outline (not a task plan yet)

1. Migration: `onboarding_prefs_at`; backfill where exam prefs already set.  
2. `src/lib/auth/resolve-continue-href.ts` (+ unit tests for matrix in §4).  
3. Middleware or server helpers on app routes; login page session check.  
4. Marketing Header + primary CTA link builder (server prefer).  
5. Onboarding layout: minimal header + step chrome.  
6. auth/callback + signup redirect preserve `next`.  
7. Copy pass: Hero/Pricing CTA per Decision A; Level 3 naming on onboarding/diagnosis.  
8. Playwright: personas A, D, F from §4.7.

---

## 9. Success criteria

1. Authenticated Pro clicking marketing primary CTA never sees `/login`.  
2. Authenticated user cannot open Sign up without signing out.  
3. New Free signup lands `/onboarding` → `/diagnosis` → Dashboard W1 (not raw `/mock-exam` unless complete + secondary CTA).  
4. Incomplete users cannot use Practice / Mock / Flashcards / Mistakes.  
5. “I’m not sure” never bounces back to exam-date forever after prefs saved.  
6. Free W1 remains unpaywalled; primary Pro moment remains W1 cleared.  
7. Naming: learner-facing “HSK Level 3”; english date chrome.

---

## 10. Non-goals

- Multi-account switcher UI beyond sign-out  
- HSK Level 4–9 tracks  
- Changing Week 1 → Pro freemium economics  
- Pixel redesign of marketing  

---

## 11. Approval trail

| Item | Status |
|------|--------|
| Journey matrix auth × plan × stage (§4) | Draft — awaiting founder |
| Decision A (CTA copy) | **Needs founder pick: A1 / A2 / A3** |
| Decision B (hard block tools) | Board recommends B1 — awaiting founder |
| Expert board review (§7) | Complete in this doc |
| Implementation plan | After founder locks A/B |

---

## 12. Appendix — observed failure vs target

```
OBSERVED
Pro session → CTA /login?next=/mock-exam → Sign up Free → /onboarding
(+ full AppHeader escape routes)

TARGET (Pro)
Pro session → CTA /dashboard

TARGET (new Free)
anonymous → /login?next=/onboarding → exam date → diagnosis → W1 Dashboard
```
