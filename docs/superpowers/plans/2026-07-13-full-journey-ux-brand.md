# Full-Journey UX & Brand Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved full-journey Coach: elastic stage calendar, learner journey outline (theme-level), sequential week unlock after mastery, Free Week-1 → Pro for Week 2+, slim Dashboard strip, placement/onboarding, MasteryGate MVP, and HSK Prep naming pass.

**Architecture:** Add pure journey math (`allocateStages`, outline themes, week-clear / unlock rules) tested with Vitest. Persist journey state on `learner_profiles` + `journey_week_outlines` (or JSONB outline) and tag `coach_study_plans` with `week_index` + `stage`. Keep Dashboard Zone 1 as the execution surface; add slim strip + journey page for outline. Replace Free “first 3 tasks” gating with “full Week 1 / lock Week 2+ execution”. Placement = shortened in-app Level 3 diagnostic that feeds existing `runCoach`. MasteryGate MVP = skill-weighted accuracy on plan-task session end before marking `done`.

**Tech Stack:** Next.js App Router, React, SWR, Supabase, Zod, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-07-13-full-journey-ux-brand-design.md`  
**Also:** `docs/superpowers/specs/2026-07-13-full-journey-coach-positioning.md` (§5 amended), `docs/superpowers/specs/2026-07-13-dashboard-v2-design.md` (§5 MasteryGate)

**Execution note:** Work **in order**. Each task ends with a commit. Apply migration `008` in Supabase before relying on new columns in staging/prod.

---

## File map

| File | Responsibility |
|------|----------------|
| `supabase/migrations/008_learner_journey.sql` | Journey columns + outline table + plan week_index/stage; task mastery fields |
| `src/lib/coach/journey/allocate-stages.ts` | Pure: dates → stage windows |
| `src/lib/coach/journey/build-outline.ts` | Pure: stages + gaps → week theme outline |
| `src/lib/coach/journey/week-unlock.ts` | Pure: sequential unlock + Free/Pro execution gate |
| `src/lib/coach/journey/mastery-gate.ts` | Pure: pass / not-yet from attempt accuracy |
| `src/lib/coach/journey/stage-quotas.ts` | Pure: per-stage skill quota weights for plan gen |
| `tests/lib/coach/journey/*.test.ts` | Unit tests for the above |
| `src/lib/coach/types.ts` | Journey + mastery types |
| `src/lib/coach/freemium.ts` | Stop Free 3-task slice for Week 1; Week 2+ lock helpers |
| `src/lib/coach/week-tasks.ts` | Integrate unlock gate into ordered task visibility |
| `src/lib/coach/generate-plan.ts` | Stage quotas × gap reweight; accept journey context |
| `src/lib/coach/run-coach.ts` | Init/update journey; materialize current week only |
| `src/lib/coach/fetch-coach.ts` | Dashboard payload: journey strip + outline summary |
| `src/lib/coach/build-snapshot.ts` | Include exam date / stage in snapshot |
| `src/app/api/onboarding/route.ts` | POST exam date / unsure horizon |
| `src/app/(app)/onboarding/page.tsx` | Exam-date step UI |
| `src/app/(app)/placement/page.tsx` | Short diagnostic entry |
| `src/data/placement/hsk3-placement.ts` | Shortened question set from mock template |
| `src/components/dashboard/JourneyStrip.tsx` | Slim strip UI |
| `src/components/dashboard/DashboardView.tsx` | Mount strip above ThisWeekZone |
| `src/components/dashboard/ThisWeekZone.tsx` | Week-cleared Pro CTA; hide W2+ tasks for Free |
| `src/app/(app)/dashboard/journey/page.tsx` | Full outline UI |
| `src/components/dashboard/JourneyOutlineView.tsx` | Outline list client |
| `src/components/practice/MasteryGateResult.tsx` | Session-end gate UI |
| `src/components/practice/PracticeSession.tsx` | Call mastery gate before `status:done` |
| `src/app/api/coach/plan/tasks/[id]/route.ts` | Accept mastery outcome; refuse done if not passed |
| `src/components/marketing/BrandLogo.tsx` / `layout.tsx` / copy pages | Naming pass |
| `src/lib/entitlements.ts` | Optional helpers for journey week execution |
| `e2e/authenticated/journey-outline.spec.ts` | Outline visible; sequential lock smoke |
| `e2e/free/week1-pro-gate.spec.ts` | Free completes W1 themes; W2 execution gated |

---

### Task 1: Migration — journey + mastery columns

**Files:**
- Create: `supabase/migrations/008_learner_journey.sql`

- [ ] **Step 1: Write migration**

```sql
-- 008_learner_journey.sql
alter table learner_profiles
  add column if not exists journey_horizon_weeks int default 12,
  add column if not exists current_stage text
    check (current_stage is null or current_stage in ('diagnose','foundation','skills','sprint')),
  add column if not exists current_week_index int default 1,
  add column if not exists journey_started_at timestamptz,
  add column if not exists stage_calendar jsonb default '{}'::jsonb;

create table if not exists journey_week_outlines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_index int not null,
  stage text not null check (stage in ('diagnose','foundation','skills','sprint')),
  theme text not null,
  skill_focus text[] not null default '{}',
  status text not null default 'locked'
    check (status in ('locked','available','passed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, week_index)
);

alter table coach_study_plans
  add column if not exists week_index int,
  add column if not exists stage text
    check (stage is null or stage in ('diagnose','foundation','skills','sprint'));

alter table coach_plan_tasks
  add column if not exists mastery_status text
    check (mastery_status is null or mastery_status in ('not_yet','passed','challenged')),
  add column if not exists mastery_score numeric,
  add column if not exists required boolean not null default true;

alter table journey_week_outlines enable row level security;
create policy "journey_week_outlines_select_own"
  on journey_week_outlines for select using (auth.uid() = user_id);
create policy "journey_week_outlines_insert_own"
  on journey_week_outlines for insert with check (auth.uid() = user_id);
create policy "journey_week_outlines_update_own"
  on journey_week_outlines for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/008_learner_journey.sql
git commit -m "db: add learner journey outline and mastery columns"
```

---

### Task 2: Stage allocator (TDD)

**Files:**
- Create: `src/lib/coach/journey/allocate-stages.ts`
- Create: `src/lib/coach/journey/types.ts`
- Test: `tests/lib/coach/journey/allocate-stages.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
import { describe, expect, it } from "vitest";
import { allocateStages } from "@/lib/coach/journey/allocate-stages";

describe("allocateStages", () => {
  it("is deterministic for same inputs", () => {
    const a = allocateStages({ today: "2026-07-13", examDate: "2026-10-12" });
    const b = allocateStages({ today: "2026-07-13", examDate: "2026-10-12" });
    expect(a).toEqual(b);
  });

  it("ends with sprint before exam when horizon is long", () => {
    const stages = allocateStages({ today: "2026-07-13", examDate: "2026-10-12" });
    expect(stages.map((s) => s.stage)).toEqual([
      "diagnose",
      "foundation",
      "skills",
      "sprint",
    ]);
    const sprint = stages.find((s) => s.stage === "sprint")!;
    expect(sprint.endDate <= "2026-10-12").toBe(true);
    expect(sprint.startDate < sprint.endDate).toBe(true);
  });

  it("uses default horizon weeks when examDate null", () => {
    const stages = allocateStages({
      today: "2026-07-13",
      examDate: null,
      defaultHorizonWeeks: 12,
    });
    expect(stages.at(-1)!.stage).toBe("sprint");
    expect(stages[0]!.stage).toBe("diagnose");
  });

  it("compresses foundation when only ~6 weeks remain", () => {
    const long = allocateStages({ today: "2026-07-13", examDate: "2026-12-01" });
    const short = allocateStages({ today: "2026-07-13", examDate: "2026-08-24" });
    const longF = long.find((s) => s.stage === "foundation")!;
    const shortF = short.find((s) => s.stage === "foundation")!;
    const days = (s: { startDate: string; endDate: string }) =>
      (Date.parse(s.endDate) - Date.parse(s.startDate)) / 86400000;
    expect(days(shortF)).toBeLessThan(days(longF));
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `npx vitest run tests/lib/coach/journey/allocate-stages.test.ts -v`  
Expected: FAIL (module not found)

- [ ] **Step 3: Implement**

```ts
// src/lib/coach/journey/types.ts
export type JourneyStageId = "diagnose" | "foundation" | "skills" | "sprint";

export type StageWindow = {
  stage: JourneyStageId;
  startDate: string; // YYYY-MM-DD
  endDate: string;
};

export type WeekOutlineRow = {
  weekIndex: number;
  stage: JourneyStageId;
  theme: string;
  skillFocus: string[];
  status: "locked" | "available" | "passed";
};
```

```ts
// src/lib/coach/journey/allocate-stages.ts
import type { StageWindow, JourneyStageId } from "./types";

function parseDay(iso: string): number {
  return Date.parse(`${iso}T00:00:00.000Z`);
}
function formatDay(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}
function addDays(iso: string, days: number): string {
  return formatDay(parseDay(iso) + days * 86400000);
}
function dayDiff(a: string, b: string): number {
  return Math.round((parseDay(b) - parseDay(a)) / 86400000);
}

export function allocateStages(input: {
  today: string;
  examDate: string | null;
  defaultHorizonWeeks?: number;
}): StageWindow[] {
  const horizonWeeks = input.defaultHorizonWeeks ?? 12;
  const exam =
    input.examDate ?? addDays(input.today, horizonWeeks * 7);
  const total = Math.max(21, dayDiff(input.today, exam)); // at least ~3 weeks
  const diagnoseDays = Math.min(7, Math.max(3, Math.round(total * 0.08)));
  let sprintDays = Math.round(total * 0.2);
  sprintDays = Math.min(28, Math.max(14, sprintDays));
  if (total < 42) sprintDays = Math.min(14, Math.max(10, Math.round(total * 0.25)));
  const remaining = Math.max(7, total - diagnoseDays - sprintDays);
  // Short horizon: foundation gets ~35% of remaining; long: ~55%
  const foundationShare = total < 56 ? 0.35 : 0.55;
  const foundationDays = Math.max(5, Math.round(remaining * foundationShare));
  const skillsDays = Math.max(5, remaining - foundationDays);

  const d0 = input.today;
  const d1 = addDays(d0, diagnoseDays);
  const d2 = addDays(d1, foundationDays);
  const d3 = addDays(d2, skillsDays);
  const d4 = exam;

  const windows: StageWindow[] = [
    { stage: "diagnose", startDate: d0, endDate: d1 },
    { stage: "foundation", startDate: d1, endDate: d2 },
    { stage: "skills", startDate: d2, endDate: d3 },
    { stage: "sprint", startDate: d3, endDate: d4 },
  ];
  return windows;
}

export function stageAtDate(windows: StageWindow[], date: string): JourneyStageId {
  for (const w of windows) {
    if (date >= w.startDate && date < w.endDate) return w.stage;
  }
  return windows.at(-1)?.stage ?? "sprint";
}
```

- [ ] **Step 4: Run tests — expect PASS**

Run: `npx vitest run tests/lib/coach/journey/allocate-stages.test.ts -v`

- [ ] **Step 5: Commit**

```bash
git add src/lib/coach/journey/ tests/lib/coach/journey/allocate-stages.test.ts
git commit -m "feat(journey): deterministic stage allocator"
```

---

### Task 3: Week outline builder (TDD)

**Files:**
- Create: `src/lib/coach/journey/build-outline.ts`
- Create: `src/lib/coach/journey/stage-quotas.ts`
- Test: `tests/lib/coach/journey/build-outline.test.ts`

- [ ] **Step 1: Failing tests**

```ts
import { describe, expect, it } from "vitest";
import { allocateStages } from "@/lib/coach/journey/allocate-stages";
import { buildWeekOutline } from "@/lib/coach/journey/build-outline";

describe("buildWeekOutline", () => {
  it("covers every calendar week until exam with theme-level rows", () => {
    const stages = allocateStages({ today: "2026-07-13", examDate: "2026-09-07" });
    const outline = buildWeekOutline({
      stages,
      today: "2026-07-13",
      gaps: [{ skill: "listening", severity: "high" }],
    });
    expect(outline.length).toBeGreaterThanOrEqual(6);
    expect(outline[0]).toMatchObject({
      weekIndex: 1,
      status: "available",
    });
    expect(outline[1]?.status).toBe("locked");
    expect(outline.every((w) => w.theme.length > 0)).toBe(true);
  });

  it("labels foundation weeks vocab/grammar-led", () => {
    const stages = allocateStages({ today: "2026-07-13", examDate: "2026-11-01" });
    const outline = buildWeekOutline({ stages, today: "2026-07-13", gaps: [] });
    const foundation = outline.filter((w) => w.stage === "foundation");
    expect(foundation[0]?.theme.toLowerCase()).toMatch(/vocab|grammar|foundation/);
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

Run: `npx vitest run tests/lib/coach/journey/build-outline.test.ts -v`

- [ ] **Step 3: Implement quotas + outline**

```ts
// src/lib/coach/journey/stage-quotas.ts
import type { JourneyStageId } from "./types";

/** Relative skill weights inside a stage (sum ~= 1). */
export function stageQuotas(stage: JourneyStageId): Record<string, number> {
  switch (stage) {
    case "diagnose":
      return { vocabulary: 0.3, grammar: 0.2, listening: 0.2, reading: 0.2, writing: 0.1 };
    case "foundation":
      return { vocabulary: 0.4, grammar: 0.35, listening: 0.1, reading: 0.1, writing: 0.05 };
    case "skills":
      return { vocabulary: 0.15, grammar: 0.15, listening: 0.25, reading: 0.25, writing: 0.2 };
    case "sprint":
      return { listening: 0.25, reading: 0.25, writing: 0.2, vocabulary: 0.15, grammar: 0.15 };
  }
}

export function reweightQuotas(
  base: Record<string, number>,
  gaps: { skill: string; severity: "low" | "medium" | "high" }[],
): Record<string, number> {
  const boost = { low: 1.1, medium: 1.25, high: 1.5 } as const;
  const next = { ...base };
  for (const g of gaps) {
    const key = g.skill in next ? g.skill : g.skill === "vocab" ? "vocabulary" : g.skill;
    if (key in next) next[key] = (next[key] ?? 0) * boost[g.severity];
  }
  const sum = Object.values(next).reduce((a, b) => a + b, 0) || 1;
  for (const k of Object.keys(next)) next[k] = (next[k] ?? 0) / sum;
  return next;
}

export function primaryTheme(quotas: Record<string, number>, stage: JourneyStageId): {
  theme: string;
  skillFocus: string[];
} {
  const ranked = Object.entries(quotas).sort((a, b) => b[1] - a[1]);
  const top = ranked.slice(0, 2).map(([k]) => k);
  const label: Record<string, string> = {
    vocabulary: "Vocabulary",
    grammar: "Grammar",
    listening: "Listening",
    reading: "Reading",
    writing: "Writing",
  };
  const theme =
    stage === "sprint"
      ? `Sprint · ${label[top[0]!] ?? top[0]} + mock review`
      : `${label[top[0]!] ?? top[0]} focus` +
        (top[1] ? ` · ${label[top[1]] ?? top[1]} support` : "");
  return { theme, skillFocus: top };
}
```

```ts
// src/lib/coach/journey/build-outline.ts
import type { StageWindow, WeekOutlineRow } from "./types";
import { stageAtDate } from "./allocate-stages";
import { primaryTheme, reweightQuotas, stageQuotas } from "./stage-quotas";

function addDays(iso: string, days: number): string {
  const ms = Date.parse(`${iso}T00:00:00.000Z`) + days * 86400000;
  return new Date(ms).toISOString().slice(0, 10);
}

export function buildWeekOutline(input: {
  stages: StageWindow[];
  today: string;
  gaps: { skill: string; severity: "low" | "medium" | "high" }[];
}): WeekOutlineRow[] {
  const end = input.stages.at(-1)!.endDate;
  const rows: WeekOutlineRow[] = [];
  let weekStart = input.today;
  let index = 1;
  while (weekStart < end && index <= 52) {
    const stage = stageAtDate(input.stages, weekStart);
    const quotas = reweightQuotas(stageQuotas(stage), input.gaps);
    const { theme, skillFocus } = primaryTheme(quotas, stage);
    rows.push({
      weekIndex: index,
      stage,
      theme,
      skillFocus,
      status: index === 1 ? "available" : "locked",
    });
    weekStart = addDays(weekStart, 7);
    index += 1;
  }
  return rows;
}
```

- [ ] **Step 4: Run — PASS**

Run: `npx vitest run tests/lib/coach/journey/build-outline.test.ts -v`

- [ ] **Step 5: Commit**

```bash
git add src/lib/coach/journey/stage-quotas.ts src/lib/coach/journey/build-outline.ts tests/lib/coach/journey/build-outline.test.ts
git commit -m "feat(journey): theme-level week outline builder"
```

---

### Task 4: Sequential unlock + Free/Pro execution gate (TDD)

**Files:**
- Create: `src/lib/coach/journey/week-unlock.ts`
- Test: `tests/lib/coach/journey/week-unlock.test.ts`
- Modify: `src/lib/coach/freemium.ts`
- Modify: `src/lib/coach/week-tasks.ts`
- Modify: `tests/lib/coach/week-tasks.test.ts`
- Modify: `tests/lib/coach/freemium.test.ts`

- [ ] **Step 1: Failing tests for unlock**

```ts
import { describe, expect, it } from "vitest";
import {
  canExecuteWeek,
  nextWeekAfterClear,
} from "@/lib/coach/journey/week-unlock";

describe("canExecuteWeek", () => {
  it("allows week 1 for free", () => {
    expect(
      canExecuteWeek({ weekIndex: 1, plan: "free", currentWeekIndex: 1 }),
    ).toBe(true);
  });
  it("blocks week 2 for free even if current is 2", () => {
    expect(
      canExecuteWeek({ weekIndex: 2, plan: "free", currentWeekIndex: 2 }),
    ).toBe(false);
  });
  it("allows week 2 for pro when currentWeekIndex is 2", () => {
    expect(
      canExecuteWeek({ weekIndex: 2, plan: "pro", currentWeekIndex: 2 }),
    ).toBe(true);
  });
  it("blocks future week even for pro", () => {
    expect(
      canExecuteWeek({ weekIndex: 3, plan: "pro", currentWeekIndex: 2 }),
    ).toBe(false);
  });
});

describe("nextWeekAfterClear", () => {
  it("increments", () => {
    expect(nextWeekAfterClear(1)).toBe(2);
  });
});
```

- [ ] **Step 2: Implement unlock helpers**

```ts
// src/lib/coach/journey/week-unlock.ts
import type { Plan } from "@/lib/entitlements";

export function canExecuteWeek(input: {
  weekIndex: number;
  currentWeekIndex: number;
  plan: Plan;
}): boolean {
  if (input.weekIndex !== input.currentWeekIndex) return false;
  if (input.plan === "free" && input.weekIndex > 1) return false;
  return true;
}

export function nextWeekAfterClear(currentWeekIndex: number): number {
  return currentWeekIndex + 1;
}

export function shouldShowWeek1ProCta(input: {
  plan: Plan;
  currentWeekIndex: number;
  weekCleared: boolean;
}): boolean {
  return input.plan === "free" && input.currentWeekIndex === 1 && input.weekCleared;
}
```

- [ ] **Step 3: Change freemium task gating**

Replace `applyFreemiumTasks` behavior for journey mode: **do not** slice Week 1 to 3 tasks. Prefer gating at week level via `canExecuteWeek`. Update `gateOrderedWeekTasks` to accept `{ plan, weekIndex, currentWeekIndex }` and return empty tasks + `weekLockedReason` when `!canExecuteWeek`.

```ts
// In week-tasks.ts — extend signature
export function gateOrderedWeekTasks(
  tasks: CoachPlanTaskRow[],
  topGapSkill: string | null | undefined,
  plan: Plan,
  journey?: { weekIndex: number; currentWeekIndex: number },
): { tasks: CoachPlanTaskRow[]; hiddenTaskCount: number; executionLocked: boolean } {
  const ordered = orderWeekTasks(tasks, topGapSkill);
  if (
    journey &&
    !canExecuteWeek({
      weekIndex: journey.weekIndex,
      currentWeekIndex: journey.currentWeekIndex,
      plan,
    })
  ) {
    return { tasks: [], hiddenTaskCount: ordered.length, executionLocked: true };
  }
  // Free Week 1: show all tasks (no 3-task slice)
  if (plan === "free") {
    return { tasks: ordered, hiddenTaskCount: 0, executionLocked: false };
  }
  return { tasks: ordered, hiddenTaskCount: 0, executionLocked: false };
}
```

Update unit tests: remove expectation that Free truncates to 3; add executionLocked cases.

Keep `applyFreemiumTasks` as deprecated wrapper calling full list for week 1, or make it a no-op passthrough and update `freemium.test.ts` accordingly.

- [ ] **Step 4: Run**

Run: `npx vitest run tests/lib/coach/journey/week-unlock.test.ts tests/lib/coach/week-tasks.test.ts tests/lib/coach/freemium.test.ts -v`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/coach/journey/week-unlock.ts src/lib/coach/week-tasks.ts src/lib/coach/freemium.ts tests/lib/coach/
git commit -m "feat(journey): sequential week unlock and Free W2+ gate"
```

---

### Task 5: MasteryGate pure policy (TDD)

**Files:**
- Create: `src/lib/coach/journey/mastery-gate.ts`
- Test: `tests/lib/coach/journey/mastery-gate.test.ts`

- [ ] **Step 1: Failing tests**

```ts
import { describe, expect, it } from "vitest";
import { evaluateMasteryGate } from "@/lib/coach/journey/mastery-gate";

describe("evaluateMasteryGate", () => {
  it("passes at 0.75 accuracy", () => {
    const r = evaluateMasteryGate({
      correct: 8,
      answered: 10,
      hintAssistedCorrect: 0,
      passThreshold: 0.75,
    });
    expect(r.outcome).toBe("passed");
    expect(r.displayScore).toBe(8);
  });

  it("excludes hint-assisted corrects from pass numerator", () => {
    const r = evaluateMasteryGate({
      correct: 9,
      answered: 10,
      hintAssistedCorrect: 3,
      passThreshold: 0.75,
    });
    // effective 6/10
    expect(r.outcome).toBe("not_yet");
  });

  it("rest tasks auto-pass without fake score", () => {
    const r = evaluateMasteryGate({
      taskType: "rest",
      correct: 0,
      answered: 0,
      hintAssistedCorrect: 0,
    });
    expect(r.outcome).toBe("passed");
    expect(r.displayScore).toBeNull();
  });
});
```

- [ ] **Step 2: Implement**

```ts
// src/lib/coach/journey/mastery-gate.ts
export type MasteryOutcome = "not_yet" | "passed" | "challenged";

export function evaluateMasteryGate(input: {
  correct: number;
  answered: number;
  hintAssistedCorrect: number;
  passThreshold?: number;
  challengeThreshold?: number;
  taskType?: string;
}): {
  outcome: MasteryOutcome;
  displayScore: number | null;
  displayMax: number | null;
  effectiveAccuracy: number | null;
} {
  if (input.taskType === "rest") {
    return { outcome: "passed", displayScore: null, displayMax: null, effectiveAccuracy: null };
  }
  const passAt = input.passThreshold ?? 0.75;
  const effectiveCorrect = Math.max(0, input.correct - input.hintAssistedCorrect);
  const answered = Math.max(1, input.answered);
  const acc = effectiveCorrect / answered;
  const displayMax = 10;
  const displayScore = Math.round(acc * displayMax);
  if (acc >= (input.challengeThreshold ?? 0.9)) {
    return { outcome: "challenged", displayScore, displayMax, effectiveAccuracy: acc };
  }
  if (acc >= passAt) {
    return { outcome: "passed", displayScore, displayMax, effectiveAccuracy: acc };
  }
  return { outcome: "not_yet", displayScore, displayMax, effectiveAccuracy: acc };
}
```

- [ ] **Step 3: Run — PASS** then commit

```bash
npx vitest run tests/lib/coach/journey/mastery-gate.test.ts -v
git add src/lib/coach/journey/mastery-gate.ts tests/lib/coach/journey/mastery-gate.test.ts
git commit -m "feat(journey): MasteryGate scoring policy"
```

---

### Task 6: Persist journey on coach run + materialize current week

**Files:**
- Modify: `src/lib/coach/run-coach.ts`
- Modify: `src/lib/coach/generate-plan.ts`
- Modify: `src/lib/coach/build-snapshot.ts`
- Modify: `src/lib/coach/types.ts`
- Create: `src/lib/coach/journey/persist-journey.ts` (upsert outline + profile fields)

- [ ] **Step 1: Add `persist-journey.ts`**

Implement `ensureJourney(supabase, userId, { examDate, gaps, today })`:
1. Read `learner_profiles` (`target_exam_date`, `journey_horizon_weeks`, `current_week_index`, …)
2. If no `stage_calendar` / outlines: `allocateStages` → `buildWeekOutline` → upsert `journey_week_outlines`; set `current_stage`, `current_week_index=1`, week 1 `available`
3. Return `{ stages, outline, currentWeekIndex, currentStage }`

- [ ] **Step 2: Wire `runCoach`**

After report, call `ensureJourney`. Pass `stage` + quotas into `generatePlan` (extend prompt/fallback to bias task skills using `reweightQuotas(stageQuotas(stage), gaps)`). When inserting `coach_study_plans`, set `week_index` + `stage`. Only create tasks for the **current** executable week.

- [ ] **Step 3: Add `clearWeekAndUnlockNext(supabase, userId)`**

When all **required** tasks for current week have `mastery_status in ('passed','challenged')` (or rest passed):
- Mark outline week `passed`
- `current_week_index = nextWeekAfterClear`
- Mark next outline `available`
- Generate next week plan **only if** `canExecuteWeek` for that user’s plan (Pro, or still on W1)

- [ ] **Step 4: Manual smoke** — run unit tests for any new pure helpers; commit

```bash
git add src/lib/coach/
git commit -m "feat(journey): persist outline and tag study plans by week"
```

---

### Task 7: Onboarding exam date + placement entry

**Files:**
- Create: `src/app/(app)/onboarding/page.tsx`
- Create: `src/app/api/onboarding/route.ts`
- Create: `src/data/placement/hsk3-placement.ts` (subset ~20–30 items from `src/lib/mock-exam/hsk3-template.ts` / existing mock)
- Create: `src/app/(app)/placement/page.tsx` (reuse MockExamSession patterns with placement template id)
- Modify: `src/middleware.ts` matcher if needed
- Modify: `src/app/(app)/dashboard/page.tsx` or `DashboardView` — redirect to `/onboarding` when `target_exam_date` null and `journey_started_at` null

- [ ] **Step 1: API**

`POST /api/onboarding` body `{ examDate: string | null, unsure: boolean }` → updates `learner_profiles.target_exam_date` / `journey_horizon_weeks` → returns `{ next: "/placement" }`.

- [ ] **Step 2: Pages**

Onboarding: date input + “I’m not sure” (sets 12-week horizon). CTA → Placement.  
Placement: short paper; on submit write mock/placement attempt and `POST /api/coach/run` with trigger `mock_exam_completed` (or new `placement_completed` added to `CoachTrigger` union + DB check if enum).

If DB trigger enum is closed, reuse `mock_exam_completed` with `template_id: 'hsk3-placement'`.

- [ ] **Step 3: Commit**

```bash
git add src/app/(app)/onboarding src/app/(app)/placement src/app/api/onboarding src/data/placement src/lib/coach/types.ts
git commit -m "feat: onboarding exam date and in-app placement"
```

---

### Task 8: Dashboard slim strip + journey outline page

**Files:**
- Create: `src/components/dashboard/JourneyStrip.tsx`
- Create: `src/components/dashboard/JourneyOutlineView.tsx`
- Create: `src/app/(app)/dashboard/journey/page.tsx`
- Create: `src/app/api/coach/journey/route.ts` (GET outline + stage calendar)
- Modify: `src/lib/coach/fetch-coach.ts` — include `{ currentStage, daysToExam, weekIndex }` for strip
- Modify: `src/components/dashboard/DashboardView.tsx` — render `JourneyStrip` above `ThisWeekZone`
- Modify: `src/components/dashboard/ThisWeekZone.tsx` — link “Full journey”; show Pro CTA when `shouldShowWeek1ProCta`; when `executionLocked` show upgrade / wait copy

- [ ] **Step 1: JourneyStrip UI**

```tsx
// JourneyStrip.tsx — slim bar
export function JourneyStrip(props: {
  stage: string;
  daysToExam: number | null;
  weekIndex: number;
  stages: Array<"diagnose" | "foundation" | "skills" | "sprint">;
}) {
  return (
    <div className="mb-4 rounded-xl border border-mist bg-white px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-muted">
        Journey · {props.stage}
      </p>
      <div className="mt-2 flex items-center gap-2 text-sm text-ink">
        {/* filled dots for stages through current */}
        <span className="ml-auto text-ink-muted">
          {props.daysToExam != null ? `${props.daysToExam} days to exam` : "Set exam date"}
        </span>
      </div>
      <a href="/dashboard/journey" className="text-link mt-2 inline-block text-xs">
        Full journey outline
      </a>
    </div>
  );
}
```

- [ ] **Step 2: Outline page** lists all weeks: theme visible; status badge; locked weeks show theme only (no task list).

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/ src/app/(app)/dashboard/journey src/app/api/coach/journey src/lib/coach/fetch-coach.ts
git commit -m "feat(dashboard): slim journey strip and outline page"
```

---

### Task 9: Wire MasteryGate into practice session end

**Files:**
- Create: `src/components/practice/MasteryGateResult.tsx`
- Modify: `src/components/practice/PracticeSession.tsx`
- Modify: `src/app/api/coach/plan/tasks/[id]/route.ts`

- [ ] **Step 1: Session tracking**

In plan sessions, count `correct`, `answered`, `hintAssistedCorrect` (increment when answer submitted with hint flag — if hint UI absent, pass 0).

When `attempted >= target`, **do not** immediately PATCH `status:done`. Show `MasteryGateResult`:
- Not yet → Practice again (reset attempted or continue; keep `mastery_status: not_yet`)
- Passed → PATCH `{ status:'done', mastery_status:'passed', mastery_score }` then Continue week
- Optional Challenge button → only after passed

- [ ] **Step 2: API guard**

Reject `status: 'done'` unless `mastery_status` is `passed` or `challenged`, or `task_type === 'rest'`.

- [ ] **Step 3: After week’s required tasks passed**, call clear/unlock helper (API `POST /api/coach/journey/advance` or inline from last task PATCH).

- [ ] **Step 4: Commit**

```bash
git add src/components/practice/ src/app/api/coach/plan/tasks/
git commit -m "feat: MasteryGate on plan-task session end"
```

---

### Task 10: Naming / brand copy pass

**Files:**
- Modify: `src/app/layout.tsx` metadata title → `HSK Prep — AI Coach for HSK Level 3`
- Modify: marketing pages that lead with “HSK 3.0” as product scope (`src/app/(marketing)/**`, `UpgradeModal.tsx`) — Level 3 first; 3.0 only footer/FAQ
- Keep: `BrandLogo` title default `HSK Prep` / Mandarin Prep where needed
- Modify: `src/components/app/AppHeader.tsx` already `HSK Prep`

- [ ] **Step 1: Grep and fix**

```bash
rg -n "HSK 3\.0|HSK Mandarin Prep Pro" src/app src/components --glob '*.tsx'
```

Replace primary headlines; leave FAQ/footer alignment mentions.

- [ ] **Step 2: Commit**

```bash
git add src/app src/components
git commit -m "copy: HSK Prep Level 3 Coach naming pass"
```

---

### Task 11: E2E smoke

**Files:**
- Create: `e2e/authenticated/journey-outline.spec.ts`
- Create: `e2e/free/week1-pro-gate.spec.ts`

- [ ] **Step 1: Authenticated** — after seed/journey, Dashboard shows “Journey” strip; `/dashboard/journey` shows Week 1 available + Week 2 locked theme.

- [ ] **Step 2: Free** — Week 1 tasks visible beyond 3; completing week shows Pro CTA; cannot open Week 2 task execution.

- [ ] **Step 3: Run**

```bash
npx vitest run tests/lib/coach/journey/
npm run test:e2e -- e2e/authenticated/journey-outline.spec.ts e2e/free/week1-pro-gate.spec.ts
```

- [ ] **Step 4: Commit**

```bash
git add e2e/
git commit -m "test(e2e): journey outline and Free week-2 gate"
```

---

## Spec coverage

| Spec requirement | Task(s) |
|------------------|---------|
| Brand HSK Prep + Level 3 tagline; no leading HSK 3.0 | 10 |
| Nav keep 3 + journey chrome on Dashboard | 8 (no nav change) |
| Slim journey strip | 8 |
| Visual refine current (no new system) | 8–10 (tighten copy/chrome only) |
| Elastic stage allocator | 2, 6 |
| Theme-level outline always visible | 3, 6, 8 |
| Sequential unlock after week clear | 4, 6, 9 |
| Free W1 full execution; W2+ Pro | 4, 8, 11 |
| Onboarding exam date | 7 |
| In-app placement | 7 |
| MasteryGate session-end | 5, 9 |
| Plan gen stage quotas × gaps | 3, 6 |
| DB persistence | 1, 6 |

## Placeholder scan

No TBD steps. MasteryGate hint tracking uses `0` until hint UI exists (explicit). Placement may reuse `mock_exam_completed` trigger (explicit).

## Type consistency

- `JourneyStageId`, `WeekOutlineRow`, `MasteryOutcome` defined in Task 2/5 and reused.
- `canExecuteWeek` / `nextWeekAfterClear` / `shouldShowWeek1ProCta` shared by Tasks 4, 6, 8, 9.
- Free no longer uses 3-task slice (Task 4 updates tests).

---

## Out of scope / follow-ups (not this plan)

- LLM-scored writing MasteryGate  
- Cool Coach / seal-led visual redesign  
- HSK Level 4 track  
- Generating full task lists for all future weeks at onboarding  
