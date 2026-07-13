# Full App Verification Runbook

**Question: Can minimum smoke (§14 in `app-test-matrix.md`, ~15 min) find all defects?**

**No.** It only covers ~12 P0 paths. It will miss paywall edge cases, Stripe, mistakes filters, mock review regressions, mobile layout, SWR behavior, and most P1/P2 cases (~85% of the matrix).

Use **three layers** for a one-time complete verification before release.

---

## Layer 1 — Automated (≈5 min, no browser)

Runs schema, DB writes, unit tests, and production build.

```bash
cd /Users/eric/cursor_projects/hsk-mandarin-prep/.worktrees/mvp-implementation
node scripts/full-app-verify.mjs 657696471@qq.com
```

| Covers | Does NOT cover |
|--------|----------------|
| Env vars, migrations 004/005 | UI rendering, cookies, navigation |
| Insert practice_questions / attempts / mock | Magic-link login flow |
| 36 Vitest unit tests | Stripe checkout UI |
| `next build` | Full mock exam click-through |
| | Mistakes page filters |

**Pass criteria:** exit code 0, zero FAIL lines.

---

## Layer 2 — UI walkthrough P0 (≈45 min, logged in)

One session, one test account. Check every box.

### A. Public (no login) — 5 min

- [ ] `/` — hero, pricing, footer avatars
- [ ] `/hsk-2-vs-3` — table loads
- [ ] `/pricing` — Free vs Pro, monthly/yearly toggle
- [ ] `/login` — form renders
- [ ] `/dashboard` redirects to login

### B. Auth — 5 min

- [ ] Sign in (password or magic link)
- [ ] Land on dashboard or home
- [ ] Supabase `profiles` row exists

### C. Flashcards — 5 min

- [ ] `/flashcards` — card shows hanzi
- [ ] Flip → pinyin + English
- [ ] Grade → next card
- [ ] (Optional) all caught up state

### D. Practice — 10 min

- [ ] `/practice` — question generates (not 500)
- [ ] Submit answer → feedback + explanation
- [ ] Next question
- [ ] Switch HSK level 1 → 3
- [ ] Network: `GET /api/practice/generate` = 200

### E. Mock exam — 15 min

- [ ] `/mock-exam` — session starts
- [ ] Listening — audio button, no transcript in stem
- [ ] Reading — MCQ works
- [ ] Writing — must type to advance
- [ ] Submit → score screen (not 500)
- [ ] **Review exam** → `/mock-exam/attempts/[id]` shows answers
- [ ] `/mock-exam/attempts` — history list

### F. Dashboard + Mistakes — 5 min

- [ ] `/dashboard` — plan, latest score, 7/30 stats
- [ ] Weakness summary populated
- [ ] `/mistakes` — wrong answers listed
- [ ] **Practice again** → review mode (`?questionId=`)

**Pass criteria:** all boxes checked, zero 500 in Network tab.

---

## Layer 3 — Full matrix P0 + P1 (≈2–3 hours)

For **one-time complete defect hunt**, work through `docs/testing/app-test-matrix.md`:

| Section | IDs | Time |
|---------|-----|------|
| Marketing | MKT-* | 15 min |
| Auth | AUTH-* | 20 min |
| Dashboard | DASH-* | 20 min |
| Flashcards | FC-* | 15 min |
| Practice | PRC-* | 25 min |
| Mock exam | MOCK-* | 30 min |
| Mistakes | MST-* | 20 min |
| Pricing / Stripe | PAY-* | 30 min (needs Stripe test card) |
| Regression | REG-* | 15 min |

Use a **free test account** for paywall cases (D, PAY-007) and your **Pro account** for unlimited flows.

---

## Layer 4 — E2E automation (implemented)

```bash
npm run test:e2e      # Playwright only (23 tests)
npm run test:all      # Layer 1 + Playwright (full automated gate)
```

Covers: marketing, auth guards, all APIs, dashboard, flashcards, practice, mock exam UI, mistakes, pricing, journey JNY-002.

**Not yet automated:** Stripe webhook (PAY-005/007), magic-link email flow (AUTH-002), mobile P2 cases.

**Free user:** `E2E_FREE_EMAIL` / `E2E_FREE_PASSWORD` in `.env.local` (auto-created on first run).

---

## What each layer catches

| Defect type | L1 auto | L2 walkthrough | L3 full matrix |
|-------------|---------|----------------|----------------|
| Missing migration | ✓ | ✓ | ✓ |
| API 500 practice/mock | ✓ (DB) | ✓ (UI) | ✓ |
| Broken login | | ✓ | ✓ |
| Paywall wrong limit | | partial | ✓ |
| Stripe checkout | | | ✓ |
| Mistakes filter bug | | partial | ✓ |
| Mobile layout | | | ✓ (P2) |
| SWR stale data | | partial | ✓ |

---

## Recommended one-time release gate

```
Layer 1 PASS  +  Layer 2 all checked  +  Layer 3 PAY + MST + MOCK sections
```

Minimum smoke alone is **necessary but not sufficient** — use it only as a quick daily check, not as full app verification.
