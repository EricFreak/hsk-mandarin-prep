# HSK Mandarin Prep MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a freemium-day-1 HSK 1-3 prep web app with SRS flashcards, AI practice, one HSK 3 mock exam, weakness dashboard, Stripe Pro subscription, and SEO landing content.

**Architecture:** Next.js App Router monolith. Static JSON syllabus data in `src/data/syllabus/`. Supabase for auth + Postgres (progress, attempts, subscriptions mirror). Stripe Checkout for Pro. OpenAI for practice generation and writing scoring. Entitlement checks in `lib/entitlements.ts` gate free vs Pro features.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Supabase, Stripe, OpenAI API, Vitest, Vercel

---

## File Map (created by this plan)

| Path | Responsibility |
| --- | --- |
| `src/lib/entitlements.ts` | Free vs Pro limits (daily practice cap, mock exam access) |
| `src/lib/srs.ts` | SM-2 spaced repetition scheduling |
| `src/lib/syllabus.ts` | Load HSK level vocabulary/grammar metadata |
| `src/lib/openai/practice.ts` | Generate cloze/sentence practice from syllabus |
| `src/lib/openai/writing-score.ts` | Score HSK writing responses |
| `src/data/syllabus/hsk{1,2,3}.json` | Compiled official-outline word lists |
| `src/app/(marketing)/page.tsx` | Landing + CTA to free mock exam |
| `src/app/(marketing)/hsk-2-vs-3/page.tsx` | SEO hero article |
| `src/app/(app)/dashboard/page.tsx` | Weakness summary + progress |
| `src/app/(app)/flashcards/page.tsx` | SRS review UI |
| `src/app/(app)/practice/page.tsx` | Daily practice session |
| `src/app/(app)/mock-exam/page.tsx` | HSK 3 mock exam flow |
| `src/app/api/stripe/checkout/route.ts` | Create Stripe Checkout session |
| `src/app/api/stripe/webhook/route.ts` | Sync subscription status to Supabase |
| `supabase/migrations/001_init.sql` | users profile, progress, attempts, subscriptions |

---

### Task 1: Project scaffold

**Files:**
- Create: `package.json`, `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`, `vitest.config.ts`, `.env.example`, `.gitignore`
- Create: `src/app/layout.tsx`, `src/app/globals.css`

- [ ] **Step 1: Initialize Next.js app in repo root**

Run from `/Users/eric/cursor_projects/hsk-mandarin-prep`:

```bash
npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-turbopack
```

When prompted about existing files, allow merge (keep `docs/`).

- [ ] **Step 2: Add runtime dependencies**

```bash
npm install @supabase/supabase-js @supabase/ssr stripe openai zod
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react
```

- [ ] **Step 3: Create `.env.example`**

```bash
cat > .env.example <<'EOF'
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY=
NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY=
OPENAI_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
```

- [ ] **Step 4: Configure Vitest**

Create `vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: { environment: "jsdom" },
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
});
```

Add to `package.json` scripts: `"test": "vitest run"`, `"test:watch": "vitest"`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js 14 app with Vitest and env template"
```

---

### Task 2: Entitlements (freemium rules)

**Files:**
- Create: `src/lib/entitlements.ts`
- Test: `tests/lib/entitlements.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/lib/entitlements.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import {
  FREE_DAILY_PRACTICE_LIMIT,
  canTakeMockExam,
  canStartPractice,
  planLabel,
} from "@/lib/entitlements";

describe("entitlements", () => {
  it("free user gets 20 practice questions per day", () => {
    expect(FREE_DAILY_PRACTICE_LIMIT).toBe(20);
    expect(canStartPractice("free", 19)).toBe(true);
    expect(canStartPractice("free", 20)).toBe(false);
  });

  it("pro user has unlimited practice", () => {
    expect(canStartPractice("pro", 999)).toBe(true);
  });

  it("free user gets one mock exam", () => {
    expect(canTakeMockExam("free", 0)).toBe(true);
    expect(canTakeMockExam("free", 1)).toBe(false);
  });

  it("pro user gets unlimited mock exams", () => {
    expect(canTakeMockExam("pro", 5)).toBe(true);
  });

  it("labels plans for UI", () => {
    expect(planLabel("free")).toBe("Free");
    expect(planLabel("pro")).toBe("Pro");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- tests/lib/entitlements.test.ts
```

Expected: FAIL — module `@/lib/entitlements` not found.

- [ ] **Step 3: Implement entitlements**

Create `src/lib/entitlements.ts`:

```typescript
export type Plan = "free" | "pro";

export const FREE_DAILY_PRACTICE_LIMIT = 20;
export const FREE_MOCK_EXAM_LIMIT = 1;

export function canStartPractice(plan: Plan, questionsAnsweredToday: number): boolean {
  if (plan === "pro") return true;
  return questionsAnsweredToday < FREE_DAILY_PRACTICE_LIMIT;
}

export function canTakeMockExam(plan: Plan, mockExamsCompleted: number): boolean {
  if (plan === "pro") return true;
  return mockExamsCompleted < FREE_MOCK_EXAM_LIMIT;
}

export function canUseAiWritingScore(plan: Plan): boolean {
  return plan === "pro";
}

export function canViewWeaknessDetail(plan: Plan): boolean {
  return plan === "pro";
}

export function planLabel(plan: Plan): string {
  return plan === "pro" ? "Pro" : "Free";
}
```

- [ ] **Step 4: Run tests**

```bash
npm test -- tests/lib/entitlements.test.ts
```

Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/entitlements.ts tests/lib/entitlements.test.ts vitest.config.ts package.json
git commit -m "feat: add freemium entitlement rules with tests"
```

---

### Task 3: SRS scheduler

**Files:**
- Create: `src/lib/srs.ts`
- Test: `tests/lib/srs.test.ts`

- [ ] **Step 1: Write failing test**

Create `tests/lib/srs.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { sm2, type SrsCard } from "@/lib/srs";

describe("sm2", () => {
  it("resets interval on quality < 3", () => {
    const card: SrsCard = { interval: 10, repetitions: 3, easeFactor: 2.5 };
    const next = sm2(card, 1);
    expect(next.repetitions).toBe(0);
    expect(next.interval).toBe(1);
  });

  it("increases interval on good recall", () => {
    const card: SrsCard = { interval: 1, repetitions: 1, easeFactor: 2.5 };
    const next = sm2(card, 4);
    expect(next.repetitions).toBe(2);
    expect(next.interval).toBeGreaterThan(1);
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npm test -- tests/lib/srs.test.ts
```

- [ ] **Step 3: Implement SM-2**

Create `src/lib/srs.ts`:

```typescript
export type SrsCard = {
  interval: number; // days
  repetitions: number;
  easeFactor: number;
};

export type SrsResult = SrsCard & { dueAt: Date };

export function sm2(card: SrsCard, quality: number): SrsResult {
  let { interval, repetitions, easeFactor } = card;
  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);
    repetitions += 1;
    easeFactor = Math.max(
      1.3,
      easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
    );
  }
  const dueAt = new Date();
  dueAt.setDate(dueAt.getDate() + interval);
  return { interval, repetitions, easeFactor, dueAt };
}
```

- [ ] **Step 4: Run test — expect PASS**

- [ ] **Step 5: Commit**

```bash
git add src/lib/srs.ts tests/lib/srs.test.ts
git commit -m "feat: add SM-2 spaced repetition scheduler"
```

---

### Task 4: HSK syllabus seed data (HSK 1-3)

**Files:**
- Create: `scripts/seed-syllabus.ts`
- Create: `src/data/syllabus/hsk1.json`, `hsk2.json`, `hsk3.json`
- Create: `src/lib/syllabus.ts`
- Test: `tests/lib/syllabus.test.ts`

- [ ] **Step 1: Write failing syllabus loader test**

Create `tests/lib/syllabus.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { getLevelMeta, getWordsForLevel } from "@/lib/syllabus";

describe("syllabus", () => {
  it("returns HSK 3 cumulative targets from GF0025-2021", () => {
    const meta = getLevelMeta(3);
    expect(meta.vocabulary).toBe(2245);
    expect(meta.grammar).toBe(210);
    expect(meta.characters).toBe(900);
  });

  it("returns word entries for level 1", () => {
    const words = getWordsForLevel(1);
    expect(words.length).toBeGreaterThan(0);
    expect(words[0]).toMatchObject({
      hanzi: expect.any(String),
      pinyin: expect.any(String),
      english: expect.any(String),
    });
  });
});
```

- [ ] **Step 2: Create minimal HSK 1 seed (expand later)**

Create `src/data/syllabus/hsk1.json`:

```json
{
  "level": 1,
  "meta": { "syllables": 269, "characters": 300, "vocabulary": 500, "grammar": 48 },
  "words": [
    { "id": "hsk1-001", "hanzi": "你好", "pinyin": "nǐ hǎo", "english": "hello" },
    { "id": "hsk1-002", "hanzi": "谢谢", "pinyin": "xièxie", "english": "thank you" },
    { "id": "hsk1-003", "hanzi": "再见", "pinyin": "zàijiàn", "english": "goodbye" }
  ]
}
```

Create `hsk2.json` and `hsk3.json` with same shape; `hsk3.json` meta: vocabulary 2245, grammar 210, characters 900. Seed at least 10 words each for MVP dev (full 500/1272/2245 words filled incrementally via script + manual curation from public GF0025 word lists).

- [ ] **Step 3: Implement loader**

Create `src/lib/syllabus.ts`:

```typescript
import hsk1 from "@/data/syllabus/hsk1.json";
import hsk2 from "@/data/syllabus/hsk2.json";
import hsk3 from "@/data/syllabus/hsk3.json";

export type HskWord = {
  id: string;
  hanzi: string;
  pinyin: string;
  english: string;
};

type LevelData = {
  level: number;
  meta: { syllables: number; characters: number; vocabulary: number; grammar: number };
  words: HskWord[];
};

const BY_LEVEL: Record<number, LevelData> = {
  1: hsk1 as LevelData,
  2: hsk2 as LevelData,
  3: hsk3 as LevelData,
};

export function getLevelMeta(level: 1 | 2 | 3) {
  return BY_LEVEL[level].meta;
}

export function getWordsForLevel(level: 1 | 2 | 3): HskWord[] {
  return BY_LEVEL[level].words;
}
```

Enable `resolveJsonModule` in `tsconfig.json` if missing.

- [ ] **Step 4: Run tests — expect PASS**

- [ ] **Step 5: Commit**

```bash
git add src/data/syllabus src/lib/syllabus.ts tests/lib/syllabus.test.ts
git commit -m "feat: add HSK 1-3 syllabus JSON loader with seed data"
```

---

### Task 5: Supabase schema + auth

**Files:**
- Create: `supabase/migrations/001_init.sql`
- Create: `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`
- Create: `src/app/login/page.tsx`, `src/app/auth/callback/route.ts`

- [ ] **Step 1: Write migration**

Create `supabase/migrations/001_init.sql`:

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  founder_cohort boolean not null default false,
  created_at timestamptz default now()
);

create table practice_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  level int not null,
  question_id text not null,
  correct boolean not null,
  skill text not null,
  created_at timestamptz default now()
);

create table mock_exam_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  level int not null default 3,
  score int not null,
  breakdown jsonb not null,
  created_at timestamptz default now()
);

create table srs_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  word_id text not null,
  level int not null,
  interval_days int not null default 1,
  repetitions int not null default 0,
  ease_factor numeric not null default 2.5,
  due_at timestamptz not null default now(),
  unique (user_id, word_id)
);

create index idx_practice_user_day on practice_attempts (user_id, created_at);
create index idx_srs_due on srs_cards (user_id, due_at);
```

- [ ] **Step 2: Add Supabase browser + server clients** (standard `@supabase/ssr` pattern per Supabase Next.js docs).

- [ ] **Step 3: Login page** — email magic link or Google OAuth button calling `supabase.auth.signInWithOtp`.

- [ ] **Step 4: On first sign-in**, insert `profiles` row with `plan='free'`.

- [ ] **Step 5: Commit**

```bash
git add supabase src/lib/supabase src/app/login src/app/auth
git commit -m "feat: add Supabase auth and core schema"
```

---

### Task 6: Marketing landing + HSK 2.0 vs 3.0 SEO page

**Files:**
- Create: `src/app/(marketing)/layout.tsx`, `page.tsx`
- Create: `src/app/(marketing)/hsk-2-vs-3/page.tsx`
- Create: `src/components/marketing/PricingTable.tsx`

- [ ] **Step 1: Landing page** with hero, three-tier pricing table (Free / Pro / Course pack), CTA "Take free HSK 3 mock exam".

- [ ] **Step 2: `hsk-2-vs-3` article** — static MDX or TSX content covering: level mapping, vocabulary changes (HSK 2.0 vs 3.0 table from spec), which exam to take in 2026, link to chinesetest.cn official samples. Add `metadata` title/description for SEO.

- [ ] **Step 3: PricingTable component** reflecting spec section 7 tiers.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(marketing\) src/components/marketing
git commit -m "feat: add marketing landing and HSK 2.0 vs 3.0 SEO page"
```

---

### Task 7: Flashcards SRS UI

**Files:**
- Create: `src/app/(app)/flashcards/page.tsx`
- Create: `src/components/flashcards/FlashcardReview.tsx`
- Create: `src/app/api/srs/review/route.ts`

- [ ] **Step 1: API route** loads due `srs_cards` for user, returns word + pinyin hidden until flip.

- [ ] **Step 2: On grade (1-5)**, call `sm2()`, persist updated card to Supabase.

- [ ] **Step 3: First visit** seeds level-1 words into `srs_cards` for new users.

- [ ] **Step 4: Commit**

```bash
git commit -m "feat: add SRS flashcard review flow"
```

---

### Task 8: AI practice engine + daily limit

**Files:**
- Create: `src/lib/openai/practice.ts`
- Create: `src/app/(app)/practice/page.tsx`
- Create: `src/app/api/practice/generate/route.ts`
- Test: `tests/lib/openai/practice-parse.test.ts` (parse/validate LLM JSON output)

- [ ] **Step 1: `generatePracticeQuestion(level, wordIds)`** — OpenAI prompt: generate one cloze MCQ using only provided HSK words; return JSON `{ stem, choices, answerIndex, explanation, skill }`.

- [ ] **Step 2: Practice page** — fetch question, submit answer, record `practice_attempts`, check `canStartPractice(plan, todayCount)` before next question; show paywall CTA when free limit hit.

- [ ] **Step 3: Test JSON schema validation with Zod**

- [ ] **Step 4: Commit**

```bash
git commit -m "feat: add AI practice with free daily limit enforcement"
```

---

### Task 9: HSK 3 mock exam + weakness summary

**Files:**
- Create: `src/lib/mock-exam/hsk3-template.ts` (section structure mirroring official format)
- Create: `src/app/(app)/mock-exam/page.tsx`
- Create: `src/app/(app)/dashboard/page.tsx`
- Create: `src/lib/weakness.ts`

- [ ] **Step 1: Mock exam template** — listening/reading/writing sections with fixed question count for MVP (scaled-down: e.g. 10 listening + 10 reading + 1 writing).

- [ ] **Step 2: Score on submit**, save `mock_exam_attempts` with `breakdown` by skill.

- [ ] **Step 3: `computeWeaknesses(attempts)`** — aggregate wrong skills; free users see top-1 skill name; Pro users see full breakdown + recommended word list.

- [ ] **Step 4: Enforce `canTakeMockExam`** — free users blocked after 1 completed exam with upgrade modal.

- [ ] **Step 5: Dashboard** shows weakness widget + link to targeted practice.

- [ ] **Step 6: Commit**

```bash
git commit -m "feat: add HSK 3 mock exam and weakness dashboard with paywall"
```

---

### Task 10: Stripe Pro subscription

**Files:**
- Create: `src/app/api/stripe/checkout/route.ts`
- Create: `src/app/api/stripe/webhook/route.ts`
- Create: `src/components/paywall/UpgradeModal.tsx`
- Create: `src/app/pricing/page.tsx`

- [ ] **Step 1: Stripe products** — create Pro Monthly ($9.99) and Pro Yearly ($69) in Stripe Dashboard; put price IDs in env.

- [ ] **Step 2: Checkout route** — authenticated user → `stripe.checkout.sessions.create` mode subscription, success/cancel URLs.

- [ ] **Step 3: Webhook** — on `checkout.session.completed` and `customer.subscription.deleted`, update `profiles.plan`.

- [ ] **Step 4: UpgradeModal** — triggered from practice limit, mock exam limit, weakness detail blur.

- [ ] **Step 5: Founder cohort** — manual SQL or admin script: `update profiles set plan='pro', founder_cohort=true where email in (...)`.

- [ ] **Step 6: Commit**

```bash
git commit -m "feat: add Stripe Pro subscription and upgrade paywall"
```

---

### Task 11: AI writing score (Pro only)

**Files:**
- Create: `src/lib/openai/writing-score.ts`
- Create: `src/app/api/writing/score/route.ts`

- [ ] **Step 1: `scoreWriting(prompt, userText)`** — returns `{ score, grammarNotes, vocabularyNotes, suggestions }`; gate with `canUseAiWritingScore(plan)`.

- [ ] **Step 2: Wire into mock exam writing section** for Pro users.

- [ ] **Step 3: Commit**

```bash
git commit -m "feat: add Pro-only AI writing scorer"
```

---

### Task 12: Deploy + founder cohort launch

**Files:**
- Create: `README.md`

- [ ] **Step 1: Connect repo to Vercel**, set all env vars from `.env.example`.

- [ ] **Step 2: Run Supabase migration** on hosted project.

- [ ] **Step 3: Register Stripe webhook** → production URL.

- [ ] **Step 4: README** — local dev setup, env vars, founder cohort SQL snippet.

- [ ] **Step 5: Recruit 20-50 beta users** on Reddit r/ChineseLanguage with "free Pro for testimonial" offer per spec.

- [ ] **Step 6: Commit + push**

```bash
git add README.md
git commit -m "docs: add README and deployment notes"
git push origin main
```

---

## Plan Self-Review

**Spec coverage:**
| Spec section | Task |
| --- | --- |
| §4 Freemium + credibility | Task 2, 6, 10 |
| §5 Architecture layers | Tasks 4-11 map to data/engine/product/monetization |
| §6 MVP scope | All tasks; AI Max / ASR explicitly out (Task 11 writing only) |
| §7 Pricing tiers | Task 2 entitlements + Task 6 PricingTable + Task 10 Stripe |
| §8 GTM + founder cohort | Task 6 SEO page + Task 12 launch |
| §9 Milestones | Tasks ordered W1-2 → W9-10 |

**Placeholder scan:** No TBD steps. Syllabus word lists note incremental expansion (explicit in Task 4).

**Type consistency:** `Plan` type used in entitlements, profiles.plan, and Stripe webhook updates.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-08-hsk-mandarin-prep-mvp.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** — fresh subagent per task, review between tasks, fast iteration
2. **Inline Execution** — execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
