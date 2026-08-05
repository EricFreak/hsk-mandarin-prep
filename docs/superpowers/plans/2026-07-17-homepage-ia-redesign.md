# Homepage IA Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans or implement inline. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the marketing homepage to the approved trust-funnel IA (`2026-07-17-homepage-ia-design.md`).

**Architecture:** Keep existing marketing shell and `HowItWorksShowcase` interaction (step rail + preview chrome + autoplay). Replace step data/previews, reorder page sections, replace homepage freemium pricing embed with three medium service cards, compress Why-us, rewrite FAQ. Backend taster generation + DeepSeek writing migration are **out of this plan** (spec §8 follow-ups); homepage copy markets the promise.

**Tech Stack:** Next.js App Router, existing Tailwind marketing tokens, Playwright e2e.

## Global Constraints

- Chapter order: Hero → `#before-you-pay` → `#plans` → Why-us → FAQ → final CTA
- No Free$0 card beside Coach prices on homepage
- No Week 1 / Unlock W2 / mastery gate / Pro monthly copy
- Sample = cross-skill taste ≠ calendar Day1
- Coach prices: $13 / $26 / $39 from `COACH_PACKS`
- Nav/secondary links that pointed at `#how-it-works` → `#before-you-pay`

---

### Task 1: Page shell + Hero + anchors

**Files:**
- Modify: `src/app/(marketing)/page.tsx`
- Modify: `src/app/(marketing)/layout.tsx` (nav if present)
- Modify: `src/components/marketing/MarketingHeader.tsx`
- Modify: `src/app/(marketing)/hsk-2-vs-3/page.tsx` (anchor)

- [ ] Reorder sections; update Hero copy/CTAs per spec §3
- [ ] Commit

### Task 2: Trust-chain showcase (5 steps)

**Files:**
- Modify: `src/components/marketing/HowItWorksShowcase.tsx`

- [ ] Replace STEPS with diagnosis / report / outline-quote / sample-taste / locked-previews
- [ ] Update titles, `#before-you-pay`, grid-cols-5, previews (reuse chrome; adapt content)
- [ ] Commit

### Task 3: Three service cards (homepage)

**Files:**
- Create: `src/components/marketing/HomeServiceCards.tsx`
- Modify: `src/app/(marketing)/page.tsx` (use it; stop using PricingTable on home)

- [ ] Three equal cards per spec §5; CTA via ContinueCta / auth-aware links
- [ ] Commit

### Task 4: Why-us compress + FAQ

**Files:**
- Modify: `src/components/marketing/ProblemFrame.tsx`
- Modify: `src/components/marketing/MarketingFaq.tsx`

- [ ] Three bullets + footnote; FAQ 7 items per spec §6–7
- [ ] Commit

### Task 5: E2E + verify

**Files:**
- Modify: `e2e/public/marketing.spec.ts`
- Modify: `e2e/public/journey-doors.spec.ts` (if `#pricing` assertions break)

- [ ] Update assertions for new headings/anchors
- [ ] `npx tsc --noEmit` + `npm run lint`
- [ ] Commit

---

## Out of scope (follow-up plan)

- Taster set generation + lifetime sample writing flag
- Migrate `/api/writing/score` to DeepSeek
- `/pricing` page layout overhaul beyond consistency
