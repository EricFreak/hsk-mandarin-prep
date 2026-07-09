# HSK Mandarin Prep — App-Wide Test Matrix

**Branch:** `feature/mvp-implementation`  
**Last updated:** 2026-07-09  
**Automated today:** 9 Vitest files (`tests/lib/*`) — unit only, no API/UI/E2E

---

## 0. Reported failures — root cause checklist

| User message | API | Likely cause (check first) |
|---|---|---|
| Failed to generate practice question | `GET /api/practice/generate` → 500 | Migration **005** not applied (`practice_questions` table / RLS) |
| Failed to submit mock exam | `POST /api/mock-exam/submit` → 500 | Migration **004** not applied (`template_id`, `answers`, `status`, …) |
| Either | either | Migration **003** RLS missing on inserts |
| Either | either | No `profiles` row for user (FK violation) |

**Verify in Supabase SQL Editor:**

```sql
-- 004 applied?
SELECT column_name FROM information_schema.columns
WHERE table_name = 'mock_exam_attempts'
  AND column_name IN ('template_id', 'answers', 'status');

-- 005 applied?
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_name = 'practice_questions'
);
```

If empty → run `004_mock_exam_attempt_metadata.sql` and `005_practice_question_snapshots.sql`.

---

## 1. Personas & environments

| Persona | Description |
|---|---|
| **ANON** | Not logged in |
| **FREE** | Authenticated, `profiles.plan = free` |
| **PRO** | Authenticated, `profiles.plan = pro` or founder cohort |

| Env var | Required for | Symptom if missing |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `ANON_KEY` | All app features | 503 on APIs |
| Migrations 001–005 | Practice, mock submit, mistakes | **500 errors** |
| `OPENAI_API_KEY` | AI-quality questions/writing | Fallback questions still work |
| Stripe keys | Checkout / webhook | Checkout 503 |

---

## 2. Marketing & public pages

| ID | P | Persona | Steps | Expected |
|---|---|---|---|---|
| MKT-001 | P0 | ANON | Open `/` | Hero, pricing, CTAs render |
| MKT-002 | P1 | ANON | Click primary CTA | Navigates to mock-exam or login |
| MKT-003 | P0 | ANON | Open `/hsk-2-vs-3` | Comparison table, official link |
| MKT-004 | P0 | ANON | Open `/pricing` | Free vs Pro cards |
| MKT-005 | P1 | ANON | Marketing header links | Pricing / login work |
| MKT-006 | P2 | ANON | Mobile viewport `/` | Responsive, no horizontal scroll |
| MKT-007 | P1 | ANON | App pages with demo notice | `DemoVocabularyNotice` on practice/mock/flashcards |

---

## 3. Authentication & session

| ID | P | Persona | Steps | Expected |
|---|---|---|---|---|
| AUTH-001 | P0 | ANON | `/login` password sign-in | Redirect dashboard, session set |
| AUTH-002 | P0 | ANON | Magic link flow | Email sent → callback → logged in |
| AUTH-003 | P0 | FREE | After first login | `profiles` row exists, `plan=free` |
| AUTH-004 | P0 | ANON | Visit `/dashboard` without session | Redirect `/login` |
| AUTH-005 | P0 | ANON | Visit `/practice`, `/flashcards`, `/mock-exam`, `/mistakes` | Each redirects login |
| AUTH-006 | P1 | ANON | Wrong password | Error, no redirect |
| AUTH-007 | P1 | ANON | `/login?next=/practice` → sign in | Lands on `/practice` |
| AUTH-008 | P1 | ANON | `/auth/callback` without code | Redirect `/login?error=auth` |
| AUTH-009 | P1 | ANON | API call without cookie | 401 |

---

## 4. Dashboard (`/dashboard` + `GET /api/dashboard`)

| ID | P | Persona | Steps | Expected |
|---|---|---|---|---|
| DASH-001 | P0 | FREE | New user opens dashboard | Plan Free, empty stats, CTAs |
| DASH-002 | P0 | FREE | After mock exam | Latest score %, review links |
| DASH-003 | P0 | FREE | After practice | 7/30-day counts + accuracy |
| DASH-004 | P0 | FREE | Weaknesses exist | Free: top 1 skill only |
| DASH-005 | P0 | PRO | Weaknesses exist | Full list, no blur |
| DASH-006 | P1 | FREE | Tab away and return | SWR revalidates (“Syncing…”) |
| DASH-007 | P1 | FREE | API 500 | Error card + Retry |
| DASH-008 | P1 | FREE | Mock exam history | Up to 10 attempts listed |
| DASH-009 | P1 | FREE | Mistake Bank link | Opens `/mistakes` |
| DASH-010 | P1 | FREE | CTAs | Practice + mock exam links work |

---

## 5. Flashcards (`/flashcards` + `/api/srs/review`)

| ID | P | Persona | Steps | Expected |
|---|---|---|---|---|
| FC-001 | P0 | FREE | First visit | Deck seeds, card shows hanzi |
| FC-002 | P0 | FREE | Tap card | Flip: pinyin + English |
| FC-003 | P0 | FREE | Grade 1–5 | Next card loads |
| FC-004 | P1 | FREE | All cards future-due | “All caught up” |
| FC-005 | P1 | FREE | Grade Forgot vs Easy | SM2 interval differs |
| FC-006 | P1 | FREE | RLS on | Only own SRS rows |
| FC-007 | P2 | FREE | DB error | Error + Try again |

---

## 6. AI Practice (`/practice` + `/api/practice/generate`)

| ID | P | Persona | Steps | Expected |
|---|---|---|---|---|
| PRC-001 | P0 | FREE | Load practice (005 applied) | Question + 4 choices |
| PRC-002 | P0 | FREE | Submit answer | Feedback + explanation |
| PRC-003 | P0 | FREE | Next question | New question, counter updates |
| PRC-004 | P0 | FREE | Switch HSK 1/2/3 | Question for level |
| PRC-005 | P0 | FREE | 20 attempts today | 402 limit + upgrade CTA |
| PRC-006 | P0 | PRO | 25+ questions | No daily cap |
| PRC-007 | P1 | FREE | `/practice?questionId=` from mistakes | Review-only, no POST |
| PRC-008 | P1 | FREE | Bad questionId | 404 |
| PRC-009 | P1 | FREE | No OpenAI key | Fallback question works |
| PRC-010 | P0 | FREE | **005 missing** | 500 — regression PRC-011 |
| PRC-011 | P1 | FREE | Level switch during load | Overlay, prior Q visible |
| PRC-012 | P1 | FREE | After generate | `practice_questions` row exists |

---

## 7. Mock exam (`/mock-exam` + `/api/mock-exam/submit`)

| ID | P | Persona | Steps | Expected |
|---|---|---|---|---|
| MOCK-001 | P0 | FREE | Start exam | Q1 loads |
| MOCK-002 | P0 | FREE | Listening items | Audio button, transcript hidden in exam |
| MOCK-003 | P0 | FREE | Reading items | Pinyin ruby stem |
| MOCK-004 | P0 | FREE | Writing items | Must enter text to advance |
| MOCK-005 | P0 | FREE | Submit full exam (004 applied) | Score %, weaknesses, review CTA |
| MOCK-006 | P0 | FREE | **004 missing** | 500 — regression MOCK-006 |
| MOCK-007 | P0 | FREE | 2nd exam attempt | Blocked + upgrade CTA |
| MOCK-008 | P0 | PRO | 2nd+ attempt | Allowed |
| MOCK-009 | P1 | FREE | Review attempt | `/mock-exam/attempts/[id]` with answers |
| MOCK-010 | P1 | FREE | History list | `/mock-exam/attempts` |
| MOCK-011 | P1 | FREE | Pre-004 attempt review | Graceful “no saved answers” |
| MOCK-012 | P1 | PRO | Writing section | AI writing score async |
| MOCK-013 | P1 | FREE | Writing section | Blurred preview + upgrade |
| MOCK-014 | P1 | FREE | Back mid-exam | Answers preserved |
| MOCK-015 | P1 | FREE | After submit | DB row has `answers`, `template_version` |

---

## 8. Mistake bank (`/mistakes`)

| ID | P | Persona | Steps | Expected |
|---|---|---|---|---|
| MST-001 | P0 | FREE | Wrong practice answers | Listed with explanation |
| MST-002 | P0 | FREE | Wrong mock MCQs | Correct vs yours shown |
| MST-003 | P1 | FREE | 10+ practice mistakes | Cap + upgrade CTA |
| MST-004 | P1 | PRO | Many mistakes | Higher limits |
| MST-005 | P1 | FREE | Filter type=practice / mock | Filtered lists |
| MST-006 | P1 | FREE | Filter by skill | Filtered list |
| MST-007 | P1 | FREE | Practice again | `/practice?questionId=` |
| MST-008 | P1 | FREE | Review attempt | Attempt detail page |
| MST-009 | P2 | FREE | No mistakes | Empty state + CTAs |
| MST-010 | P1 | FREE | 005 missing | Practice mistakes without snapshot hidden |

---

## 9. Pricing & Stripe

| ID | P | Persona | Steps | Expected |
|---|---|---|---|---|
| PAY-001 | P0 | ANON | `/pricing` | Tiers visible |
| PAY-002 | P0 | ANON | Upgrade while logged out | → `/login?next=/pricing` |
| PAY-003 | P0 | FREE | Monthly checkout | Stripe session URL |
| PAY-004 | P1 | FREE | Toggle yearly | $69/yr shown |
| PAY-005 | P0 | FREE | Webhook after pay | `profiles.plan = pro` |
| PAY-006 | P1 | FREE | Stripe not configured | Error message |
| PAY-007 | P1 | PRO | Subscription deleted webhook | `plan = free` |

---

## 10. API contract tests (target: Vitest integration)

| ID | P | Endpoint | Request | Expected |
|---|---|---|---|---|
| API-001 | P0 | `GET /api/dashboard` | authed | 200 `DashboardPayload` |
| API-002 | P0 | `GET /api/dashboard` | no session | 401 |
| API-003 | P0 | `GET /api/practice/generate?level=3` | under limit | 200 + `questionId` |
| API-004 | P0 | `GET /api/practice/generate` | 20 today | 402 `limit_reached` |
| API-005 | P0 | `POST /api/practice/generate` | valid body | 200 `ok` |
| API-006 | P0 | `POST /api/mock-exam/submit` | valid payload | 200 `attemptId`, `score` |
| API-007 | P0 | `POST /api/mock-exam/submit` | 1 exam done (free) | 402 |
| API-008 | P0 | `POST /api/mock-exam/submit` | missing MCQ index | 400 |
| API-009 | P0 | `GET /api/srs/review` | new user | 200 card + word |
| API-010 | P0 | `POST /api/writing/score` | FREE | 403 upgrade |
| API-011 | P0 | `POST /api/writing/score` | PRO | 200 score |
| API-012 | P0 | `POST /api/stripe/checkout` | monthly | 200 `{ url }` |
| API-013 | P0 | `POST /api/stripe/webhook` | bad signature | 400 |

---

## 11. End-to-end journeys

| ID | P | Journey | Steps | Expected |
|---|---|---|---|---|
| JNY-001 | P0 | Onboarding | `/` → login → dashboard | Profile + empty stats |
| JNY-002 | P0 | Study loop | Flashcards → practice → dashboard | Stats update |
| JNY-003 | P0 | Mock E2E | Full exam → submit → review | Score saved, review works |
| JNY-004 | P0 | Mistakes replay | Wrong answers → mistakes → practice again | Review mode works |
| JNY-005 | P0 | Paywalls | 20 practice + 2nd mock | Upgrade CTAs |
| JNY-006 | P0 | Upgrade | pricing → Stripe → webhook | Pro unlocked |
| JNY-007 | P1 | Pro features | Unlimited practice, 2nd mock, AI writing | All gates open |
| JNY-008 | P2 | Daily reset | Practice next UTC day | Counter resets |

---

## 12. Regression (recent features)

| ID | P | Area | Expected |
|---|---|---|---|
| REG-001 | P0 | SWR dashboard | Refocus revalidates counts |
| REG-002 | P0 | Practice snapshots | Mistakes show stem from `practice_questions` |
| REG-003 | P0 | Mock metadata | Attempt detail shows saved `answers` |
| REG-004 | P1 | Practice overlay | Prior question during generate |
| REG-005 | P1 | Listening exam | `audioText` hidden during exam |
| REG-006 | P1 | Listening review | Transcript visible on attempt page |

---

## 13. Automation gaps (priority order)

1. Apply migrations **004 + 005** in all environments
2. API contract tests API-003 – API-008
3. Entitlements gaps: `canUseAiWritingScore`, `getWeaknessSummary`
4. Extend `docs/launch/02-smoke-test.md` with mistakes + mock review
5. Playwright E2E for JNY-001 – JNY-005
6. Stripe CLI webhook test

---

## 14. Quick smoke (15 min)

Minimum pass before any release:

1. MKT-001, AUTH-002, AUTH-003
2. FC-001, FC-003
3. PRC-001, PRC-002 (requires **005**)
4. MOCK-005 (requires **004**)
5. DASH-002, MST-001
6. MOCK-009

**~120 cases total** · P0 ≈ 55 · P1 ≈ 45 · P2 ≈ 20
