# Monday handoff — 2026-07-10 → next week

Status snapshot after Friday evening brand work. Branch: `feature/mvp-implementation`.

---

## Done this week (context)

- Learning Coach Phase A–E (DeepSeek V4) + migration `006_coach.sql`
- Marketing How-it-works: full-width stacked showcase
- Hero replaced with AI Coach brand visual (`public/brand/hero-visual.png`)
- Site primary CTA shifted to **jade** (AI); seal red kept for errors/alerts
- Production E2E auth cookie fix; coach verify script

---

## Monday backlog (priority order)

### 1. Commit & push Friday brand work — DONE 2026-07-13

Commit `ee3bca5` on `feature/mvp-implementation`.

### 2. Brand assets still mismatched (Lovart) — IN PROGRESS

| Asset | Why | Prompt location |
|-------|-----|-----------------|
| **App logo** | Header still uses `logo-seal.png` (old seal); hero is AI orb | See below / prior chat “Lovart 提示词 1” |
| **Favicon** | `src/app/icon.png` still seal-era | Same logo mark |
| **OG / share image** (optional) | Social previews won’t match AI Coach | Prior chat “Lovart 提示词 2” |
| **Hero 2×** (optional) | Current `hero-visual.png` is 1024×764 | Prior chat “Lovart 提示词 3” |

After logo export:

- Save as `public/brand/logo-ai-coach.png`
- Update `BrandLogo.tsx` + `src/app/icon.png`
- Retire or keep `logo-seal.png` as archive only

### 3. Product / coach follow-ups

- [ ] Confirm Vercel has `DEEPSEEK_*` + `COACH_LLM_MODEL=deepseek-v4-pro`
- [ ] Manual prod loop: mock exam → wait for AI report on Dashboard → start today’s plan task
- [ ] Optional: `TUTORING_WECHAT_ID` for coach tutoring CTA
- [ ] Creem KYC / live payments when ready (`docs/launch/04-creem-setup.md`)
- [x] Fix stale Stripe E2E expectations (auth-first 401; no hardcoded “payments not configured” copy)

### 4. Nice-to-have

- [ ] Showcase steps: optionally share real coach UI components later (preview vs live)
- [ ] Phase F/G: post-tutoring reassess, report comparison

---

## Quick verify Monday morning

```bash
# schema + DeepSeek pipeline
npx tsx scripts/verify-coach.mjs

# production smoke (skip stripe)
PLAYWRIGHT_BASE_URL=https://hsk-mandarin-prep.vercel.app \
  npx playwright test e2e/public/marketing.spec.ts \
  e2e/authenticated/dashboard.spec.ts e2e/authenticated/api.spec.ts \
  e2e/free --grep-invert stripe --no-deps
```

---

## Key paths

| What | Path |
|------|------|
| Coach spec | `docs/superpowers/specs/2026-07-10-learning-coach-agent-design.md` |
| Coach plan | `docs/superpowers/plans/2026-07-10-learning-coach-phase-a-e.md` |
| Brand tokens | `public/brand/README.md` |
| Hero visual | `public/brand/hero-visual.png` |
| Live app | https://hsk-mandarin-prep.vercel.app |

---

## First message to paste Monday

> 按 `docs/superpowers/handoffs/2026-07-10-monday-backlog.md` 继续：先检查未提交的品牌改动并 commit/push；然后用 Lovart Logo 提示词出 AI Coach 图标，替换 header + favicon。
