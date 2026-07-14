# Homepage board follow-ups (executed)

Date: 2026-07-14  
Status: Implemented on `feature/mvp-implementation` marketing home  
Source: Expert board review (founder approved all items)

## Goals

Ship board P1–P3 without reopening full-bleed / stripe cohesion.

## Changes

1. **Outcomes → HomeBridge** — Removed triple-card `AfterMockOutcomes`. Replaced with one-sentence bridge + `#pricing` link after How it works.
2. **SyllabusTrust** — One honest authority beat (GF0025-2021, exam guide, chinesetest.cn). Placed under Problem frame. No invented social proof.
3. **ProblemFrame chroma** — “With HSK Prep” no longer solid jade fill; outline + `bg-jade/8` so How it works remains product climax.
4. **Hero trust row** — Concrete claims: listening/reading/writing mock · Full Week 1 on Free · Level 3 GF0025-2021.
5. **FAQ** — Added mock length (honest: diagnostic sit-down, shorter than full official paper) and writing AI (submit on Free; score/feedback Pro).
6. **Copy economy** — Removed Week 1/Pro sentence from How it works intro (bridge owns it).
7. **E2E** — `marketing.spec.ts` updated for bridge + FAQ; Outcomes heading assertion removed.

## Non-goals

- Do not restore full-bleed section borders or alternating white/paper bands.
- Do not invent timed mock minutes until product timer exists.
- Do not invent testimonials.

## Verify

- Manual: `http://localhost:3001` scroll IA order and jade panel softness.
- `e2e/public/marketing.spec.ts` MKT-001.
