# Handoff — 2026-07-13 (marketing & pricing session)

**Branch:** `feature/mvp-implementation`  
**Worktree:** `/Users/eric/cursor_projects/hsk-mandarin-prep/.worktrees/mvp-implementation`  
**Production (Vercel):** binds to **`feature/mvp-implementation`**, not `main`  
**Live:** https://hsk-mandarin-prep.vercel.app  
**Latest commit:** `0f828d7`

---

## Done today

### How it works (homepage)

- Steps: **6 in one row**, short taglines; full description on hover (desktop)
- Step 4 = Roadmap (map only); Step 5 = This week (Dashboard → Practice → MasteryGate)
- HTML prototypes (throwaway): `docs/prototypes/how-it-works-*.html` — **not shipped**

### Pricing (homepage `#pricing` + `/pricing`)

- Removed **HSK 3 Course Pack** — Free / Pro only, aligned with **journey freemium**
- **Free:** mock + truncated report + **full Week 1** + journey outline visible + daily practice cap
- **Pro:** full report + **Week 2+ after Week 1** + unlimited mocks/practice + writing + mistake bank
- Unified component: `src/components/marketing/PricingPlans.tsx` (home + checkout)
- **Plan B billing:** Monthly | Yearly as **side-by-side selectable cards** inside Pro (not toggle)
- Badges: **Most popular** = Pro vs Free; Yearly card = **Best value**
- CTA footer: divider + polished Free/Pro buttons; copy **Upgrade to Pro**
- Fixed price spacing bug (removed `min-w` on amounts that pushed `/year` away from `$69`)

### Nav & SEO page

- Nav: `HSK 2 vs 3` → **`HSK exam guide`** (`/hsk-2-vs-3`)
- Removed **2026** from guide titles (evergreen copy)

### Product decisions (locked)

- **Native speaker / WeChat IM Q&A:** **deferred** until MVP runs + user research (not homepage floor)
- **Course Pack:** not planned (no curriculum team)

### Git note

- PR #1 was **merged to `main`** (`e048500`) during session — feature branch still active; **no revert** unless founder wants `main` clean again

---

## Shipped commits (today, marketing-focused)

```
0f828d7 fix(marketing): use side-by-side Pro billing options (plan B)
15ff018 fix(marketing): polish pricing card CTA footer and button styles
97a9ec7 fix(marketing): tighten Pro pricing card copy and equalize card height
c55db63 fix(marketing): move Pro billing toggle inside Pro card
b9a96f2 fix(marketing): unify home and pricing page plan layout
25ca99b fix(marketing): rename nav to HSK exam guide and drop year from copy
eef2a05 fix(marketing): align pricing with journey freemium (Free/Pro only)
ff34f34 fix(marketing): show how-it-works steps in one row with short taglines
```

---

## Uncommitted / local only

| Path | Notes |
|------|--------|
| `docs/prototypes/*.html` | UX exploration prototypes |
| `scripts/prod-coach-loop-smoke.mjs` | Prod smoke script |
| `docs/superpowers/handoffs/2026-07-10-monday-backlog.md` | Stale edits |

---

## Tomorrow — suggested priorities

1. **Visual QA** on Vercel after `0f828d7`: `#how-it-works`, `#pricing`, `/pricing`, `/hsk-2-vs-3`
2. **MVP loop smoke:** real user path mock → placement → Week 1 → MasteryGate → Pro gate (`scripts/prod-coach-loop-smoke.mjs` if still valid)
3. **Optional marketing:** bottom CTA copy pass; How-it-works hover on mobile (tagline + caption only)
4. **Optional product:** Creem/live payments when ready (`docs/launch/04-creem-setup.md`)
5. **Do not start:** 1v1 tutoring floor until post-MVP interviews

---

## Key files

| What | Path |
|------|------|
| Pricing UI | `src/components/marketing/PricingPlans.tsx` |
| How it works | `src/components/marketing/HowItWorksShowcase.tsx` |
| Journey freemium spec | `docs/superpowers/specs/2026-07-13-full-journey-ux-brand-design.md` |
| PRO/FREE benefits | `src/lib/payments/types.ts` |

---

## First message tomorrow

> 读 `docs/superpowers/handoffs/2026-07-13-marketing-pricing-handoff.md`，在 Vercel 上验收 marketing/pricing，然后继续 MVP 主链路或 launch checklist。
