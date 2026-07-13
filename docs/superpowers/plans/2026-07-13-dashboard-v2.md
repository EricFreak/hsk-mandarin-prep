# Dashboard v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the logged-in Dashboard into an action-first single-column hub (This week → Progress glance → Latest mock), plus Progress and Past plans pages, per `docs/superpowers/specs/2026-07-13-dashboard-v2-design.md`.

**Architecture:** Keep `/api/coach/dashboard` as the coach source of truth; extend payload with `previousReport` (raw, for deltas before freemium) and add thin list endpoints/pages for progress history and past plans. Split `CoachPanel` into zone components; slim `DashboardView` so mock history list and heavy weakness UI leave the hub. Monetization narrative A: Free keeps evidence on the one visible gap; paywall on locked tasks / full Progress.

**Tech Stack:** Next.js App Router, React client components, SWR, Supabase, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-07-13-dashboard-v2-design.md`

---

## File map

| File | Responsibility |
|------|----------------|
| `src/lib/coach/progress-glance.ts` | Pure helpers: readiness delta + skill direction chips from two reports |
| `tests/lib/coach/progress-glance.test.ts` | Unit tests for glance helpers |
| `src/lib/coach/fetch-coach.ts` | Extend dashboard payload with `previousReport`; fetch helpers for reports list + plans list |
| `src/app/api/coach/dashboard/route.ts` | Unchanged contract shape except richer JSON from fetch |
| `src/app/api/coach/reports/route.ts` | GET recent reports for Progress page (freemium-aware) |
| `src/app/api/coach/plans/route.ts` | GET study plans (active + superseded) for Past plans |
| `src/components/dashboard/ThisWeekZone.tsx` | Zone 1: focus, tasks, Start next, Past plans link, Free lock CTA |
| `src/components/dashboard/ProgressGlance.tsx` | Zone 2: readiness Δ + skill chips + Full progress link |
| `src/components/dashboard/LatestMockCard.tsx` | Zone 3: latest attempt + All attempts |
| `src/components/dashboard/CoachPanel.tsx` | Thin orchestrator or remove in favor of zones inside DashboardView |
| `src/components/dashboard/DashboardView.tsx` | Single-column stack; drop inline history table & hub weakness wall |
| `src/app/(app)/dashboard/progress/page.tsx` | Full progress UI |
| `src/app/(app)/dashboard/plans/page.tsx` | Past plans read-only list |
| `src/components/dashboard/ProgressView.tsx` | Client progress charts/lists |
| `src/components/dashboard/PastPlansView.tsx` | Client past plans list |
| `e2e/authenticated/dashboard.spec.ts` | Assert new zone labels / links; drop obsolete section asserts |

---

### Task 1: Progress glance pure helpers (TDD)

**Files:**
- Create: `src/lib/coach/progress-glance.ts`
- Test: `tests/lib/coach/progress-glance.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
import { describe, expect, it } from "vitest";
import {
  readinessDelta,
  skillDirectionChips,
  type GlanceReport,
} from "@/lib/coach/progress-glance";

const base = (over: Partial<GlanceReport> & Pick<GlanceReport, "id">): GlanceReport => ({
  readiness_score: 60,
  gaps: [],
  strengths: [],
  ...over,
});

describe("readinessDelta", () => {
  it("returns null when previous missing", () => {
    expect(readinessDelta(base({ id: "a", readiness_score: 70 }), null)).toBeNull();
  });
  it("returns current - previous", () => {
    expect(
      readinessDelta(
        base({ id: "a", readiness_score: 70 }),
        base({ id: "b", readiness_score: 62 }),
      ),
    ).toBe(8);
  });
});

describe("skillDirectionChips", () => {
  it("marks gap skill as down vs previous strength", () => {
    const chips = skillDirectionChips(
      base({
        id: "a",
        gaps: [{ skill: "listening", severity: "high", evidence: "x" }],
        strengths: [{ skill: "reading", evidence: "y" }],
      }),
      base({
        id: "b",
        gaps: [{ skill: "reading", severity: "medium", evidence: "z" }],
        strengths: [{ skill: "listening", evidence: "w" }],
      }),
      4,
    );
    expect(chips.find((c) => c.skill === "listening")?.direction).toBe("down");
    expect(chips.find((c) => c.skill === "reading")?.direction).toBe("up");
  });

  it("limits chip count", () => {
    const chips = skillDirectionChips(
      base({
        id: "a",
        gaps: [
          { skill: "listening", severity: "high", evidence: "a" },
          { skill: "reading", severity: "high", evidence: "b" },
          { skill: "writing", severity: "medium", evidence: "c" },
          { skill: "grammar", severity: "low", evidence: "d" },
        ],
        strengths: [],
      }),
      null,
      3,
    );
    expect(chips).toHaveLength(3);
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
cd /Users/eric/cursor_projects/hsk-mandarin-prep/.worktrees/mvp-implementation
npx vitest run tests/lib/coach/progress-glance.test.ts
```

- [ ] **Step 3: Implement helpers**

```ts
// src/lib/coach/progress-glance.ts
import type { CoachGap, CoachStrength } from "./types";

export type GlanceReport = {
  id: string;
  readiness_score: number | null;
  gaps: CoachGap[];
  strengths: CoachStrength[];
};

export type SkillDirection = "up" | "down" | "flat";

export type SkillChip = {
  skill: string;
  direction: SkillDirection;
};

export function readinessDelta(
  current: GlanceReport | null,
  previous: GlanceReport | null,
): number | null {
  if (!current || current.readiness_score == null) return null;
  if (!previous || previous.readiness_score == null) return null;
  return current.readiness_score - previous.readiness_score;
}

function role(report: GlanceReport, skill: string): "gap" | "strength" | "none" {
  if (report.gaps.some((g) => g.skill === skill)) return "gap";
  if (report.strengths.some((s) => s.skill === skill)) return "strength";
  return "none";
}

export function skillDirectionChips(
  current: GlanceReport | null,
  previous: GlanceReport | null,
  limit: number,
): SkillChip[] {
  if (!current) return [];
  const skills: string[] = [];
  for (const g of current.gaps) {
    if (!skills.includes(g.skill)) skills.push(g.skill);
  }
  for (const s of current.strengths) {
    if (!skills.includes(s.skill)) skills.push(s.skill);
  }
  return skills.slice(0, limit).map((skill) => {
    if (!previous) return { skill, direction: "flat" as const };
    const cur = role(current, skill);
    const prev = role(previous, skill);
    let direction: SkillDirection = "flat";
    if (cur === "strength" && prev === "gap") direction = "up";
    else if (cur === "gap" && prev === "strength") direction = "down";
    else if (cur === "gap" && prev === "none") direction = "down";
    else if (cur === "strength" && prev === "none") direction = "up";
    return { skill, direction };
  });
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npx vitest run tests/lib/coach/progress-glance.test.ts
```

- [ ] **Step 5: Commit** (only if user asked; otherwise skip until batch commit)

---

### Task 2: Extend coach fetch + APIs

**Files:**
- Modify: `src/lib/coach/fetch-coach.ts`
- Create: `src/app/api/coach/reports/route.ts`
- Create: `src/app/api/coach/plans/route.ts`

- [ ] **Step 1: Extend `CoachDashboardPayload`**

Add:

```ts
previousReport: CoachReportRow | null; // freemium-applied same as report
```

In `fetchCoachDashboard`, after loading latest report, if `reportRow.previous_report_id` or second-latest by `created_at`, load previous, map + `applyFreemiumReport`. Prefer: `.order("created_at").limit(2)` and use `[0]` current `[1]` previous.

- [ ] **Step 2: Add `fetchCoachReports(supabase, userId, plan, limit=12)`**

Return `{ plan, reports: CoachReportRow[] }` with freemium applied per report.

- [ ] **Step 3: Add `fetchCoachPlans(supabase, userId)`**

Return plans ordered by `created_at` desc (all statuses), plus task counts per plan (`done` / `total`) via grouped query or N+1 acceptable for small N.

- [ ] **Step 4: Wire GET routes**

`/api/coach/reports` and `/api/coach/plans` — same auth pattern as `/api/coach/dashboard` (copy from that route).

- [ ] **Step 5: Smoke with unit-level import or existing vitest if any route tests; otherwise manual via app later**

---

### Task 3: Zone components + Dashboard reshape

**Files:**
- Create: `ThisWeekZone.tsx`, `ProgressGlance.tsx`, `LatestMockCard.tsx`
- Modify: `DashboardView.tsx`, `CoachPanel.tsx` (or delete usage)

- [ ] **Step 1: `ThisWeekZone`** — consume `/api/coach/dashboard` (or props from parent single SWR). Render:
  - Empty / pending / ready states (move from CoachPanel)
  - Focus line from `studyPlan.focus_skills`
  - Task list + Start next (`todayTask`)
  - `Past plans →` → `/dashboard/plans`
  - Free: `hiddenTaskCount` + UpgradeCTA titled around **full week plan** (narrative A); keep one-gap evidence in a compact “Top gap” line under focus if desired — **do not** paste full summary markdown as hero
  - Tutoring block: move below Zone 3 or footer (non-hero)

- [ ] **Step 2: `ProgressGlance`** — readiness, delta via helpers, chips (limit 4 Pro / 1 Free by `plan`), link `/dashboard/progress`

- [ ] **Step 3: `LatestMockCard`** — use `DashboardPayload.exam` + links Review / All attempts; **no** attempts list

- [ ] **Step 4: `DashboardView` stack order:**
  1. Header (title + plan badge compact)
  2. ThisWeekZone
  3. ProgressGlance
  4. LatestMockCard
  5. Optional compact practice stats row (keep last-7 / mistakes link — secondary)
  6. Remove: Mock exam history list, Weakness summary wall (Progress page owns coach trends; practice weakness can live on Progress or Mistakes — **remove from hub** per spec)

- [ ] **Step 5: Update e2e `dashboard.spec.ts`**

```ts
await expect(page.getByText(/this week/i)).toBeVisible();
await expect(page.getByText(/progress glance|readiness|full progress/i)).toBeVisible();
await expect(page.getByText(/latest mock/i)).toBeVisible();
await expect(page.getByRole("link", { name: /all attempts/i })).toBeVisible();
// Do NOT require mock exam history heading or weakness summary on hub
```

Adjust DASH-008 to use links that still exist (Start practice may move; prefer This week CTA or footer).

---

### Task 4: Progress page

**Files:**
- Create: `src/app/(app)/dashboard/progress/page.tsx`
- Create: `src/components/dashboard/ProgressView.tsx`

- [ ] **Step 1: Page shell** with auth layout same as dashboard

- [ ] **Step 2: `ProgressView`** SWR `/api/coach/reports`
  - List readiness over time (table or simple sparkline with CSS bars — no new chart lib unless already in package.json)
  - Per report: date, readiness, top gaps/strengths
  - Free: truncated reports + UpgradeCTA for full Progress
  - Empty CTA → mock exam

---

### Task 5: Past plans page

**Files:**
- Create: `src/app/(app)/dashboard/plans/page.tsx`
- Create: `src/components/dashboard/PastPlansView.tsx`

- [ ] **Step 1: List plans** with status pill, focus skills, task done/total, created date

- [ ] **Step 2: Expand row** shows task titles + status (read-only; no reactivate)

---

### Task 6: Verify + ship

- [ ] **Step 1:** `npx vitest run tests/lib/coach/`
- [ ] **Step 2:** `npx tsc --noEmit` (or project lint script)
- [ ] **Step 3:** Local/manual Dashboard visual check
- [ ] **Step 4:** Commit when user requests; deploy/push when user requests

---

## Spec coverage self-review

| Spec item | Task |
|-----------|------|
| Zone 1 This week + Past plans link | 3 |
| Zone 2 glance + Full progress | 3–4 |
| Zone 3 latest + All attempts | 3 |
| No hub history table | 3 |
| Progress page multi-dim | 4 |
| Past plans archive | 5 |
| Freemium narrative A | 3–4 |
| Empty/pending states | 3 |
| Skill chip algorithm | 1 |

## Placeholder scan

No TBD steps; chip algorithm fully specified in Task 1.

## Execution note

Founder: ship first, tune from live visuals. Prefer **inline execution** in this session unless founder asks for subagent-per-task.
