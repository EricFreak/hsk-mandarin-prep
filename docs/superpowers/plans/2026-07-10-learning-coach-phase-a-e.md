# Learning Coach Phases A–E Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the assess → AI report → study plan → targeted practice loop using DeepSeek V4, merged into Dashboard.

**Architecture:** Report-on-rails pipeline (`buildSnapshot` → `generateReport` → `generatePlan` → persist). No chat agent. Freemium gates summary/tasks on the API layer. Mock exam submit triggers async `/api/coach/run`.

**Tech Stack:** Next.js 14 App Router, Supabase (Postgres + RLS), DeepSeek via OpenAI SDK, Zod, SWR

**Spec:** `docs/superpowers/specs/2026-07-10-learning-coach-agent-design.md`

---

## File map

| File | Responsibility |
|------|----------------|
| `supabase/migrations/006_coach.sql` | Coach tables + RLS |
| `src/lib/coach/build-snapshot.ts` | Aggregate learner data for LLM |
| `src/lib/coach/generate-report.ts` | DeepSeek report + fallback |
| `src/lib/coach/generate-plan.ts` | DeepSeek plan + fallback |
| `src/lib/coach/run-coach.ts` | Pipeline orchestration |
| `src/lib/coach/fetch-coach.ts` | Dashboard payload |
| `src/lib/coach/freemium.ts` | Free vs Pro gating |
| `src/app/api/coach/*` | REST endpoints |
| `src/components/dashboard/CoachPanel.tsx` | Dashboard UI |
| `src/components/practice/PracticeSession.tsx` | `?skill=` + plan banner |

---

### Task 1: Database migration

**Files:** `supabase/migrations/006_coach.sql`

- [x] Create `learner_profiles`, `coach_reports`, `coach_study_plans`, `coach_plan_tasks`, `coach_runs`
- [x] Add RLS policies (select/insert/update own rows)
- [ ] **Founder:** Run SQL in Supabase SQL Editor on production project

---

### Task 2: Coach lib + tests

**Files:** `src/lib/coach/*`, `tests/lib/coach/*`

- [x] `llm.ts` — DeepSeek client
- [x] `schemas.ts` + tests — Zod parse report/plan JSON
- [x] `build-snapshot.ts` — mock + practice + SRS aggregation
- [x] `generate-report.ts` / `generate-plan.ts` — LLM + deterministic fallback
- [x] `run-coach.ts` — idempotent per mock attempt
- [x] `freemium.ts` + tests — truncate summary, limit tasks

Run: `npm test -- tests/lib/coach`

---

### Task 3: API routes

**Files:** `src/app/api/coach/**`

- [x] `GET /api/coach/dashboard` — report + plan + today task
- [x] `GET /api/coach/report/latest` — poll after mock
- [x] `POST /api/coach/run` — trigger pipeline (mock / post-tutoring)
- [x] `POST /api/coach/report` — Pro manual refresh (1/day)
- [x] `GET /api/coach/plan` — active plan tasks
- [x] `PATCH /api/coach/plan/tasks/[id]` — mark done/skipped

---

### Task 4: Mock exam hook

**Files:** `src/app/api/mock-exam/submit/route.ts`, `MockExamSession.tsx`

- [x] Return `coachPending: true` with `attemptId`
- [x] Client calls `POST /api/coach/run` after submit
- [x] Show generating / ready status on result screen

---

### Task 5: Plan-driven practice

**Files:** `src/lib/openai/practice.ts`, `src/app/api/practice/generate/route.ts`, `PracticeSession.tsx`

- [x] Accept `?skill=` query param
- [x] Pass focus skill into practice prompt
- [x] Banner: "Today's focus: … (from your coach plan)"
- [x] Auto-complete plan task on correct answer when `planTaskId` present

---

### Task 6: Dashboard Coach UI

**Files:** `src/components/dashboard/CoachPanel.tsx`, `DashboardView.tsx`

- [x] AI Summary section with readiness score
- [x] Weekly plan checklist + today's CTA
- [x] WeChat tutoring block (`TUTORING_WECHAT_ID`)
- [x] Freemium upgrade CTA for truncated report/plan
- [x] Poll dashboard while `status === pending`

---

### Task 7: Marketing showcase alignment

**Files:** `HowItWorksShowcase.tsx`

- [x] 6-step flow: mock → score → AI summary → plan → practice → dashboard
- [x] All previews labeled "Preview"

---

### Task 8: Env + verify

**Files:** `.env.example`

- [x] Add `DEEPSEEK_*`, `COACH_LLM_MODEL`, `TUTORING_WECHAT_ID`
- [ ] **Founder:** Ensure Vercel has same vars + redeploy
- [ ] Run `npm run build` && `npm run test:all`

---

## Manual test plan

1. Register / login as free user
2. Complete mock exam → see coach generating → dashboard shows AI summary (truncated) + 3 tasks
3. Click today's practice task → `/practice?skill=listening&planTaskId=…` → answer correctly → task marked done
4. Login as Pro (`657696471@qq.com`) → full report + 7 tasks + Refresh coach
5. Guest `/` → How it works 6-step animation, no fake user data in hero

---

## Out of scope (Phase F–G)

- Post-tutoring reassess button (table supports `post_tutoring` trigger; UI later)
- Report v1 vs v2 comparison block
- Chat agent / Calendly
