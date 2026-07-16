# 三服务产品结构 + LP 定价 · 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把已批准的三服务（Fixed-cycle Coach / Exam Custom / Emergency Sprint）+ Learning Point 买断制定价（spec: `docs/superpowers/specs/2026-07-16-three-service-lp-pricing-design.md`）落地为可运行代码，取代现有 monthly/yearly Pro 订阅与 Week-1 freemium 墙。

**Architecture:** 新增纯函数域模块 `src/lib/lp/`（权重/报价/目录/可完成性/Sprint/访问权/抵扣），一张 `lp_orders` 订单表（quoted→paid→superseded），Stripe 一次性支付（mode=payment）替代订阅，执行期 gate 从「plan free/pro + Week-1 墙」改为「有效订单 + 样例日（Week1 Day0）」。旧 `profiles.plan='pro'` 用户 grandfathered 永久视为已购。

**Tech Stack:** Next.js 14 App Router · TypeScript · Supabase（RLS + admin client）· Stripe `^22`（一次性支付）· Zod v4 · Vitest v4 · Playwright

## Global Constraints

（每个任务隐含遵守；来自 spec 与既有锁项）

- **单一费率 ρ 全场一致**：`RHO_CENTS_PER_LP = 1`（$0.01/LP）。禁止按服务/紧急程度调 ρ，禁止加急溢价。
- **买断制**：扣费时点 = 购买那一刻。执行中做题**绝不**逐题扣费/计量。
- **免费可信度链完整**：诊断（不计免费模考额度，既有 `skipFreemiumLimit` 逻辑不动）→ **完整** AI 报告（取消截断）→ 大纲 + 一次性报价 → 样例日（Week1 Day0 真实可做）→ 锁定预览。
- **Sprint**：D ≤ 6（含今天考）；每账号 lifetime 一次免费（`free_sprint_used_at`，不因 replan/改期重置）；再次按加权工作量报价。
- **Exam Custom 校验**：超载时要求减量或改期，**禁止暗改**用户配置。
- **不变项**：Dashboard 为家；Auth 不毁付费；Custom replan 整单替换；无恐吓文案；工具区（standalone practice / mock）免费额度本迭代**不动**（`FREE_DAILY_PRACTICE_LIMIT`、`FREE_MOCK_EXAM_LIMIT` 保留）。
- **本计划钉定的数值**（spec §8 开放项，全部集中在 `src/lib/lp/` 常量，单点可改）：
  - ρ = 1 美分/LP；权重表见 Task 1。
  - Coach 包 = 每周 325 LP → 4w 1300 LP $13.00 / 8w 2600 LP $26.00 / 12w 3900 LP $39.00。
  - Replan：未消耗 LP（= 订单 LP 总量 − 已完成任务反算 LP）转入新包抵价，不退现金。
  - 可完成性：估算总分钟 ≤ 剩余天数 × 每日分钟（`learner_profiles.minutes_per_day`，默认 45）。
  - 旧 Pro：`plan='pro'` grandfathered；订阅 checkout 路径删除，webhook 保留 `subscription.deleted → free`。
- 提交信息用 conventional commits（`feat:` / `test:` / `refactor:`）。测试命令：`npm test`（vitest）、`npm run test:e2e`（playwright）、迁移校验 `npm run verify`。
- 路由鉴权样板：所有新 API route 按 `src/app/api/onboarding/route.ts` 的既有模式取 supabase server client 与 `user`（如导入路径与本文示意不同，以该文件为准）。

## 文件结构总览

```
src/lib/lp/
  pricing.ts        # LpComposition, LP_WEIGHTS, ρ, computeLpTotal, computeQuote   (Task 1)
  catalog.ts        # COACH_PACKS 4/8/12 周目录, getCoachPack                      (Task 2)
  feasibility.ts    # TASK_MINUTES, estimateMinutes, checkFeasibility              (Task 3)
  sprint.ts         # daysUntilExam, isSprintEligible, canUseFreeSprint, 构成      (Task 4)
  access.ts         # AccessSource, resolveAccessSource, canExecuteTask            (Task 5)
  replan-credit.ts  # compositionFromDoneTasks, computeUnspentLp, applyCredit      (Task 6)
  access-server.ts  # fetchAccess(supabase, userId)                                (Task 8)
  fulfill-order.ts  # fulfillLpOrder(admin, {orderId,...})                         (Task 8)
supabase/migrations/010_lp_pricing.sql                                             (Task 7)
src/app/api/lp/quote/route.ts                                                      (Task 9)
src/app/api/checkout/route.ts（改造） + stripe-provider（新增一次性支付）           (Task 10)
src/app/api/stripe/webhook/route.ts（订单履约分支）                                (Task 10)
src/app/api/sprint/start/route.ts + persist-journey sprint 分支                    (Task 11)
src/lib/coach/journey/week-unlock.ts（重写）、persist-journey.ts、freemium.ts      (Task 12)
src/components/onboarding/OnboardingForm.tsx + /api/onboarding（服务选择）         (Task 13)
src/app/(app)/plan/quote/page.tsx + 报价购买组件                                   (Task 14)
Dashboard 锁定任务卡 + 预览卡                                                      (Task 15)
src/components/marketing/PricingPlans.tsx（改造）                                  (Task 16)
e2e 更新 + 新增 funnel spec                                                        (Task 17)
```

Phase 1（Task 1–6）纯域逻辑，只有 vitest；Phase 2（Task 7–11）DB + API；Phase 3（Task 12–17）gate 与 UI。每个 Phase 结束时软件可独立构建、测试通过。

---

## Phase 1 · LP 域核心（纯函数）

### Task 1: LP 权重与报价

**Files:**
- Create: `src/lib/lp/pricing.ts`
- Test: `tests/lib/lp/pricing.test.ts`

**Interfaces:**
- Produces: `LpComposition`（六键构成）、`LP_WEIGHTS`、`RHO_CENTS_PER_LP`、`EMPTY_COMPOSITION`、`computeLpTotal(c): number`、`computeQuote(c): LpQuote`、`type LpQuote = { lpTotal: number; priceCents: number }`。后续所有任务的货币计算只允许经由 `computeQuote`。

- [ ] **Step 1: 写失败测试**

```ts
// tests/lib/lp/pricing.test.ts
import { describe, it, expect } from "vitest";
import {
  LP_WEIGHTS,
  RHO_CENTS_PER_LP,
  EMPTY_COMPOSITION,
  computeLpTotal,
  computeQuote,
} from "@/lib/lp/pricing";

describe("LP pricing", () => {
  it("weights match the approved spec values", () => {
    expect(LP_WEIGHTS).toEqual({
      vocabulary: 1,
      grammar: 1,
      listening: 2,
      reading: 3,
      writingReview: 100,
      mockSection: 50,
    });
    expect(RHO_CENTS_PER_LP).toBe(1);
  });

  it("computes weighted LP total", () => {
    expect(
      computeLpTotal({
        ...EMPTY_COMPOSITION,
        vocabulary: 10,   // 10
        listening: 5,     // 10
        reading: 2,       // 6
        writingReview: 1, // 100
      })
    ).toBe(126);
  });

  it("empty composition is 0 LP / $0", () => {
    expect(computeQuote(EMPTY_COMPOSITION)).toEqual({ lpTotal: 0, priceCents: 0 });
  });

  it("clamps negative and fractional counts", () => {
    expect(
      computeLpTotal({ ...EMPTY_COMPOSITION, vocabulary: -5, listening: 2.9 })
    ).toBe(4); // -5 → 0, 2.9 → 2 → 2×2 LP
  });

  it("quote price = lpTotal × ρ", () => {
    const q = computeQuote({ ...EMPTY_COMPOSITION, mockSection: 3 });
    expect(q).toEqual({ lpTotal: 150, priceCents: 150 * RHO_CENTS_PER_LP });
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run tests/lib/lp/pricing.test.ts`
Expected: FAIL（模块不存在）

- [ ] **Step 3: 最小实现**

```ts
// src/lib/lp/pricing.ts
/**
 * Learning Point (LP) pricing core.
 * Single global rate — never vary by service type or urgency (spec hard rule).
 * All money math in this codebase must go through computeQuote.
 */
export type LpComposition = {
  vocabulary: number; // 题
  grammar: number; // 题
  listening: number; // 题
  reading: number; // 组
  writingReview: number; // 写作 + AI 精批 次
  mockSection: number; // 模考段 + 报告 次
};

export const LP_WEIGHTS: Record<keyof LpComposition, number> = {
  vocabulary: 1,
  grammar: 1,
  listening: 2,
  reading: 3,
  writingReview: 100,
  mockSection: 50,
};

export const RHO_CENTS_PER_LP = 1;

export const EMPTY_COMPOSITION: LpComposition = {
  vocabulary: 0,
  grammar: 0,
  listening: 0,
  reading: 0,
  writingReview: 0,
  mockSection: 0,
};

export type LpQuote = { lpTotal: number; priceCents: number };

export function computeLpTotal(composition: LpComposition): number {
  return (Object.keys(LP_WEIGHTS) as (keyof LpComposition)[]).reduce(
    (sum, key) =>
      sum + Math.max(0, Math.floor(composition[key] ?? 0)) * LP_WEIGHTS[key],
    0
  );
}

export function computeQuote(composition: LpComposition): LpQuote {
  const lpTotal = computeLpTotal(composition);
  return { lpTotal, priceCents: lpTotal * RHO_CENTS_PER_LP };
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `npx vitest run tests/lib/lp/pricing.test.ts`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/lib/lp/pricing.ts tests/lib/lp/pricing.test.ts
git commit -m "feat(lp): LP weights, single-rate quote core"
```

---

### Task 2: Coach 包目录

**Files:**
- Create: `src/lib/lp/catalog.ts`
- Test: `tests/lib/lp/catalog.test.ts`

**Interfaces:**
- Consumes: `RHO_CENTS_PER_LP`（Task 1）
- Produces: `type CoachPackId = "coach_4w" | "coach_8w" | "coach_12w"`、`type CoachPack = { id: CoachPackId; weeks: 4|8|12; lpBudget: number; priceCents: number }`、`COACH_PACKS: CoachPack[]`、`getCoachPack(id: string): CoachPack | null`、`type ServiceType = CoachPackId | "exam_custom" | "sprint"`（订单表/报价 API 共用）。

- [ ] **Step 1: 写失败测试**

```ts
// tests/lib/lp/catalog.test.ts
import { describe, it, expect } from "vitest";
import { COACH_PACKS, getCoachPack } from "@/lib/lp/catalog";
import { RHO_CENTS_PER_LP } from "@/lib/lp/pricing";

describe("coach pack catalog", () => {
  it("offers exactly 4/8/12 week packs at pinned prices", () => {
    expect(COACH_PACKS.map((p) => [p.id, p.weeks, p.lpBudget, p.priceCents])).toEqual([
      ["coach_4w", 4, 1300, 1300],
      ["coach_8w", 8, 2600, 2600],
      ["coach_12w", 12, 3900, 3900],
    ]);
  });

  it("price is always lpBudget × ρ (same rate as everything else)", () => {
    for (const p of COACH_PACKS) {
      expect(p.priceCents).toBe(p.lpBudget * RHO_CENTS_PER_LP);
    }
  });

  it("getCoachPack resolves by id, null otherwise", () => {
    expect(getCoachPack("coach_8w")?.weeks).toBe(8);
    expect(getCoachPack("exam_custom")).toBeNull();
    expect(getCoachPack("nope")).toBeNull();
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `npx vitest run tests/lib/lp/catalog.test.ts` — Expected: FAIL

- [ ] **Step 3: 实现**

```ts
// src/lib/lp/catalog.ts
import { RHO_CENTS_PER_LP } from "./pricing";

export type CoachPackId = "coach_4w" | "coach_8w" | "coach_12w";
export type ServiceType = CoachPackId | "exam_custom" | "sprint";

export type CoachPack = {
  id: CoachPackId;
  weeks: 4 | 8 | 12;
  lpBudget: number;
  priceCents: number;
};

/** Pinned budget: 325 LP/week → $13 / $26 / $39 at ρ=1¢. Change here only. */
const LP_BUDGET_PER_WEEK = 325;

export const COACH_PACKS: CoachPack[] = ([4, 8, 12] as const).map((weeks) => {
  const lpBudget = LP_BUDGET_PER_WEEK * weeks;
  return {
    id: `coach_${weeks}w` as CoachPackId,
    weeks,
    lpBudget,
    priceCents: lpBudget * RHO_CENTS_PER_LP,
  };
});

export function getCoachPack(id: string): CoachPack | null {
  return COACH_PACKS.find((p) => p.id === id) ?? null;
}
```

- [ ] **Step 4: 跑测试确认通过** — `npx vitest run tests/lib/lp/catalog.test.ts` → PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/lp/catalog.ts tests/lib/lp/catalog.test.ts
git commit -m "feat(lp): fixed-cycle coach pack catalog (4/8/12w)"
```

---

### Task 3: Exam Custom 可完成性校验

**Files:**
- Create: `src/lib/lp/feasibility.ts`
- Test: `tests/lib/lp/feasibility.test.ts`

**Interfaces:**
- Consumes: `LpComposition`, `EMPTY_COMPOSITION`（Task 1）
- Produces: `TASK_MINUTES: Record<keyof LpComposition, number>`、`DEFAULT_MINUTES_PER_DAY = 45`、`estimateMinutes(c): number`、`checkFeasibility({ composition, daysUntilExam, minutesPerDay? }): FeasibilityResult`、`type FeasibilityResult = { feasible: boolean; totalMinutes: number; capacityMinutes: number; requiredMinutesPerDay: number }`。

- [ ] **Step 1: 写失败测试**

```ts
// tests/lib/lp/feasibility.test.ts
import { describe, it, expect } from "vitest";
import { EMPTY_COMPOSITION } from "@/lib/lp/pricing";
import {
  TASK_MINUTES,
  DEFAULT_MINUTES_PER_DAY,
  estimateMinutes,
  checkFeasibility,
} from "@/lib/lp/feasibility";

describe("exam-custom feasibility", () => {
  it("uses pinned per-task minute estimates", () => {
    expect(TASK_MINUTES).toEqual({
      vocabulary: 0.5,
      grammar: 0.5,
      listening: 1.5,
      reading: 3,
      writingReview: 20,
      mockSection: 30,
    });
    expect(DEFAULT_MINUTES_PER_DAY).toBe(45);
  });

  it("estimates total minutes", () => {
    expect(
      estimateMinutes({ ...EMPTY_COMPOSITION, vocabulary: 20, writingReview: 2 })
    ).toBe(50); // 10 + 40
  });

  it("passes when workload fits the window", () => {
    const r = checkFeasibility({
      composition: { ...EMPTY_COMPOSITION, vocabulary: 100, listening: 40 }, // 50+60=110min
      daysUntilExam: 7,
    });
    expect(r.feasible).toBe(true);
    expect(r.capacityMinutes).toBe(7 * 45);
    expect(r.requiredMinutesPerDay).toBe(16); // ceil(110/7)
  });

  it("fails when overloaded and reports required pace (no silent trimming)", () => {
    const r = checkFeasibility({
      composition: { ...EMPTY_COMPOSITION, writingReview: 30 }, // 600min
      daysUntilExam: 3,
      minutesPerDay: 60,
    });
    expect(r.feasible).toBe(false);
    expect(r.totalMinutes).toBe(600);
    expect(r.requiredMinutesPerDay).toBe(200);
  });
});
```

- [ ] **Step 2: 确认失败** — `npx vitest run tests/lib/lp/feasibility.test.ts` → FAIL

- [ ] **Step 3: 实现**

```ts
// src/lib/lp/feasibility.ts
import type { LpComposition } from "./pricing";

/** Internal effort model (minutes per unit); calibrate alongside LP_WEIGHTS. */
export const TASK_MINUTES: Record<keyof LpComposition, number> = {
  vocabulary: 0.5,
  grammar: 0.5,
  listening: 1.5,
  reading: 3,
  writingReview: 20,
  mockSection: 30,
};

export const DEFAULT_MINUTES_PER_DAY = 45;

export function estimateMinutes(composition: LpComposition): number {
  return (Object.keys(TASK_MINUTES) as (keyof LpComposition)[]).reduce(
    (sum, key) =>
      sum + Math.max(0, Math.floor(composition[key] ?? 0)) * TASK_MINUTES[key],
    0
  );
}

export type FeasibilityResult = {
  feasible: boolean;
  totalMinutes: number;
  capacityMinutes: number;
  requiredMinutesPerDay: number;
};

export function checkFeasibility(input: {
  composition: LpComposition;
  daysUntilExam: number;
  minutesPerDay?: number;
}): FeasibilityResult {
  const days = Math.max(1, Math.floor(input.daysUntilExam));
  const perDay = input.minutesPerDay ?? DEFAULT_MINUTES_PER_DAY;
  const totalMinutes = estimateMinutes(input.composition);
  const capacityMinutes = days * perDay;
  return {
    feasible: totalMinutes <= capacityMinutes,
    totalMinutes,
    capacityMinutes,
    requiredMinutesPerDay: Math.ceil(totalMinutes / days),
  };
}
```

- [ ] **Step 4: 确认通过** — `npx vitest run tests/lib/lp/feasibility.test.ts` → PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/lp/feasibility.ts tests/lib/lp/feasibility.test.ts
git commit -m "feat(lp): exam-custom feasibility check (no silent trimming)"
```

---

### Task 4: Sprint 资格、免费额度与构成

**Files:**
- Create: `src/lib/lp/sprint.ts`
- Test: `tests/lib/lp/sprint.test.ts`

**Interfaces:**
- Consumes: `LpComposition`, `EMPTY_COMPOSITION`（Task 1）
- Produces: `SPRINT_MAX_DAYS = 6`、`daysUntilExam(todayIso, examIso): number`（自然日差，考试当天 = 0）、`isSprintEligible(todayIso, examIso | null): boolean`（0 ≤ d ≤ 6）、`canUseFreeSprint(freeSprintUsedAt: string | null): boolean`、`sprintComposition(days: number): LpComposition`。

- [ ] **Step 1: 写失败测试**

```ts
// tests/lib/lp/sprint.test.ts
import { describe, it, expect } from "vitest";
import {
  SPRINT_MAX_DAYS,
  daysUntilExam,
  isSprintEligible,
  canUseFreeSprint,
  sprintComposition,
} from "@/lib/lp/sprint";
import { computeLpTotal } from "@/lib/lp/pricing";

describe("emergency sprint", () => {
  it("day math: exam today = 0 days", () => {
    expect(daysUntilExam("2026-07-16", "2026-07-16")).toBe(0);
    expect(daysUntilExam("2026-07-16", "2026-07-22")).toBe(6);
  });

  it("eligible only within 0..6 days, exam date required", () => {
    expect(SPRINT_MAX_DAYS).toBe(6);
    expect(isSprintEligible("2026-07-16", "2026-07-16")).toBe(true);
    expect(isSprintEligible("2026-07-16", "2026-07-22")).toBe(true);
    expect(isSprintEligible("2026-07-16", "2026-07-23")).toBe(false);
    expect(isSprintEligible("2026-07-16", "2026-07-15")).toBe(false); // 考期已过
    expect(isSprintEligible("2026-07-16", null)).toBe(false);
  });

  it("lifetime free flag", () => {
    expect(canUseFreeSprint(null)).toBe(true);
    expect(canUseFreeSprint("2026-01-01T00:00:00Z")).toBe(false);
  });

  it("composition scales daily drills, fixed writing+mock; min 1 day", () => {
    const threeDays = sprintComposition(3);
    expect(threeDays).toEqual({
      vocabulary: 60,  // 20/day
      grammar: 30,     // 10/day
      listening: 45,   // 15/day
      reading: 15,     // 5/day
      writingReview: 1,
      mockSection: 1,
    });
    expect(sprintComposition(0)).toEqual(sprintComposition(1)); // exam today → 1 day of work
    expect(computeLpTotal(threeDays)).toBe(60 + 30 + 90 + 45 + 100 + 50); // 375 LP → $3.75
  });
});
```

- [ ] **Step 2: 确认失败** — `npx vitest run tests/lib/lp/sprint.test.ts` → FAIL

- [ ] **Step 3: 实现**

```ts
// src/lib/lp/sprint.ts
import type { LpComposition } from "./pricing";
import { EMPTY_COMPOSITION } from "./pricing";

export const SPRINT_MAX_DAYS = 6;

const DAY_MS = 24 * 60 * 60 * 1000;

/** Natural-day difference on ISO dates (YYYY-MM-DD); exam today = 0. */
export function daysUntilExam(todayIso: string, examIso: string): number {
  const today = Date.parse(`${todayIso}T00:00:00Z`);
  const exam = Date.parse(`${examIso}T00:00:00Z`);
  return Math.round((exam - today) / DAY_MS);
}

export function isSprintEligible(todayIso: string, examIso: string | null): boolean {
  if (!examIso) return false;
  const d = daysUntilExam(todayIso, examIso);
  return d >= 0 && d <= SPRINT_MAX_DAYS;
}

export function canUseFreeSprint(freeSprintUsedAt: string | null): boolean {
  return freeSprintUsedAt === null;
}

const DAILY = { vocabulary: 20, grammar: 10, listening: 15, reading: 5 } as const;

export function sprintComposition(days: number): LpComposition {
  const d = Math.max(1, Math.floor(days));
  return {
    ...EMPTY_COMPOSITION,
    vocabulary: DAILY.vocabulary * d,
    grammar: DAILY.grammar * d,
    listening: DAILY.listening * d,
    reading: DAILY.reading * d,
    writingReview: 1,
    mockSection: 1,
  };
}
```

- [ ] **Step 4: 确认通过** — `npx vitest run tests/lib/lp/sprint.test.ts` → PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/lp/sprint.ts tests/lib/lp/sprint.test.ts
git commit -m "feat(lp): sprint eligibility, lifetime-free flag, workload composition"
```

---

### Task 5: 访问权解析与任务级 gate（纯函数）

**Files:**
- Create: `src/lib/lp/access.ts`
- Test: `tests/lib/lp/access.test.ts`

**Interfaces:**
- Consumes: `Plan`（`src/lib/entitlements.ts` 既有 `export type Plan = "free" | "pro"`）
- Produces: `type AccessSource = "paid_order" | "free_sprint" | "legacy_pro"`、`resolveAccessSource({ plan, activePaidOrder }): AccessSource | null`、`hasFullAccess(source): boolean`、`canExecuteTask({ access, weekIndex, dayOffset }): boolean`。Task 8 的 `fetchAccess` 与 Task 12 的 gate 重写都建立在这些之上。

- [ ] **Step 1: 写失败测试**

```ts
// tests/lib/lp/access.test.ts
import { describe, it, expect } from "vitest";
import {
  resolveAccessSource,
  hasFullAccess,
  canExecuteTask,
} from "@/lib/lp/access";

describe("access resolution", () => {
  it("paid order wins; zero-price paid order = free sprint", () => {
    expect(
      resolveAccessSource({ plan: "free", activePaidOrder: { priceCents: 1300 } })
    ).toBe("paid_order");
    expect(
      resolveAccessSource({ plan: "free", activePaidOrder: { priceCents: 0 } })
    ).toBe("free_sprint");
  });

  it("legacy pro is grandfathered", () => {
    expect(resolveAccessSource({ plan: "pro", activePaidOrder: null })).toBe("legacy_pro");
  });

  it("free without order has no access", () => {
    expect(resolveAccessSource({ plan: "free", activePaidOrder: null })).toBeNull();
    expect(hasFullAccess(null)).toBe(false);
    expect(hasFullAccess("paid_order")).toBe(true);
  });
});

describe("task-level gate (sample day)", () => {
  it("any access source executes everything", () => {
    expect(canExecuteTask({ access: "legacy_pro", weekIndex: 5, dayOffset: 3 })).toBe(true);
    expect(canExecuteTask({ access: "free_sprint", weekIndex: 1, dayOffset: 2 })).toBe(true);
  });

  it("no access → only week 1 day 0 (the free sample day)", () => {
    expect(canExecuteTask({ access: null, weekIndex: 1, dayOffset: 0 })).toBe(true);
    expect(canExecuteTask({ access: null, weekIndex: 1, dayOffset: 1 })).toBe(false);
    expect(canExecuteTask({ access: null, weekIndex: 2, dayOffset: 0 })).toBe(false);
  });
});
```

- [ ] **Step 2: 确认失败** — `npx vitest run tests/lib/lp/access.test.ts` → FAIL

- [ ] **Step 3: 实现**

```ts
// src/lib/lp/access.ts
import type { Plan } from "@/lib/entitlements";

export type AccessSource = "paid_order" | "free_sprint" | "legacy_pro";

export function resolveAccessSource(input: {
  plan: Plan;
  activePaidOrder: { priceCents: number } | null;
}): AccessSource | null {
  if (input.activePaidOrder) {
    return input.activePaidOrder.priceCents === 0 ? "free_sprint" : "paid_order";
  }
  if (input.plan === "pro") return "legacy_pro"; // grandfathered subscribers
  return null;
}

export function hasFullAccess(source: AccessSource | null): boolean {
  return source !== null;
}

/** Free users get exactly the sample day: week 1, day_offset 0. */
export function canExecuteTask(input: {
  access: AccessSource | null;
  weekIndex: number;
  dayOffset: number;
}): boolean {
  if (input.access) return true;
  return input.weekIndex === 1 && input.dayOffset === 0;
}
```

- [ ] **Step 4: 确认通过** — `npx vitest run tests/lib/lp/access.test.ts` → PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/lp/access.ts tests/lib/lp/access.test.ts
git commit -m "feat(lp): access-source resolution and sample-day task gate"
```

---

### Task 6: Replan 未消耗 LP 抵扣

**Files:**
- Create: `src/lib/lp/replan-credit.ts`
- Test: `tests/lib/lp/replan-credit.test.ts`

**Interfaces:**
- Consumes: `LpComposition`, `EMPTY_COMPOSITION`, `computeLpTotal`, `RHO_CENTS_PER_LP`, `LpQuote`（Task 1）
- Produces: `type DoneTaskRow = { task_type: string; skill: string | null; target_count: number | null; status: string }`（对应 `coach_plan_tasks` 列）、`compositionFromDoneTasks(rows): LpComposition`、`computeUnspentLp(order: { lp_total: number }, rows): number`、`applyCredit(quote: LpQuote, unspentLp: number): LpQuote`。仅内部结算用——**绝不**在执行 UI 中向用户展示逐题扣减。

- [ ] **Step 1: 写失败测试**

```ts
// tests/lib/lp/replan-credit.test.ts
import { describe, it, expect } from "vitest";
import {
  compositionFromDoneTasks,
  computeUnspentLp,
  applyCredit,
} from "@/lib/lp/replan-credit";
import { EMPTY_COMPOSITION } from "@/lib/lp/pricing";

const done = (row: Partial<Parameters<typeof compositionFromDoneTasks>[0][number]>) => ({
  task_type: "practice",
  skill: "vocabulary",
  target_count: 10,
  status: "done",
  ...row,
});

describe("replan credit", () => {
  it("maps done coach_plan_tasks rows onto LP composition", () => {
    expect(
      compositionFromDoneTasks([
        done({}),                                            // vocabulary 10
        done({ skill: "listening", target_count: 5 }),       // listening 5
        done({ task_type: "flashcards", skill: null, target_count: 20 }), // → vocabulary 20
        done({ task_type: "review_mistakes", skill: null, target_count: 8 }), // → grammar 8
        done({ task_type: "mock_section", skill: null, target_count: null }), // → mockSection 1
        done({ skill: "writing", target_count: 2 }),          // → writingReview 2
        done({ status: "pending" }),                          // ignored
        done({ task_type: "rest", skill: null }),             // ignored
      ])
    ).toEqual({
      ...EMPTY_COMPOSITION,
      vocabulary: 30,
      grammar: 8,
      listening: 5,
      writingReview: 2,
      mockSection: 1,
    });
  });

  it("unspent = order lp_total − consumed, floored at 0", () => {
    const rows = [done({ skill: "writing", target_count: 1 })]; // 100 LP consumed
    expect(computeUnspentLp({ lp_total: 400 }, rows)).toBe(300);
    expect(computeUnspentLp({ lp_total: 50 }, rows)).toBe(0);
  });

  it("credit reduces price, never below zero; lpTotal of new plan unchanged", () => {
    expect(applyCredit({ lpTotal: 500, priceCents: 500 }, 300)).toEqual({
      lpTotal: 500,
      priceCents: 200,
    });
    expect(applyCredit({ lpTotal: 200, priceCents: 200 }, 999)).toEqual({
      lpTotal: 200,
      priceCents: 0,
    });
  });
});
```

- [ ] **Step 2: 确认失败** — `npx vitest run tests/lib/lp/replan-credit.test.ts` → FAIL

- [ ] **Step 3: 实现**

```ts
// src/lib/lp/replan-credit.ts
import type { LpComposition, LpQuote } from "./pricing";
import { EMPTY_COMPOSITION, RHO_CENTS_PER_LP, computeLpTotal } from "./pricing";

export type DoneTaskRow = {
  task_type: string;
  skill: string | null;
  target_count: number | null;
  status: string;
};

const SKILL_TO_KEY: Record<string, keyof LpComposition> = {
  vocabulary: "vocabulary",
  grammar: "grammar",
  listening: "listening",
  reading: "reading",
  writing: "writingReview",
};

/** Internal settlement only — never surfaced as per-item metering in the UI. */
export function compositionFromDoneTasks(rows: DoneTaskRow[]): LpComposition {
  const c: LpComposition = { ...EMPTY_COMPOSITION };
  for (const row of rows) {
    if (row.status !== "done") continue;
    const count = Math.max(0, row.target_count ?? 1);
    if (row.task_type === "mock_section") {
      c.mockSection += 1;
    } else if (row.task_type === "flashcards") {
      c.vocabulary += count;
    } else if (row.task_type === "review_mistakes") {
      c.grammar += count;
    } else if (row.task_type === "practice" && row.skill && SKILL_TO_KEY[row.skill]) {
      c[SKILL_TO_KEY[row.skill]] += count;
    }
    // "rest" and unknown types carry no LP
  }
  return c;
}

export function computeUnspentLp(
  order: { lp_total: number },
  doneTasks: DoneTaskRow[]
): number {
  const consumed = computeLpTotal(compositionFromDoneTasks(doneTasks));
  return Math.max(0, order.lp_total - consumed);
}

/** Credit transfers into the new package price; no cash refunds. */
export function applyCredit(quote: LpQuote, unspentLp: number): LpQuote {
  const billableLp = Math.max(0, quote.lpTotal - unspentLp);
  return { lpTotal: quote.lpTotal, priceCents: billableLp * RHO_CENTS_PER_LP };
}
```

- [ ] **Step 4: 确认通过** — `npx vitest run tests/lib/lp/replan-credit.test.ts` → PASS，然后全量 `npm test` 确认无回归

- [ ] **Step 5: Commit**

```bash
git add src/lib/lp/replan-credit.ts tests/lib/lp/replan-credit.test.ts
git commit -m "feat(lp): replan unspent-LP credit (transfer, no cash refund)"
```

---

## Phase 2 · 数据库与 API

### Task 7: Migration 010（lp_orders + learner_profiles 新列）

**Files:**
- Create: `supabase/migrations/010_lp_pricing.sql`

**Interfaces:**
- Produces: 表 `lp_orders`（后续所有订单读写）；`learner_profiles.service_intent`、`learner_profiles.free_sprint_used_at`。
- 前置知识：`profiles` / `learner_profiles` 定义见 `001_init.sql` / `006_coach.sql`；RLS 风格参照 `003_rls_policies.sql`。

- [ ] **Step 1: 写迁移**

```sql
-- supabase/migrations/010_lp_pricing.sql
-- Three-service LP pricing: orders table + service intent + sprint free flag.

alter table learner_profiles
  add column if not exists service_intent text
    check (service_intent in ('coach', 'exam_custom', 'sprint')),
  add column if not exists free_sprint_used_at timestamptz;

create table if not exists lp_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  service_type text not null
    check (service_type in ('coach_4w', 'coach_8w', 'coach_12w', 'exam_custom', 'sprint')),
  composition jsonb not null default '{}',
  lp_total integer not null check (lp_total >= 0),
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'usd',
  status text not null default 'quoted'
    check (status in ('quoted', 'paid', 'superseded', 'expired')),
  payment_provider text,
  payment_ref text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_lp_orders_user on lp_orders(user_id);
-- Exactly one active paid package per user; older ones flip to 'superseded'.
create unique index if not exists idx_lp_orders_one_paid_per_user
  on lp_orders(user_id) where status = 'paid';

alter table lp_orders enable row level security;

create policy "lp_orders_select_own" on lp_orders
  for select using (auth.uid() = user_id);

-- Users may create quotes for themselves; paid/superseded transitions are
-- service-role only (webhook / server), so no update policy for users.
create policy "lp_orders_insert_own_quote" on lp_orders
  for insert with check (auth.uid() = user_id and status = 'quoted');
```

- [ ] **Step 2: 应用并校验**

按项目现行迁移流程应用（Supabase CLI 或 dashboard），然后：

Run: `npm run verify`
Expected: 迁移校验脚本通过，`lp_orders` 存在

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/010_lp_pricing.sql
git commit -m "feat(db): lp_orders table, service_intent, free_sprint_used_at (migration 010)"
```

---

### Task 8: 服务器侧访问权读取 + 订单履约

**Files:**
- Create: `src/lib/lp/access-server.ts`
- Create: `src/lib/lp/fulfill-order.ts`
- Test: `tests/lib/lp/fulfill-order.test.ts`（用轻量 supabase stub，模式参照 `tests/lib/coach/journey/persist-journey.test.ts` 现有 mock 手法）

**Interfaces:**
- Consumes: `resolveAccessSource`（Task 5）、`getCoachPack`（Task 2）、`lp_orders` 表（Task 7）
- Produces:
  - `fetchAccess(supabase: SupabaseClient, userId: string): Promise<AccessSource | null>`
  - `fulfillLpOrder(admin: SupabaseClient, input: { orderId: string; paymentProvider?: string; paymentRef?: string }): Promise<{ ok: boolean }>` — 幂等；置 paid、supersede 旧单；coach 包同步 `journey_horizon_weeks`。

- [ ] **Step 1: 写失败测试（履约逻辑）**

```ts
// tests/lib/lp/fulfill-order.test.ts
import { describe, it, expect, vi } from "vitest";
import { fulfillLpOrder } from "@/lib/lp/fulfill-order";

type Row = Record<string, unknown>;

/** Minimal chainable supabase stub recording updates. */
function makeAdminStub(order: Row | null) {
  const updates: { table: string; values: Row; filters: Row }[] = [];
  const client = {
    from(table: string) {
      const filters: Row = {};
      const builder: any = {
        select: () => builder,
        update(values: Row) {
          builder._update = values;
          return builder;
        },
        eq(col: string, val: unknown) {
          filters[col] = val;
          if (builder._update) {
            // terminal for update chains in our usage
            updates.push({ table, values: builder._update, filters: { ...filters } });
          }
          return builder;
        },
        maybeSingle: async () => ({ data: order, error: null }),
        then: (resolve: (v: unknown) => void) => resolve({ data: null, error: null }),
      };
      return builder;
    },
  };
  return { client: client as any, updates };
}

describe("fulfillLpOrder", () => {
  it("marks quoted order paid and supersedes previous paid orders", async () => {
    const { client, updates } = makeAdminStub({
      id: "o1", user_id: "u1", service_type: "exam_custom", status: "quoted",
    });
    const result = await fulfillLpOrder(client, { orderId: "o1", paymentRef: "cs_123" });
    expect(result.ok).toBe(true);
    const paid = updates.find((u) => u.values.status === "paid");
    expect(paid?.filters.id).toBe("o1");
    const superseded = updates.find((u) => u.values.status === "superseded");
    expect(superseded?.filters.user_id).toBe("u1");
  });

  it("is idempotent for already-paid orders", async () => {
    const { client, updates } = makeAdminStub({
      id: "o1", user_id: "u1", service_type: "sprint", status: "paid",
    });
    expect((await fulfillLpOrder(client, { orderId: "o1" })).ok).toBe(true);
    expect(updates).toHaveLength(0);
  });

  it("syncs journey horizon for coach packs", async () => {
    const { client, updates } = makeAdminStub({
      id: "o2", user_id: "u1", service_type: "coach_8w", status: "quoted",
    });
    await fulfillLpOrder(client, { orderId: "o2" });
    const horizon = updates.find((u) => u.table === "learner_profiles");
    expect(horizon?.values.journey_horizon_weeks).toBe(8);
  });

  it("fails cleanly on unknown order", async () => {
    const { client } = makeAdminStub(null);
    expect((await fulfillLpOrder(client, { orderId: "nope" })).ok).toBe(false);
  });
});
```

- [ ] **Step 2: 确认失败** — `npx vitest run tests/lib/lp/fulfill-order.test.ts` → FAIL

- [ ] **Step 3: 实现两个模块**

```ts
// src/lib/lp/fulfill-order.ts
import type { SupabaseClient } from "@supabase/supabase-js";
import { getCoachPack } from "./catalog";

export async function fulfillLpOrder(
  admin: SupabaseClient,
  input: { orderId: string; paymentProvider?: string; paymentRef?: string }
): Promise<{ ok: boolean }> {
  const { data: order } = await admin
    .from("lp_orders")
    .select("id, user_id, service_type, status")
    .eq("id", input.orderId)
    .maybeSingle();
  if (!order) return { ok: false };
  if (order.status === "paid") return { ok: true }; // idempotent (webhook retries)

  const now = new Date().toISOString();
  await admin
    .from("lp_orders")
    .update({ status: "superseded", updated_at: now })
    .eq("user_id", order.user_id)
    .eq("status", "paid");
  await admin
    .from("lp_orders")
    .update({
      status: "paid",
      paid_at: now,
      payment_provider: input.paymentProvider ?? null,
      payment_ref: input.paymentRef ?? null,
      updated_at: now,
    })
    .eq("id", order.id);

  const pack = getCoachPack(order.service_type);
  if (pack) {
    await admin
      .from("learner_profiles")
      .update({ journey_horizon_weeks: pack.weeks, updated_at: now })
      .eq("user_id", order.user_id);
  }
  return { ok: true };
}
```

```ts
// src/lib/lp/access-server.ts
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Plan } from "@/lib/entitlements";
import { resolveAccessSource, type AccessSource } from "./access";

export async function fetchAccess(
  supabase: SupabaseClient,
  userId: string
): Promise<AccessSource | null> {
  const [profileRes, orderRes] = await Promise.all([
    supabase.from("profiles").select("plan").eq("id", userId).maybeSingle(),
    supabase
      .from("lp_orders")
      .select("price_cents")
      .eq("user_id", userId)
      .eq("status", "paid")
      .maybeSingle(),
  ]);
  const plan: Plan = profileRes.data?.plan === "pro" ? "pro" : "free";
  const order = orderRes.data ? { priceCents: orderRes.data.price_cents } : null;
  return resolveAccessSource({ plan, activePaidOrder: order });
}
```

- [ ] **Step 4: 确认通过** — `npx vitest run tests/lib/lp/fulfill-order.test.ts` → PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/lp/access-server.ts src/lib/lp/fulfill-order.ts tests/lib/lp/fulfill-order.test.ts
git commit -m "feat(lp): server access lookup and idempotent order fulfillment"
```

---

### Task 9: 报价 API（Coach / Exam Custom / Sprint 统一）

**Files:**
- Create: `src/app/api/lp/quote/route.ts`

**Interfaces:**
- Consumes: Task 1–6 全部纯函数；`lp_orders`（Task 7）；鉴权样板同 `src/app/api/onboarding/route.ts`。
- Produces: `POST /api/lp/quote`
  - 请求 `{ serviceType: "coach_4w"|"coach_8w"|"coach_12w"|"exam_custom"|"sprint", composition?: LpComposition }`
  - 成功 200 `{ orderId, lpTotal, priceCents, creditLp, feasibility? }`（插入一条 `status='quoted'` 订单）
  - 失败 422 `{ error: "not_feasible", requiredMinutesPerDay, capacityMinutes }` / `{ error: "exam_date_required" }` / `{ error: "not_sprint_eligible" }`
- Task 14 的报价页与 Task 10 的 checkout 都以 `orderId` 为交接物。

- [ ] **Step 1: 实现 route**

```ts
// src/app/api/lp/quote/route.ts
import { z } from "zod";
import { NextResponse } from "next/server";
// 鉴权与 supabase client 获取方式复制 src/app/api/onboarding/route.ts 顶部样板
import { computeQuote, EMPTY_COMPOSITION, type LpComposition } from "@/lib/lp/pricing";
import { getCoachPack } from "@/lib/lp/catalog";
import { checkFeasibility, DEFAULT_MINUTES_PER_DAY } from "@/lib/lp/feasibility";
import { daysUntilExam, isSprintEligible, sprintComposition } from "@/lib/lp/sprint";
import { computeUnspentLp, applyCredit } from "@/lib/lp/replan-credit";

export const dynamic = "force-dynamic";

const compositionSchema = z.object({
  vocabulary: z.number().int().min(0),
  grammar: z.number().int().min(0),
  listening: z.number().int().min(0),
  reading: z.number().int().min(0),
  writingReview: z.number().int().min(0),
  mockSection: z.number().int().min(0),
});

const bodySchema = z.object({
  serviceType: z.enum(["coach_4w", "coach_8w", "coach_12w", "exam_custom", "sprint"]),
  composition: compositionSchema.optional(),
});

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function POST(request: Request) {
  // ... onboarding 样板：取 supabase + user，未登录 401 ...

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const { serviceType } = parsed.data;

  const { data: learner } = await supabase
    .from("learner_profiles")
    .select("target_exam_date, minutes_per_day")
    .eq("user_id", user.id)
    .maybeSingle();

  let composition: LpComposition;
  let quote: ReturnType<typeof computeQuote>;
  let feasibility: ReturnType<typeof checkFeasibility> | undefined;

  const coachPack = getCoachPack(serviceType);
  if (coachPack) {
    // Coach: fixed budget & price; concrete composition comes from diagnosis at plan time.
    composition = { ...EMPTY_COMPOSITION };
    quote = { lpTotal: coachPack.lpBudget, priceCents: coachPack.priceCents };
  } else if (serviceType === "exam_custom") {
    if (!learner?.target_exam_date) {
      return NextResponse.json({ error: "exam_date_required" }, { status: 422 });
    }
    if (!parsed.data.composition) {
      return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    }
    composition = parsed.data.composition;
    const days = Math.max(1, daysUntilExam(todayIso(), learner.target_exam_date));
    feasibility = checkFeasibility({
      composition,
      daysUntilExam: days,
      minutesPerDay: learner.minutes_per_day ?? DEFAULT_MINUTES_PER_DAY,
    });
    if (!feasibility.feasible) {
      // Never silently trim — the user must reduce volume or move the date.
      return NextResponse.json(
        {
          error: "not_feasible",
          requiredMinutesPerDay: feasibility.requiredMinutesPerDay,
          capacityMinutes: feasibility.capacityMinutes,
        },
        { status: 422 }
      );
    }
    quote = computeQuote(composition);
  } else {
    // sprint (repeat purchase path; first-free goes through /api/sprint/start)
    if (!isSprintEligible(todayIso(), learner?.target_exam_date ?? null)) {
      return NextResponse.json({ error: "not_sprint_eligible" }, { status: 422 });
    }
    composition = sprintComposition(
      daysUntilExam(todayIso(), learner!.target_exam_date!)
    );
    quote = computeQuote(composition);
  }

  // Replan credit: transfer unspent LP from the current paid package (spec §8.3).
  let creditLp = 0;
  const { data: activeOrder } = await supabase
    .from("lp_orders")
    .select("id, lp_total")
    .eq("user_id", user.id)
    .eq("status", "paid")
    .maybeSingle();
  if (activeOrder && serviceType !== "sprint") {
    const { data: doneTasks } = await supabase
      .from("coach_plan_tasks")
      .select("task_type, skill, target_count, status")
      .eq("user_id", user.id);
    creditLp = computeUnspentLp(activeOrder, doneTasks ?? []);
    quote = applyCredit(quote, creditLp);
  }

  const { data: inserted, error } = await supabase
    .from("lp_orders")
    .insert({
      user_id: user.id,
      service_type: serviceType,
      composition,
      lp_total: quote.lpTotal,
      price_cents: quote.priceCents,
      status: "quoted",
    })
    .select("id")
    .single();
  if (error || !inserted) {
    return NextResponse.json({ error: "quote_failed" }, { status: 500 });
  }

  return NextResponse.json({
    orderId: inserted.id,
    lpTotal: quote.lpTotal,
    priceCents: quote.priceCents,
    creditLp,
    feasibility,
  });
}
```

注意：若 `coach_plan_tasks` 无 `user_id` 列（任务挂在 plan 下），改为经 `coach_study_plans` join 取该用户所有任务——以 `006_coach.sql` 实际列为准，测试兜底。

- [ ] **Step 2: 构建 + lint**

Run: `npm run build`（或项目惯用 `npx tsc --noEmit` + `npm run lint`）
Expected: 无类型/构建错误

- [ ] **Step 3: 手动冒烟**

登录态下：

```bash
curl -s -X POST localhost:3000/api/lp/quote -H 'content-type: application/json' \
  --cookie "$AUTH_COOKIE" -d '{"serviceType":"coach_4w"}'
```

Expected: `{"orderId":"...","lpTotal":1300,"priceCents":1300,"creditLp":0}`

- [ ] **Step 4: Commit**

```bash
git add src/app/api/lp/quote/route.ts
git commit -m "feat(api): unified LP quote endpoint with feasibility + replan credit"
```

---

### Task 10: Checkout 改造（一次性支付）+ Webhook 履约

**Files:**
- Modify: `src/app/api/checkout/route.ts`（body 从 `{ priceType }` 改为 `{ orderId }`）
- Modify: `src/lib/payments/stripe-provider.ts`（新增 `createLpCheckout`；删除订阅 checkout）
- Modify: `src/lib/payments/index.ts`（`createCheckoutSession` 签名改为 order-based；删除 `PriceType` 流转）
- Modify: `src/app/api/stripe/webhook/route.ts`（`checkout.session.completed` 增加订单分支）
- Delete: `src/app/api/stripe/checkout/route.ts`（订阅专用旧路由）
- Test: 更新 `src/lib/payments/payments.test.ts` 相应断言

**Interfaces:**
- Consumes: `fulfillLpOrder`（Task 8）、`lp_orders`（Task 7）、既有 `getStripe()`（`src/lib/stripe.ts`）、`getAppUrl()`（`src/lib/payments/types.ts`）、`createAdminClient`（`subscription-sync.ts` 同款）。
- Produces: `POST /api/checkout` body `{ orderId: string }` → `{ url: string }`；价格为 0 的订单直接履约返回 `{ url: "/dashboard?purchased=1" }`。Webhook 侧 `session.metadata.orderId` → `fulfillLpOrder`。
- 决策：一次性支付**本迭代只走 Stripe**（Creem 一次性支付能力未验证）；`PAYMENT_PROVIDER=creem` 时 checkout 仍用 Stripe 处理 LP 订单。旧订阅 webhook 事件（`customer.subscription.deleted` → `setUserPlan free`）**保留**，服务存量订阅者。

- [ ] **Step 1: stripe-provider 新增一次性支付**

```ts
// src/lib/payments/stripe-provider.ts 追加（保留 isStripeConfigured；删除 createStripeCheckout 订阅函数）
export async function createLpCheckout(input: {
  orderId: string;
  userId: string;
  userEmail?: string;
  priceCents: number;
  productName: string;
}): Promise<{ url: string }> {
  const stripe = getStripe();
  const appUrl = getAppUrl();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    client_reference_id: input.userId,
    customer_email: input.userEmail,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: input.priceCents,
          product_data: { name: input.productName },
        },
      },
    ],
    success_url: `${appUrl}/dashboard?purchased=1`,
    cancel_url: `${appUrl}/plan/quote`,
    metadata: { userId: input.userId, orderId: input.orderId },
  });
  if (!session.url) throw new Error("stripe_checkout_no_url");
  return { url: session.url };
}
```

- [ ] **Step 2: 改造 `/api/checkout`**

```ts
// src/app/api/checkout/route.ts（核心逻辑；鉴权样板不变）
const bodySchema = z.object({ orderId: z.string().uuid() });

export async function POST(request: Request) {
  // ... auth 样板，得到 supabase + user ...
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "invalid_body" }, { status: 400 });

  const { data: order } = await supabase
    .from("lp_orders")
    .select("id, service_type, price_cents, status")
    .eq("id", parsed.data.orderId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!order || order.status !== "quoted") {
    return NextResponse.json({ error: "order_not_found" }, { status: 404 });
  }

  if (order.price_cents === 0) {
    // Fully covered by replan credit (or free sprint routed here) — no payment leg.
    await fulfillLpOrder(createAdminClient(), { orderId: order.id });
    return NextResponse.json({ url: "/dashboard?purchased=1" });
  }

  const productName = PRODUCT_NAMES[order.service_type] ?? "HSK Prep package";
  const { url } = await createLpCheckout({
    orderId: order.id,
    userId: user.id,
    userEmail: user.email ?? undefined,
    priceCents: order.price_cents,
    productName,
  });
  return NextResponse.json({ url });
}

const PRODUCT_NAMES: Record<string, string> = {
  coach_4w: "Coach package · 4 weeks",
  coach_8w: "Coach package · 8 weeks",
  coach_12w: "Coach package · 12 weeks",
  exam_custom: "Custom exam plan",
  sprint: "Emergency sprint",
};
```

- [ ] **Step 3: Webhook 订单分支**

在 `src/app/api/stripe/webhook/route.ts` 的 `checkout.session.completed` 处理中，**在现有 legacy 逻辑之前**加：

```ts
const orderId = session.metadata?.orderId;
if (orderId) {
  await fulfillLpOrder(createAdminClient(), {
    orderId,
    paymentProvider: "stripe",
    paymentRef: session.id,
  });
  break; // LP orders never touch profiles.plan
}
// （以下保留 legacy：setUserPlan(userId, "pro", ...)，服务存量订阅回调）
```

`customer.subscription.deleted` 分支原样保留。

- [ ] **Step 4: 清理订阅入口**

- 删除 `src/app/api/stripe/checkout/route.ts`。
- `src/lib/payments/index.ts`：`createCheckoutSession` 移除或改为薄封装 order 流；`PriceType` 从 `types.ts` 及全部引用处删除（`grep -r "PriceType" src/`，涉及 `index.ts`、checkout 路由、Zod schema）。Creem 订阅 checkout（`creem.ts`）暂留不删（webhook 兼容），但不再被 UI 调用。

- [ ] **Step 5: 更新支付单测 + 构建**

更新 `src/lib/payments/payments.test.ts`：删除对 `priceType` 的断言，新增对 `createLpCheckout` 参数组装的测试（mock `getStripe`）。

Run: `npm test && npm run build`
Expected: PASS，无类型错误

- [ ] **Step 6: Commit**

```bash
git add -A src/lib/payments src/app/api/checkout src/app/api/stripe
git commit -m "feat(payments): one-time LP order checkout, webhook fulfillment, retire subscription entry"
```

---

### Task 11: Sprint 启动 API + Sprint 旅程窗口

**Files:**
- Create: `src/app/api/sprint/start/route.ts`
- Modify: `src/lib/coach/journey/persist-journey.ts`（`ensureJourney` 增加 sprint 分支）
- Test: `tests/lib/coach/journey/persist-journey.test.ts`（追加 sprint 用例，沿用文件内既有 stub 手法）

**Interfaces:**
- Consumes: Task 4（sprint 纯函数）、Task 7（列）、Task 8（`fulfillLpOrder` 不需要——免费单直接插 paid）、`computeQuote`（Task 1）。
- Produces:
  - `POST /api/sprint/start` → 免费首用 `{ started: true }`；已用过 `{ started: false, orderId, priceCents }`（前端拿去走 `/api/checkout`）；不合格 422 `{ error: "not_sprint_eligible" }`。
  - `ensureJourney` 行为变更：当 `learner_profiles.service_intent === 'sprint'` 且 sprint 资格成立时，stage_calendar 为单一 sprint 窗口 `[{ stage: "sprint", startDate: today, endDate: examDate }]`，outline 为单周 `available`。

- [ ] **Step 1: 写失败测试（ensureJourney sprint 分支）**

在 `tests/lib/coach/journey/persist-journey.test.ts` 追加（stub 构造复用该文件现有工厂，profile 增加 `service_intent: "sprint"`、`target_exam_date` 为 3 天后）：

```ts
it("builds a single sprint window when service_intent=sprint and exam within 6 days", async () => {
  const profile = baseProfile({
    service_intent: "sprint",
    target_exam_date: "2026-07-19", // today stub = 2026-07-16
    stage_calendar: {},
  });
  const result = await ensureJourney(stubClient(profile), "u1", {
    gaps: [],
    today: "2026-07-16",
  });
  expect(result.stageCalendar).toEqual([
    { stage: "sprint", startDate: "2026-07-16", endDate: "2026-07-19" },
  ]);
  expect(result.outline).toHaveLength(1);
  expect(result.outline[0]).toMatchObject({ weekIndex: 1, stage: "sprint", status: "available" });
});
```

- [ ] **Step 2: 确认失败** — `npx vitest run tests/lib/coach/journey/persist-journey.test.ts` → 新用例 FAIL

- [ ] **Step 3: 实现 ensureJourney sprint 分支**

在 `persist-journey.ts` 读取 profile 的 select 中加入 `service_intent, target_exam_date`（后者已在）。在「outline/calendar 缺失 → allocateStages + buildWeekOutline」的分支前插入：

```ts
import { isSprintEligible } from "@/lib/lp/sprint";
import { primaryTheme, stageQuotas } from "./stage-quotas";

// inside ensureJourney, when journey needs building:
if (
  profile.service_intent === "sprint" &&
  isSprintEligible(today, profile.target_exam_date)
) {
  const windows = [
    { stage: "sprint" as const, startDate: today, endDate: profile.target_exam_date! },
  ];
  const { theme, skillFocus } = primaryTheme(stageQuotas("sprint"), "sprint");
  const outline = [
    { weekIndex: 1, stage: "sprint" as const, theme, skillFocus, status: "available" as const },
  ];
  // 复用既有的 upsert journey_week_outlines + update learner_profiles 持久化代码路径
  // （stage_calendar=windows, current_stage='sprint', current_week_index=1, journey_started_at=now）
  return { currentWeekIndex: 1, currentStage: "sprint", stageCalendar: windows, outline };
}
```

- [ ] **Step 4: 确认通过** — `npx vitest run tests/lib/coach/journey/persist-journey.test.ts` → PASS

- [ ] **Step 5: 实现 sprint start route**

```ts
// src/app/api/sprint/start/route.ts
import { z } from "zod";
import { NextResponse } from "next/server";
import { computeQuote } from "@/lib/lp/pricing";
import {
  canUseFreeSprint,
  daysUntilExam,
  isSprintEligible,
  sprintComposition,
} from "@/lib/lp/sprint";

export const dynamic = "force-dynamic";

export async function POST() {
  // ... onboarding 样板鉴权 ...
  const today = new Date().toISOString().slice(0, 10);

  const { data: learner } = await supabase
    .from("learner_profiles")
    .select("target_exam_date, free_sprint_used_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!isSprintEligible(today, learner?.target_exam_date ?? null)) {
    return NextResponse.json({ error: "not_sprint_eligible" }, { status: 422 });
  }

  const days = daysUntilExam(today, learner!.target_exam_date!);
  const composition = sprintComposition(days);
  const quote = computeQuote(composition);
  const now = new Date().toISOString();

  if (canUseFreeSprint(learner!.free_sprint_used_at)) {
    // Lifetime-free sprint: paid order at $0 + burn the flag (never reset by replan).
    const { error: orderErr } = await supabase.from("lp_orders").insert({
      user_id: user.id,
      service_type: "sprint",
      composition,
      lp_total: quote.lpTotal,
      price_cents: 0,
      status: "paid",
      paid_at: now,
    });
    if (orderErr) return NextResponse.json({ error: "sprint_failed" }, { status: 500 });
    await supabase
      .from("learner_profiles")
      .update({ free_sprint_used_at: now, updated_at: now })
      .eq("user_id", user.id);
    return NextResponse.json({ started: true });
  }

  const { data: inserted, error } = await supabase
    .from("lp_orders")
    .insert({
      user_id: user.id,
      service_type: "sprint",
      composition,
      lp_total: quote.lpTotal,
      price_cents: quote.priceCents,
      status: "quoted",
    })
    .select("id")
    .single();
  if (error || !inserted) return NextResponse.json({ error: "sprint_failed" }, { status: 500 });
  return NextResponse.json({
    started: false,
    orderId: inserted.id,
    priceCents: quote.priceCents,
  });
}
```

注意：免费单 insert 带 `status: 'paid'` 会被 RLS 的 insert policy（仅 quoted）拒绝——此处用 admin client（同 webhook 履约的 `createAdminClient()`）执行两条写入，用户 session 只做鉴权与资格读取。

- [ ] **Step 6: 构建 + 全量测试** — `npm test && npm run build` → PASS

- [ ] **Step 7: Commit**

```bash
git add src/app/api/sprint/start/route.ts src/lib/coach/journey/persist-journey.ts tests/lib/coach/journey/persist-journey.test.ts
git commit -m "feat(sprint): lifetime-free start endpoint and single-window sprint journey"
```

---

## Phase 3 · Gate 重写与 UI

### Task 12: 执行期 gate 重写（样例日取代 Week-1 墙 + 报告全量）

**Files:**
- Modify: `src/lib/coach/journey/week-unlock.ts`（重写导出）
- Modify: `src/lib/coach/journey/persist-journey.ts`（`clearWeekAndUnlockNext` 去掉 free 停车逻辑）
- Modify: `src/lib/coach/freemium.ts`（`applyFreemiumReport` 返回完整报告）
- Modify: `src/lib/entitlements.ts`（`canViewWeaknessDetail` → 恒 true）
- Modify: `src/app/api/coach/journey/advance/route.ts`、`src/app/api/writing/score/route.ts`、`src/app/api/coach/run/route.ts`（plan 判定换成 `fetchAccess`）
- Modify: 所有 `shouldShowWeek1ProCta` / 旧 `canExecuteWeek` 调用点（`grep -rn "shouldShowWeek1ProCta\|canExecuteWeek\|applyFreemiumReport" src/` 逐一替换）
- Test: 重写 `tests/lib/coach/journey/week-unlock.test.ts`、更新 `tests/lib/coach/freemium.test.ts`、`tests/lib/entitlements.test.ts`

**Interfaces:**
- Consumes: `AccessSource`, `canExecuteTask`（Task 5）、`fetchAccess`（Task 8）
- Produces（`week-unlock.ts` 新导出，旧的 `shouldShowWeek1ProCta` 与 plan 参数版 `canExecuteWeek` 删除）:

```ts
canExecuteWeek(input: { weekIndex: number; currentWeekIndex: number; access: AccessSource | null }): boolean
shouldShowQuoteCta(input: {
  access: AccessSource | null;
  sampleDayTasks: { dayOffset: number; required: boolean; status: string }[];
}): boolean
nextWeekAfterClear(currentWeekIndex: number): number  // 保留原实现
```

- [ ] **Step 1: 重写 week-unlock 测试**

```ts
// tests/lib/coach/journey/week-unlock.test.ts（整体替换）
import { describe, it, expect } from "vitest";
import {
  canExecuteWeek,
  shouldShowQuoteCta,
  nextWeekAfterClear,
} from "@/lib/coach/journey/week-unlock";

describe("canExecuteWeek (access-based)", () => {
  it("paid access executes the current week", () => {
    expect(canExecuteWeek({ weekIndex: 3, currentWeekIndex: 3, access: "paid_order" })).toBe(true);
  });
  it("never executes a non-current week", () => {
    expect(canExecuteWeek({ weekIndex: 2, currentWeekIndex: 3, access: "paid_order" })).toBe(false);
  });
  it("no access → cannot execute any full week (sample day is task-level)", () => {
    expect(canExecuteWeek({ weekIndex: 1, currentWeekIndex: 1, access: null })).toBe(false);
  });
});

describe("shouldShowQuoteCta", () => {
  const doneDay0 = [
    { dayOffset: 0, required: true, status: "done" },
    { dayOffset: 0, required: true, status: "skipped" },
    { dayOffset: 1, required: true, status: "pending" },
  ];
  it("fires when free user finishes the sample day", () => {
    expect(shouldShowQuoteCta({ access: null, sampleDayTasks: doneDay0 })).toBe(true);
  });
  it("silent while sample day incomplete or when user has access", () => {
    expect(
      shouldShowQuoteCta({
        access: null,
        sampleDayTasks: [{ dayOffset: 0, required: true, status: "pending" }],
      })
    ).toBe(false);
    expect(shouldShowQuoteCta({ access: "paid_order", sampleDayTasks: doneDay0 })).toBe(false);
  });
});

describe("nextWeekAfterClear", () => {
  it("advances by one", () => expect(nextWeekAfterClear(2)).toBe(3));
});
```

- [ ] **Step 2: 确认失败** — `npx vitest run tests/lib/coach/journey/week-unlock.test.ts` → FAIL

- [ ] **Step 3: 实现新 week-unlock**

```ts
// src/lib/coach/journey/week-unlock.ts（整体替换）
import type { AccessSource } from "@/lib/lp/access";

export function canExecuteWeek(input: {
  weekIndex: number;
  currentWeekIndex: number;
  access: AccessSource | null;
}): boolean {
  if (input.weekIndex !== input.currentWeekIndex) return false;
  return input.access !== null;
}

/** Conversion moment moved to quote confirmation: CTA after the free sample day. */
export function shouldShowQuoteCta(input: {
  access: AccessSource | null;
  sampleDayTasks: { dayOffset: number; required: boolean; status: string }[];
}): boolean {
  if (input.access) return false;
  const day0 = input.sampleDayTasks.filter((t) => t.dayOffset === 0 && t.required);
  if (day0.length === 0) return false;
  return day0.every((t) => t.status === "done" || t.status === "skipped");
}

export function nextWeekAfterClear(currentWeekIndex: number): number {
  return currentWeekIndex + 1;
}
```

- [ ] **Step 4: 连带修改**

1. `persist-journey.ts` `clearWeekAndUnlockNext`：开头 `const access = await fetchAccess(supabase, userId); if (!access) return { advanced: false };`；删除 `plan === "free" && currentWeekIndex === 1` 的停车分支与 `w1_cleared_at` 写入（列保留不删，`resolve-continue-href.ts` 读取处不动）。
2. `freemium.ts`：`applyFreemiumReport(report, _plan)` 直接 `return report`（完整报告免费，spec §2）；`applyFreemiumTasks` 保持 no-op；更新 `tests/lib/coach/freemium.test.ts` 断言为「free 也拿完整报告」。
3. `entitlements.ts`：`canViewWeaknessDetail` 返回 `true`（签名不变，减小调用面改动）；更新 `tests/lib/entitlements.test.ts`。`FREE_DAILY_PRACTICE_LIMIT` / `FREE_MOCK_EXAM_LIMIT` / `canStartPractice` / `canTakeMockExam` 不动。
4. `src/app/api/writing/score/route.ts`：`canUseAiWritingScore(plan)` 改为 `hasFullAccess(await fetchAccess(supabase, user.id))`，无权时仍返回既有 402 结构；`entitlements.ts` 中的 `canUseAiWritingScore` 若无其余调用点则删除。
5. `src/app/api/coach/journey/advance/route.ts`：gate 换 `canExecuteWeek` 新签名；无 access 时返回 402 `{ error: "quote_required" }`。
6. `src/app/api/coach/run/route.ts`：`manual_refresh` 的 Pro 判定改为 `hasFullAccess(...)`。
7. Dashboard 组件中 `shouldShowWeek1ProCta` 调用点替换为 `shouldShowQuoteCta`（CTA 文案与链接在 Task 15 落地，此处先保证编译与语义正确，链接指向 `/plan/quote`）。

- [ ] **Step 5: 全量测试 + 构建** — `npm test && npm run build` → PASS（`grep -rn "shouldShowWeek1ProCta\|w1_cleared_at" src/ | grep -v resolve-continue` 应只剩 continue-profile 读取处）

- [ ] **Step 6: Commit**

```bash
git add -A src/lib tests/lib src/app/api
git commit -m "refactor(gate): replace week-1 freemium wall with access + sample-day gate, full free report"
```

---

### Task 13: Onboarding 服务选择

**Files:**
- Create: `src/components/onboarding/ServiceIntentStep.tsx`
- Modify: `src/components/onboarding/OnboardingForm.tsx`
- Modify: `src/app/api/onboarding/route.ts`

**Interfaces:**
- Consumes: `isSprintEligible`（Task 4）、`learner_profiles.service_intent`（Task 7）
- Produces: `/api/onboarding` 新 body `{ serviceIntent: "coach"|"exam_custom"|"sprint", examDate: string|null, unsure: boolean }`；规则：`coach` 允许 `unsure`/无日期；`exam_custom` 与 `sprint` 必填日期；`sprint` 且日期 > 6 天 → 422 `{ error: "not_sprint_eligible" }`（前端提示改选 Exam Custom）。

- [ ] **Step 1: 新组件**

```tsx
// src/components/onboarding/ServiceIntentStep.tsx
"use client";

export type ServiceIntent = "coach" | "exam_custom" | "sprint";

const OPTIONS: { id: ServiceIntent; title: string; description: string }[] = [
  {
    id: "coach",
    title: "Coach package",
    description: "A fixed 4/8/12-week program. We plan everything from your diagnosis.",
  },
  {
    id: "exam_custom",
    title: "Custom exam plan",
    description: "You set the skill mix and volume for your exam date. We check it's achievable.",
  },
  {
    id: "sprint",
    title: "Emergency sprint",
    description: "Exam within 6 days? Get a focused rescue plan. First sprint is free.",
  },
];

export function ServiceIntentStep(props: {
  value: ServiceIntent | null;
  onSelect: (intent: ServiceIntent) => void;
}) {
  return (
    <div className="grid gap-3">
      {OPTIONS.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => props.onSelect(opt.id)}
          aria-pressed={props.value === opt.id}
          className={`rounded-lg border p-4 text-left transition ${
            props.value === opt.id ? "border-blue-600 ring-2 ring-blue-200" : "border-gray-200"
          }`}
        >
          <div className="font-semibold">{opt.title}</div>
          <div className="text-sm text-gray-600">{opt.description}</div>
        </button>
      ))}
    </div>
  );
}
```

（样式类按项目现有 onboarding 卡片风格对齐，以 `OnboardingForm.tsx` 现状为准。）

- [ ] **Step 2: 集成进 OnboardingForm**

改造 `OnboardingForm.tsx` 为两步：

```tsx
// 关键状态与提交逻辑（并入现有组件，保留其 examDate/unsure 处理）
const [step, setStep] = useState<1 | 2>(1);
const [serviceIntent, setServiceIntent] = useState<ServiceIntent | null>(null);

// step 1: <ServiceIntentStep value={serviceIntent} onSelect={(i) => { setServiceIntent(i); setStep(2); }} />
// step 2: 现有日期表单。规则：
//   - coach: 保留 “I'm not sure” 选项
//   - exam_custom / sprint: 隐藏 unsure，日期必填
// 提交 body: { serviceIntent, examDate, unsure }
// 422 not_sprint_eligible → 就地提示: "Your exam is more than 6 days away — the Custom exam plan fits better."
//   并提供按钮一键把 serviceIntent 切为 exam_custom 重新提交。
```

- [ ] **Step 3: 扩展 API route**

`src/app/api/onboarding/route.ts`：

```ts
const bodySchema = z.object({
  serviceIntent: z.enum(["coach", "exam_custom", "sprint"]),
  examDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  unsure: z.boolean(),
});
// 校验追加：
// - serviceIntent !== "coach" 且 examDate 为 null → 400 { error: "exam_date_required" }
// - serviceIntent === "sprint" 且 !isSprintEligible(today, examDate) → 422 { error: "not_sprint_eligible" }
// update learner_profiles 增加 service_intent: parsed.serviceIntent（其余列写入逻辑不变）
```

- [ ] **Step 4: 手动验证**

`node scripts/reset-user-data.mjs`（既有重置脚本）清测试号 → 走注册 → 三个选项各提交一次，检查 `learner_profiles.service_intent` 落库、sprint 远期日期被 422 拦截。

Run: `npm run build` → PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/onboarding src/app/api/onboarding/route.ts
git commit -m "feat(onboarding): service-intent selection step feeding lp pricing flow"
```

---

### Task 14: 报价与购买页 `/plan/quote`

**Files:**
- Create: `src/app/(app)/plan/quote/page.tsx`（server component，`requireJourneyRoute` 守卫）
- Create: `src/components/quote/CoachPackPicker.tsx`
- Create: `src/components/quote/CustomPlanConfigurator.tsx`
- Create: `src/components/quote/SprintPanel.tsx`

**Interfaces:**
- Consumes: `COACH_PACKS`（Task 2）、`computeQuote`/`EMPTY_COMPOSITION`（Task 1，客户端实时算价）、`estimateMinutes`（Task 3，客户端节奏提示）、`POST /api/lp/quote`（Task 9）、`POST /api/checkout`（Task 10）、`POST /api/sprint/start`（Task 11）、`requireJourneyRoute`（`src/lib/auth/continue-destination.ts`）。
- Produces: 诊断完成后的主转化页。Dashboard CTA（Task 15）与 pricing 页（Task 16）都链到这里。

- [ ] **Step 1: 页面骨架**

```tsx
// src/app/(app)/plan/quote/page.tsx
import { requireJourneyRoute } from "@/lib/auth/continue-destination";
import { createClient } from "@/lib/supabase/server"; // 与其他 (app) 页面一致的 server client
import { CoachPackPicker } from "@/components/quote/CoachPackPicker";
import { CustomPlanConfigurator } from "@/components/quote/CustomPlanConfigurator";
import { SprintPanel } from "@/components/quote/SprintPanel";

export default async function QuotePage() {
  const { userId } = await requireJourneyRoute({ intent: "/plan/quote" });
  const supabase = createClient();
  const { data: learner } = await supabase
    .from("learner_profiles")
    .select("service_intent, target_exam_date, minutes_per_day, free_sprint_used_at")
    .eq("user_id", userId)
    .maybeSingle();

  const intent = learner?.service_intent ?? "coach";
  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold">Your plan, one transparent price</h1>
      <p className="mt-1 text-gray-600">
        Pay once for a defined amount of work. Same rate for everyone — no urgency premium.
      </p>
      <div className="mt-6">
        {intent === "exam_custom" ? (
          <CustomPlanConfigurator
            examDate={learner?.target_exam_date ?? null}
            minutesPerDay={learner?.minutes_per_day ?? null}
          />
        ) : intent === "sprint" ? (
          <SprintPanel freeUsed={Boolean(learner?.free_sprint_used_at)} />
        ) : (
          <CoachPackPicker />
        )}
      </div>
      {/* 诊断后可换服务：链接回 onboarding 服务选择（诊断结果复用，不重考） */}
      <a href="/onboarding" className="mt-6 inline-block text-sm text-blue-600 underline">
        Switch service type
      </a>
    </main>
  );
}
```

- [ ] **Step 2: CoachPackPicker**

```tsx
// src/components/quote/CoachPackPicker.tsx
"use client";
import { useState } from "react";
import { COACH_PACKS } from "@/lib/lp/catalog";

function dollars(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function CoachPackPicker() {
  const [busy, setBusy] = useState<string | null>(null);

  async function buy(packId: string) {
    setBusy(packId);
    try {
      const quoteRes = await fetch("/api/lp/quote", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ serviceType: packId }),
      });
      const quote = await quoteRes.json();
      if (!quoteRes.ok) throw new Error(quote.error ?? "quote_failed");
      const checkoutRes = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderId: quote.orderId }),
      });
      const checkout = await checkoutRes.json();
      if (!checkoutRes.ok) throw new Error(checkout.error ?? "checkout_failed");
      window.location.assign(checkout.url);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {COACH_PACKS.map((pack) => (
        <div key={pack.id} className="rounded-lg border p-4">
          <div className="text-lg font-semibold">{pack.weeks} weeks</div>
          <div className="mt-1 text-2xl font-bold">{dollars(pack.priceCents)}</div>
          <div className="text-sm text-gray-600">
            {pack.lpBudget} learning points · same rate as every plan
          </div>
          <button
            className="mt-3 w-full rounded bg-blue-600 py-2 text-white disabled:opacity-50"
            disabled={busy !== null}
            onClick={() => buy(pack.id)}
          >
            {busy === pack.id ? "Redirecting…" : "Buy once"}
          </button>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: CustomPlanConfigurator**

```tsx
// src/components/quote/CustomPlanConfigurator.tsx
"use client";
import { useMemo, useState } from "react";
import {
  EMPTY_COMPOSITION,
  computeQuote,
  type LpComposition,
} from "@/lib/lp/pricing";
import { estimateMinutes, DEFAULT_MINUTES_PER_DAY } from "@/lib/lp/feasibility";
import { daysUntilExam } from "@/lib/lp/sprint";

const FIELDS: { key: keyof LpComposition; label: string; step: number }[] = [
  { key: "vocabulary", label: "Vocabulary drills", step: 10 },
  { key: "grammar", label: "Grammar drills", step: 10 },
  { key: "listening", label: "Listening questions", step: 5 },
  { key: "reading", label: "Reading passage sets", step: 2 },
  { key: "writingReview", label: "Writing + AI review", step: 1 },
  { key: "mockSection", label: "Mock sections + report", step: 1 },
];

export function CustomPlanConfigurator(props: {
  examDate: string | null;
  minutesPerDay: number | null;
}) {
  const [composition, setComposition] = useState<LpComposition>({ ...EMPTY_COMPOSITION });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const quote = useMemo(() => computeQuote(composition), [composition]);
  const totalMinutes = useMemo(() => estimateMinutes(composition), [composition]);
  const days = props.examDate
    ? Math.max(1, daysUntilExam(new Date().toISOString().slice(0, 10), props.examDate))
    : null;
  const perDay = props.minutesPerDay ?? DEFAULT_MINUTES_PER_DAY;
  const overloaded = days !== null && totalMinutes > days * perDay;

  async function purchase() {
    setBusy(true);
    setError(null);
    try {
      const quoteRes = await fetch("/api/lp/quote", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ serviceType: "exam_custom", composition }),
      });
      const data = await quoteRes.json();
      if (quoteRes.status === 422 && data.error === "not_feasible") {
        setError(
          `This volume needs ${data.requiredMinutesPerDay} min/day before your exam. Reduce volume or move your exam date — we never trim your plan silently.`
        );
        return;
      }
      if (!quoteRes.ok) throw new Error(data.error ?? "quote_failed");
      const checkoutRes = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderId: data.orderId }),
      });
      const checkout = await checkoutRes.json();
      if (!checkoutRes.ok) throw new Error(checkout.error ?? "checkout_failed");
      window.location.assign(checkout.url);
    } catch (e) {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="grid gap-3">
        {FIELDS.map((f) => (
          <label key={f.key} className="flex items-center justify-between gap-4">
            <span>{f.label}</span>
            <input
              type="number"
              min={0}
              step={f.step}
              value={composition[f.key]}
              onChange={(e) =>
                setComposition((c) => ({
                  ...c,
                  [f.key]: Math.max(0, Number(e.target.value) || 0),
                }))
              }
              className="w-24 rounded border p-1 text-right"
            />
          </label>
        ))}
      </div>
      <div className="mt-4 rounded bg-gray-50 p-4">
        <div className="text-xl font-bold">
          Total: ${(quote.priceCents / 100).toFixed(2)}
        </div>
        <div className="text-sm text-gray-600">
          {quote.lpTotal} learning points · ~{Math.round(totalMinutes)} min of work
          {days !== null && ` · ~${Math.ceil(totalMinutes / days)} min/day until your exam`}
        </div>
        {overloaded && (
          <div className="mt-2 text-sm text-amber-700">
            This looks heavier than {perDay} min/day. You can still request a quote — we’ll
            confirm feasibility, never trim silently.
          </div>
        )}
      </div>
      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
      <button
        className="mt-4 rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        disabled={busy || quote.lpTotal === 0}
        onClick={purchase}
      >
        {busy ? "Preparing checkout…" : "Get my one-time quote"}
      </button>
    </div>
  );
}
```

- [ ] **Step 4: SprintPanel**

```tsx
// src/components/quote/SprintPanel.tsx
"use client";
import { useState } from "react";

export function SprintPanel(props: { freeUsed: boolean }) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function start() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/sprint/start", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(
          data.error === "not_sprint_eligible"
            ? "Sprint is for exams within 6 days. Try the Custom exam plan instead."
            : "Something went wrong. Please try again."
        );
        return;
      }
      if (data.started) {
        window.location.assign("/dashboard");
        return;
      }
      const checkoutRes = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderId: data.orderId }),
      });
      const checkout = await checkoutRes.json();
      if (!checkoutRes.ok) throw new Error(checkout.error ?? "checkout_failed");
      window.location.assign(checkout.url);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-lg border p-6">
      <h2 className="text-lg font-semibold">Emergency sprint</h2>
      <p className="mt-1 text-sm text-gray-600">
        {props.freeUsed
          ? "You've used your free sprint. This one is priced by workload at the same rate as every plan — no urgency premium."
          : "Your first sprint is completely free: diagnosis, full report, and the whole rescue plan."}
      </p>
      {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
      <button
        className="mt-4 rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        disabled={busy}
        onClick={start}
      >
        {busy ? "Starting…" : props.freeUsed ? "Get sprint quote" : "Start free sprint"}
      </button>
    </div>
  );
}
```

- [ ] **Step 5: 构建 + 手动走查** — `npm run build` → PASS；本地跑三种 intent 各进一次 `/plan/quote`，Coach 三卡显示 $13/$26/$39，Custom 实时报价随输入变化，Sprint 首次免费直达 dashboard。

- [ ] **Step 6: Commit**

```bash
git add src/app/\(app\)/plan src/components/quote
git commit -m "feat(quote): /plan/quote purchase page for coach packs, custom plans, sprint"
```

---

### Task 15: 样例日、锁定任务卡与个性化预览

**Files:**
- Create: `src/components/journey/LockedTaskCard.tsx`
- Create: `src/components/journey/PreviewCards.tsx`
- Modify: Dashboard 周任务渲染组件（`grep -rn "canExecuteWeek\|coach_plan_tasks\|dayOffset" src/components src/app/\(app\)/dashboard` 定位当前任务列表组件；下称「周任务组件」）

**Interfaces:**
- Consumes: `canExecuteTask`、`AccessSource`（Task 5）、`fetchAccess`（Task 8）、`shouldShowQuoteCta`（Task 12）、coach report 的 gaps 数据（`coach_reports`，dashboard 已在读）。
- Produces: 免费用户在 dashboard 看到——Day0 任务可做；Day1+ 与 Week2+ 任务显示锁定卡；报告 gaps 生成 ≤3 张预览卡；样例日完成后出报价 CTA。

- [ ] **Step 1: LockedTaskCard**

```tsx
// src/components/journey/LockedTaskCard.tsx
import Link from "next/link";

export function LockedTaskCard(props: { title: string; skill: string | null }) {
  return (
    <Link
      href="/plan/quote"
      className="block rounded-lg border border-dashed border-gray-300 p-4 opacity-80 transition hover:opacity-100"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium text-gray-700">{props.title}</div>
          {props.skill && <div className="text-xs text-gray-500">{props.skill}</div>}
        </div>
        <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
          Included in your package
        </span>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: PreviewCards（预览必须引用本人诊断）**

```tsx
// src/components/journey/PreviewCards.tsx
import Link from "next/link";

type Gap = { skill: string; severity: string; note?: string | null };

/** Personalized locked previews — must cite the user's own diagnosis (spec §5). */
export function PreviewCards(props: { gaps: Gap[] }) {
  const top = props.gaps.slice(0, 3);
  if (top.length === 0) return null;
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {top.map((gap) => (
        <Link
          key={gap.skill}
          href="/plan/quote"
          className="rounded-lg border p-4 transition hover:border-blue-400"
        >
          <div className="text-xs uppercase tracking-wide text-gray-500">
            Your {gap.skill} gap
          </div>
          <div className="mt-1 text-sm">
            Your diagnosis flagged {gap.skill} ({gap.severity}). Your plan includes targeted
            drills for exactly this weakness.
          </div>
          <div className="mt-2 text-xs font-medium text-blue-600">
            Included in your package →
          </div>
        </Link>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: 周任务组件接线**

在周任务组件（server 侧已拿到 tasks 与 report gaps）：

```tsx
// 伪 diff：在渲染每个任务处
const access = await fetchAccess(supabase, userId); // 页面 server 侧一次
// ...
{tasks.map((task) =>
  canExecuteTask({ access, weekIndex, dayOffset: task.day_offset })
    ? <ExistingTaskRow key={task.id} task={task} />           // 既有可执行渲染
    : <LockedTaskCard key={task.id} title={task.title} skill={task.skill} />
)}
// 任务列表下方：
{shouldShowQuoteCta({ access, sampleDayTasks: tasks.map(t => ({
  dayOffset: t.day_offset, required: t.required, status: t.status,
})) }) && (
  <div className="mt-4 rounded-lg bg-blue-50 p-4">
    <div className="font-semibold">You’ve finished your free sample day.</div>
    <div className="text-sm text-gray-600">
      See your full plan and its one-time price — everything is shown before you pay.
    </div>
    <Link href="/plan/quote" className="mt-2 inline-block rounded bg-blue-600 px-4 py-2 text-white">
      View my plan & price
    </Link>
  </div>
)}
// 报告区下方（免费用户）：<PreviewCards gaps={reportGaps} />
```

同时确认任务完成 API（task status 更新的 route）也用 `canExecuteTask` 做服务端校验，防止绕过 UI 直接做锁定任务。

- [ ] **Step 4: 手动走查** — 重置测试号 → coach intent → 诊断 → dashboard：Day0 可做、Day1+ 锁定、完成 Day0 出 CTA、预览卡点名本人弱项。`npm run build` → PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/journey src/app src/components
git commit -m "feat(journey): sample-day gating UI, locked task cards, personalized preview cards"
```

---

### Task 16: Pricing 页改造（买断制取代订阅）

**Files:**
- Modify: `src/components/marketing/PricingPlans.tsx`（删除 `PRO_BILLING_OPTIONS` monthly/yearly，改渲染 Coach 三档 + Custom/Sprint 入口）
- Modify: `src/components/marketing/PricingTable.tsx`、`src/app/pricing/page.tsx`（跟随 props 变化）
- Modify: `src/lib/payments/types.ts`（`PRO_BENEFITS`/`FREE_TIER_BENEFITS` 文案更新）
- Modify: `src/components/paywall/UpgradeModal.tsx`、`UpgradeCTA.tsx`（升级入口统一指向 `/plan/quote`）

**Interfaces:**
- Consumes: `COACH_PACKS`（Task 2）。登录用户 CTA → `/plan/quote`；未登录 CTA → 既有 `resolveVisitorContinueHref` 流程（先注册诊断再报价）。
- Produces: 营销页价格叙事 = 「一次付清 · 单一费率 · 免费链完整」。

- [ ] **Step 1: 重写 PricingPlans 卡片数据**

```tsx
// PricingPlans.tsx 内替换 PRO_BILLING_OPTIONS 区块
import { COACH_PACKS } from "@/lib/lp/catalog";

const FREE_CHAIN = [
  "Full diagnosis (never counts against quotas)",
  "Complete AI report — no truncation",
  "Full course outline with a one-time price",
  "A real, doable sample day",
  "Personalized previews of locked tasks",
];

// 卡片渲染：左列 Free（FREE_CHAIN 清单，CTA "Start free diagnosis" → 既有 continue href）
// 右列 “Pay once” 三档：
//   {COACH_PACKS.map(p => `${p.weeks} weeks — $${(p.priceCents/100).toFixed(0)}`)}
//   副文案: "One rate for every plan. Custom exam plans and emergency sprints priced the same way."
//   CTA → /plan/quote（登录）/ continue href（未登录）
// 删除 monthly/yearly toggle、handleCheckout 的 priceType 调用（checkout 现在只认 orderId，
// 营销页不直接发起 checkout，统一先进 /plan/quote）
```

- [ ] **Step 2: 全局清理** — `grep -rn "9.99\|69\|yearly\|monthly\|priceType" src/components src/app | grep -vi test` 逐一处理；`FREE_TIER_BENEFITS`/`PRO_BENEFITS` 改写为免费链/买断制表述。

- [ ] **Step 3: 构建 + 走查** — `npm run build` → PASS；`/pricing` 未登录可见三档价与免费链，无订阅字样。

- [ ] **Step 4: Commit**

```bash
git add src/components/marketing src/components/paywall src/app/pricing src/lib/payments/types.ts
git commit -m "feat(pricing): buy-once coach packs replace subscription pricing page"
```

---

### Task 17: E2E 更新与新漏斗用例

**Files:**
- Modify: `e2e/free/paywall.spec.ts`、`e2e/free/week1-pro-gate.spec.ts`（断言从 Week-1 墙改为样例日 gate 与报价 CTA）
- Modify: `e2e/public/stripe.spec.ts`、`e2e/free/stripe.spec.ts`、`e2e/authenticated/stripe.spec.ts`（checkout body 改 orderId 流）
- Create: `e2e/public/lp-pricing.spec.ts`

**Interfaces:**
- Consumes: 既有 `e2e/helpers/{auth,journey,supabase}.ts`。

- [ ] **Step 1: 新公共 spec**

```ts
// e2e/public/lp-pricing.spec.ts
import { test, expect } from "@playwright/test";

test("pricing page shows buy-once coach packs, no subscription copy", async ({ page }) => {
  await page.goto("/pricing");
  await expect(page.getByText("$13")).toBeVisible();
  await expect(page.getByText("$26")).toBeVisible();
  await expect(page.getByText("$39")).toBeVisible();
  await expect(page.getByText(/per month|\/month|yearly/i)).toHaveCount(0);
  await expect(page.getByText(/sample day/i)).toBeVisible();
});
```

- [ ] **Step 2: 改写 gated specs**

- `week1-pro-gate.spec.ts` → 重命名语义为 sample-day gate：免费号完成 Day0 后断言出现 "View my plan & price"；Day1 任务不可交互（渲染为链接卡而非任务行）。
- `paywall.spec.ts`：升级入口落点断言改为 `/plan/quote`。
- stripe specs：拦截 `/api/checkout` 请求断言 body 为 `{ orderId: <uuid> }`。

- [ ] **Step 3: 跑全部测试**

Run: `npm test && npm run test:e2e`
Expected: 全绿（e2e 需本地 supabase/dev server，按 `playwright.config.ts` 既有约定）

- [ ] **Step 4: Commit**

```bash
git add e2e
git commit -m "test(e2e): lp pricing funnel, sample-day gate, order-based checkout"
```

---

## 自检记录（写完后对照 spec 复核）

- Spec §1 三服务分类 → Task 2/9/13；§2 免费链 → Task 12（全量报告）+ 15（样例日/预览）；§3 LP/ρ/买断 → Task 1/2/9/10；§3.3 公平性（LP 计价+自行减量+4 周小包）→ Task 1/2/14；§4 Sprint → Task 4/11；§5 预览 → Task 15（预测卡「听力 54→72」类数值预测因需可解释模型，本迭代仅落弱项点名卡，预测卡记回 backlog，不虚构数字——对应「不吹牛」约束）；§6 旅程 → Task 13/14/15；§7 修订 → Task 10/12/16 落地（Coach-day 取代、W1 墙取代、订阅退场）；§8 开放项 → 全部钉定于 Global Constraints。
- 已知取舍：写作精批样例（展示他人批改效果）需要真实样例资产，本迭代 PreviewCards 只做弱项点名卡；样例资产就位后补一张静态卡即可（不阻塞主漏斗）。
- 类型一致性：`LpComposition` 六键、`AccessSource` 三值、`ServiceType` 五值在 Task 1/2/5 定义后全程未变名；`orderId` 为 quote→checkout→webhook 全链交接物。
