# Learning Coach Agent — Product & Architecture Spec

- **Date:** 2026-07-10
- **Status:** Approved — founder confirmed 2026-07-10
- **Scope:** Per-user learning profile, AI assessment reports, personalized study plans, human tutoring handoff, re-evaluation loop
- **LLM (MVP):** DeepSeek V4 via OpenAI-compatible API
- **Relates to:** Showcase animation, Dashboard, Practice, Mock exam, Freemium/Pro

---

## 1. Problem statement

Marketing and product vision promise **personalized AI coaching** — not just scores and skill bars. Today the app:

| Layer | Reality |
|-------|---------|
| **Data** | Stores raw events (`practice_attempts`, `mock_exam_attempts`, `srs_cards`) but no **unified learner model** |
| **Analysis** | `computeWeaknesses()` = wrong-count by skill — not natural-language assessment |
| **Recommendations** | Upgrade copy mentions "target practice recommendations" — **not implemented** |
| **Practice** | AI generates questions by level; **does not read** user's weak skills or active plan |
| **Human loop** | No structured path to 1-on-1 tutoring or post-tutoring re-assessment |
| **Showcase** | Can only demo fiction until backend exists |

**Goal:** Build a **Learning Coach** subsystem that closes the loop:

```
Assess → AI Report → Study Plan → Targeted Practice → (optional Human Tutoring) → Re-assess
```

Showcase and logged-in UX should both reflect **the same pipeline** — preview vs live data only.

---

## 2. Current data inventory (what we already capture)

```
profiles          plan, email, founder_cohort, stripe_customer_id
practice_attempts level, skill, correct, question_id, practice_question_id, created_at
practice_questions stem, choices, skill, level (snapshots)
mock_exam_attempts score, breakdown, answers, template_id, duration, status
srs_cards         word_id, level, due_at, ease_factor, repetitions
```

**Gaps for coaching:**

- No `target_hsk_level`, `exam_date`, `native_language`, `study_minutes_per_day`
- No persisted **assessment report** (versioned narrative + structured metrics)
- No **study plan** entity (tasks, schedule, completion)
- No **coach run** audit log (what AI saw, what it recommended, when)
- No link between plan tasks and practice generation params

---

## 3. Decomposition (brainstorming: multi-subsystem)

This is **too large for one PR**. Build in order:

| Phase | Subsystem | Delivers |
|-------|-----------|----------|
| **A** | Learner profile + event snapshot | "Who is this user" + materialized stats |
| **B** | Assessment report generator | AI Summary after mock exam / on demand |
| **C** | Study plan engine | 7-day actionable plan from report |
| **D** | Plan-driven practice | Practice API reads active plan focus |
| **E** | Coach dashboard UI | Report + plan + progress in one place |
| **F** | Human tutoring handoff | Social link + optional booking note |
| **G** | Re-assessment cycle | Trigger new report after N days or 2nd mock |

Phases A–E unlock honest Showcase + logged-in value. F–G complete the business loop you described.

---

## 4. Three architectural approaches

### Approach 1 — **Report-on-rails** (recommended for MVP)

- **No chat agent.** Fixed pipeline: collect snapshot → LLM structured output → store report + plan.
- Coach "personality" is prompt + report template, not conversational memory.
- **Pros:** Fast to ship, testable, predictable cost, easy Freemium gating (summary free / full plan Pro).
- **Cons:** Not a "true agent" users can talk to; feels less magical.

### Approach 2 — **Stateful coach agent**

- Long-running agent with memory (`coach_messages`, tool calls to fetch attempts, update plan).
- User can ask "why is listening weak?" and get answers.
- **Pros:** Best UX differentiation; aligns with "智能体" narrative.
- **Cons:** 3–5× engineering + token cost; harder to test; scope creep.

### Approach 3 — **Hybrid** (recommended target at 60 days)

- **MVP = Approach 1** for assess → report → plan → practice.
- Add **light Q&A** later: read-only RAG over latest report + attempts (no plan mutation without explicit regen).
- Human tutoring stays **out of band** (link to 微信/X/Calendly) until volume justifies booking system.

**Recommendation:** Ship **Approach 1 in Phases A–E**, design tables for Approach 3, avoid building chat until report pipeline is trusted.

---

## 5. Core concepts

### 5.1 Learner profile (`learner_profiles` extends `profiles`)

Optional onboarding + inferred fields:

| Field | Source | Use |
|-------|--------|-----|
| `target_level` | onboarding | e.g. 3 |
| `target_exam_date` | onboarding | urgency in plan |
| `minutes_per_day` | onboarding | plan sizing |
| `native_language` | onboarding | report language tone |
| `coach_notes` | user free text | "I struggle with tones" |
| `tutoring_interest` | CTA click | funnel metric |

### 5.2 Learner snapshot (materialized, per coach run)

Before each AI call, build a **JSON snapshot** (not stored raw in v1 — or stored in `coach_runs.input_snapshot`):

```json
{
  "userId": "...",
  "plan": "free",
  "targetLevel": 3,
  "mockExams": [{ "id", "score", "date", "weaknesses", "writingSample" }],
  "practiceLast30d": { "bySkill": { "listening": { "answered", "correct" } } },
  "srsDueCount": 12,
  "mistakeHotspots": [{ "skill", "count" }],
  "previousReportId": "optional"
}
```

Built by `lib/coach/build-snapshot.ts` — single source of truth for AI input.

### 5.3 Assessment report (`coach_reports`)

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | |
| `user_id` | uuid | |
| `trigger` | enum | `mock_exam_completed`, `manual_refresh`, `scheduled`, `post_tutoring` |
| `source_attempt_id` | uuid? | mock exam that triggered |
| `readiness_score` | int? | 0–100 estimated exam readiness |
| `summary_markdown` | text | **AI Summary** — 2–4 paragraphs, user-facing |
| `strengths` | jsonb | `[{ skill, evidence }]` |
| `gaps` | jsonb | `[{ skill, severity, evidence, subtopics }]` |
| `metrics` | jsonb | structured duplicate of weaknesses for UI charts |
| `model` | text | e.g. `deepseek-v4` (from `COACH_LLM_MODEL`) |
| `version` | int | prompt version for regression |
| `created_at` | timestamptz | |

**Freemium:** Free users get `summary_markdown` truncated (first paragraph) + 1 gap; Pro gets full report.

### 5.4 Study plan (`coach_study_plans` + `coach_plan_tasks`)

**Plan** (one active per user):

| Column | Notes |
|--------|-------|
| `report_id` | generated from |
| `status` | `active`, `completed`, `superseded` |
| `week_start` | date |
| `focus_skills` | jsonb ordered list |

**Tasks** (rows):

| Column | Notes |
|--------|-------|
| `plan_id` | |
| `day_offset` | 0–6 |
| `task_type` | `practice`, `flashcards`, `mock_section`, `review_mistakes`, `rest` |
| `skill` | nullable |
| `target_count` | e.g. 15 questions |
| `title` | "Listening: time expressions" |
| `status` | `pending`, `done`, `skipped` |
| `completed_at` | |

Practice generate API: if active plan task for today specifies `skill=listening`, pass to prompt.

### 5.5 Coach run audit (`coach_runs`)

| Column | Notes |
|--------|-------|
| `user_id` | |
| `report_id` | |
| `plan_id` | |
| `input_snapshot` | jsonb |
| `token_usage` | jsonb |
| `latency_ms` | |
| `error` | nullable |

Enables debugging bad recommendations and cost tracking.

### 5.6 Human tutoring handoff (Phase F — lightweight)

No in-app booking v1.

| Element | Implementation |
|---------|----------------|
| CTA in report | "Want 1-on-1 help? Follow @yourhandle" |
| `profiles.tutoring_cta_clicked_at` | track interest |
| Founder manual | DM → offline tutoring |
| Re-assessment | After tutoring, user clicks **"I finished tutoring — reassess me"** → new `coach_report` with `trigger=post_tutoring` |

**Effect evaluation loop:**

```
Report v1 (baseline)
  → user follows plan + optional tutoring
  → second mock exam OR 14-day auto refresh
  → Report v2 with explicit comparison block:
     "Listening accuracy +12% since last report"
```

Store `previous_report_id` on new report for diff UI.

---

## 6. AI pipeline (Approach 1)

### Trigger points

1. **Mock exam submit** — auto-generate report + plan (async job or inline if fast enough)
2. **Dashboard "Refresh coach"** — Pro only, rate-limited 1/day
3. **Post-tutoring** — manual button
4. **Scheduled** — optional cron for active Pro users (phase G)

### Steps

```
buildSnapshot(userId)
  → generateReport(snapshot)     // LLM, structured JSON + markdown
  → validateReport(zod)
  → persist coach_reports
  → generatePlan(snapshot, report)  // LLM or rules+LLM hybrid
  → persist coach_study_plans + tasks
  → supersede previous active plan
```

### Prompt design principles

- Input: snapshot only — **no hallucination** of scores not in data
- Output: Zod schema — `summary`, `gaps[]`, `strengths[]`, `readinessScore`, `planTasks[]`
- Include syllabus anchors: reference HSK 3.0 skill names
- Chinese examples in report only when quoting user mistakes from `answers`

### File layout

```
src/lib/coach/
  build-snapshot.ts
  generate-report.ts
  generate-plan.ts
  schemas.ts
  types.ts
src/app/api/coach/report/route.ts      POST refresh
src/app/api/coach/plan/route.ts        GET active plan
src/app/api/coach/plan/tasks/[id]/route.ts  PATCH complete
src/app/(app)/coach/page.tsx           or merge into dashboard
```

Hook mock submit: after insert attempt → `enqueueCoachRun(attemptId)`.

### LLM provider — DeepSeek V4 (MVP)

Coach pipeline (`generate-report`, `generate-plan`) uses **DeepSeek V4**, not OpenAI. Practice generation and writing score may continue using `OPENAI_API_KEY` until migrated separately.

**Integration:** DeepSeek exposes an [OpenAI-compatible API](https://api-docs.deepseek.com/). Reuse the existing `openai` npm package with a custom `baseURL`.

**Environment variables** (add to `.env.local` / Vercel; founder supplies values):

| Variable | Required | Description |
|----------|----------|-------------|
| `DEEPSEEK_API_KEY` | Yes (coach) | DeepSeek API key |
| `DEEPSEEK_BASE_URL` | Yes | Default `https://api.deepseek.com` |
| `COACH_LLM_MODEL` | Yes | DeepSeek V4 model id (e.g. `deepseek-chat` or vendor V4 slug) |

**Client helper** (`src/lib/coach/llm.ts`):

```typescript
import OpenAI from "openai";

export function getCoachLLM(): OpenAI | null {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({
    apiKey,
    baseURL: process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com",
  });
}

export function getCoachModel(): string {
  return process.env.COACH_LLM_MODEL ?? "deepseek-chat";
}
```

**coach_runs.token_usage** should record `provider: "deepseek"` and `model` for cost tracking.

**Failure mode:** If `DEEPSEEK_API_KEY` is missing, coach run returns 503; mock exam submit still succeeds with score only (coach queued or skipped with user-visible "Report generating…" retry).

---

## 7. UX mapping (logged-in)

### Dashboard becomes **Coach home** (or tab)

| Section | Content |
|---------|---------|
| **AI Summary** | Latest `summary_markdown` |
| **Your plan this week** | Task checklist with deep links |
| **Progress since last report** | Mini diff if `previous_report_id` |
| **Take action** | Primary CTA = today's task |
| **Need human help?** | Tutoring CTA block |

### Practice

- Banner: "Today's focus: Listening (from your coach plan)"
- URL: `/practice?skill=listening&planTaskId=...`

### Mock exam result

- After submit: show report generating → redirect to coach summary
- Not just score ring + weakness list

### Showcase (guest)

- Steps 2–3 animate **same components** as logged-in (`CoachReportPreview`, `CoachPlanPreview`)
- Label: Preview / Example

---

## 8. Freemium & monetization alignment

| Feature | Free | Pro |
|---------|------|-----|
| Auto report after 1st mock | Summary paragraph + top 1 gap | Full report |
| Study plan | 3 tasks visible | Full 7-day plan |
| Plan-driven practice | 1 skill/day | All tasks |
| Report refresh | — | 1/day |
| Tutoring CTA | ✅ | ✅ |
| Report comparison | — | ✅ |

This replaces vague "detailed weakness report" with concrete **Coach** SKU.

---

## 9. What NOT to build (YAGNI)

- Real-time chat agent (phase 2+)
- In-app video tutoring
- Calendly integration until >20 tutoring leads/month
- HSK 4–6 coaching
- Multi-language reports (English only v1)

---

## 10. Success metrics

| Metric | Target |
|--------|--------|
| % mock completers who view full report | >80% |
| % who complete ≥1 plan task in 7d | >40% |
| Practice sessions with `planTaskId` | >50% of Pro |
| Tutoring CTA click rate | track baseline |
| 2nd mock within 30d (re-assessment) | >25% active users |

---

## 11. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| LLM invents weaknesses | Snapshot-only input; cite `evidence` from attempt IDs |
| Cost per user | DeepSeek V4 via `COACH_LLM_MODEL`; cache report until new mock or manual refresh |
| Slow mock submit | Async: show score immediately, poll `/api/coach/report/latest` |
| Showcase overpromises | Ship backend before updating marketing superlatives |

---

## 12. Decisions (locked for MVP)

| Decision | Choice |
|----------|--------|
| LLM for coach | **DeepSeek V4** (`DEEPSEEK_*` + `COACH_LLM_MODEL`) |
| Architecture | **Approach 1** — report-on-rails pipeline |
| Coach UI surface | **Merge into Dashboard** (no separate `/coach` in MVP) |
| Tutoring CTA | **WeChat primary** + optional second link in report footer (founder configures handle in env `TUTORING_WECHAT_ID` or settings later) |
| Free tier report | **Summary paragraph + top 1 gap** after first mock; full report Pro |
| Free Week 1 | Complete first week of plan tasks (taste Coach) |
| Primary Pro gate | **After Week 1 completion** — unlock journey continuation (see `2026-07-13-full-journey-coach-positioning.md`) |
| Single track | **HSK Level 3** only in this milestone; no 1–9 picker |

---

## 13. Next step after approval

Invoke **writing-plans** skill → `docs/superpowers/plans/2026-07-10-learning-coach-phase-a-e.md` with migration SQL, API routes, and Dashboard UI tasks.
