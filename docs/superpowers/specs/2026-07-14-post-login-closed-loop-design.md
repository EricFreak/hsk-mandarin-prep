# Post-Login Closed-Loop — Expert Board Self-Audit & Revised Scheme

- **Date:** 2026-07-14 (revision 2 — adversarial full funnel)
- **Status:** Implementation cut v1 (see handoff `2026-07-14-post-login-closed-loop-v1.md`)
- **Personas:** Free first-run `wangkejay@126.com`; Pro `657696471@qq.com` / e2e Pro
- **Supersedes:** Waiting-room-first draft in previous version of this file
- **Related:** `2026-07-13-full-journey-ux-brand-design.md`, `2026-07-14-auth-aware-user-journey-design.md`

---

## 0. Board self-critique of the previous draft

Product / UX / Engineering ran an **adversarial full-funnel** review (not a single-bug patch). Verdict on our own prior scheme:

| Prior claim | Board finding |
|-------------|----------------|
| Park user on Waiting poll until Coach ready | **KILL.** Waiting is a *state*, not a *place*. Hostage screens fail on logout, refresh, timeout, multi-tab, days-later return, and “what do I do next?” |
| Split diagnosis vs coach is enough | **Necessary but incomplete.** Shipping code still 3-state; many edges unmodeled |
| Free W1 → Pro CTA path closed | **FALSE in code.** Free week clear advances `current_week_index` and can **kill** primary Pro CTA |
| Diagnosis ≠ free mock quota | **FALSE in code.** Quota counts diagnosis attempts → Free “1 mock” already spent |
| Auth never harms Pro | **FALSE.** Callback upserts `plan: "free"` — can wipe Pro |
| Account menu = polish | **FALSE.** Trust P0; multi-account disaster already observed |
| Sub-routes use same guards | **FALSE.** journey/plans/progress/attempts skip journey stage |

**Rewrite doctrine (locked by UX + Product):**

> Score / diagnosis completion is the user’s milestone. Coach generation is a **status**. Dashboard is the durable home once diagnosis is submitted. Async work never owns the primary product surface.

---

## 1. Product principles (govern every phase)

1. **Never offer a door the router will close** — soft-disable + reason beats bounce.
2. **User milestone ≠ backend milestone** — diagnosis submitted ≠ Week 1 ready.
3. **Async is a state, not a place** — poll on results composition or Dashboard banner; no Waiting Room brand.
4. **Setup chrome: identity first, tools later** — email + plan + Sign out always; tool nav only after app unlock.
5. **Conflicts need a beat** — date vs unsure; never silent discard.
6. **Recovery never undoes progress** — failed coach → Retry build; never force retake as recovery.
7. **One freemium climax** — primary Pro ask after Week 1 cleared, not mid-setup or mid-W1.
8. **Durable home after logout** — resume from DB; never require the same browser tab.

---

## 2. Normative state model (revised)

### 2.1 Axes

| Axis | Values |
|------|--------|
| Auth | `anonymous` \| `authenticated` |
| Plan | `free` \| `pro` |
| Setup | `needs_exam_prefs` → `needs_diagnosis` → `diagnosis_done` |
| Coach job | `none` \| `pending` \| `ready` \| `error` |
| Execution | `active_w1` \| `w1_cleared_free` \| `pro_active_wn` |

**App unlock (may use tools + full nav):** `diagnosis_done` **AND** durable Week 1 tasks exist (`coach_job = ready`).  
**Dashboard access (durable home after diagnosis):** allowed from `diagnosis_done` with Zone 1 showing coach job status — **not** bounced to diagnosis questions.

### 2.2 Durable fields (migration required)

| Field | Set when | Truth |
|-------|----------|--------|
| `onboarding_prefs_at` | Date or unsure committed | Prefs done (do **not** infer only from `DEFAULT 12` horizon) |
| `target_exam_date` | Concrete date or null | Calendar |
| `journey_horizon_weeks` | From date or 12 if unsure | Horizon (**must be null until prefs commit** — today `DEFAULT 12` corrupts stage detection) |
| `diagnosis_completed_at` | Diagnosis attempt insert OK | User finished level check |
| `coach_last_error` / `coach_last_run_at` | Coach attempts | Pending vs error honesty |
| `journey_started_at` | **Atomic** with report + Week 1 plan/tasks | Coach ready (not mid-`ensureJourney`) |
| `w1_cleared_at` | Week 1 cleared | Free conversion trigger (**do not** advance executable week for Free) |

### 2.3 Stage resolver (routing)

```
needs_exam_prefs   ⇔ authenticated ∧ onboarding_prefs_at IS NULL
needs_diagnosis    ⇔ prefs set ∧ diagnosis_completed_at IS NULL
diagnosis_done     ⇔ diagnosis_completed_at IS NOT NULL
app_unlocked       ⇔ diagnosis_done ∧ week1_tasks_exist
```

| Stage | Default destination | Notes |
|-------|---------------------|-------|
| `needs_exam_prefs` | `/onboarding` | Minimal chrome + account menu |
| `needs_diagnosis` | `/diagnosis` | Resume or start; no fake mid-progress if not stored |
| `diagnosis_done` ∧ coach pending/error | `/dashboard` | Zone 1 = pending/error/retry — **never** `/diagnosis` questions |
| `diagnosis_done` ∧ results still open | Stay on diagnosis **results composition** | Same emotional surface as score |
| `app_unlocked` | `/dashboard` | Full nav + tools |

**KILL:** `/coach/waiting` as product destination.

---

## 3. Full scene catalog (normal + boundary)

### 3.1 Auth & identity

| Scene | Expected | Edge / fail if missing |
|-------|----------|------------------------|
| Authed Pro hits Home CTA | Dashboard | Login / second Free signup |
| Authed opens `/login` | Redirect; no form | Form enables silent account switch |
| Sign up while session live | Forbidden without Sign out | Observed Pro → Free |
| Magic link / callback | Preserve `next`; **never upsert plan=free over Pro** | Wipes paid plan |
| Signup needs email confirm | Explicit “confirm email” fork; preserve `next` | Ambiguous “account created” |
| Session expires mid-diagnosis | Re-login with `?next=` resume | Silent 401 |
| Sign out anytime | Clears session → Home | **Missing entirely today** |
| Shared device | Visible email + Sign out | Wrong account sticky |

### 3.2 Onboarding

| Scene | Expected | Edge |
|-------|----------|------|
| Empty submit | Blocked | — |
| Valid date → Continue | Prefs + date saved | Past dates: UI min OK; API must validate |
| Unsure, empty date | Horizon 12 + prefs | — |
| Date filled + Unsure | **Confirm** Use date vs 12-week | Silent discard (today) |
| Refresh mid-form | Local OK | — |
| Deep `/diagnosis` without prefs | → onboarding | — |
| Prefs done reopen `/onboarding` | → diagnosis or dashboard | Re-ask loop |
| Edit date later | Settings/journey (spec debt) | Stale mental model |

### 3.3 Diagnosis

| Scene | Expected | Edge |
|-------|----------|------|
| Complete MCQs | Attempt saved + `diagnosis_completed_at` | Double submit → one completion stamp |
| Mid-exam leave / refresh | Honest: restart or resume if we store draft (MVP: restart confirm) | Lost progress shock |
| Score + coach pending | Score saved; CTAs soft-disabled; status line | Hard Links to dashboard/practice bounce |
| Logout on score screen | Resume → dashboard pending or results hydrate | Waiting room loses user |
| Coach timeout / 503 | Retry build on **same surface or dashboard**; score kept | “Open dashboard” while barred |
| Days later return | Dashboard or hydrated results + status from DB | Client-only coach fire forgotten |
| Coach fire-and-forget only in browser | **Server-owned trigger + reconcile** | Navigate away = stranded forever |

### 3.4 Dashboard / execution

| Scene | Expected | Edge |
|-------|----------|------|
| Pending coach | Banner / Zone 1: Building Week 1 · Retry | Bounce to diagnosis |
| Error coach | Retry; support | Retake diagnosis as recovery |
| Ready W1 Free | Full tasks; calm | Mid-week Pro hard-stop forbidden |
| W1 cleared Free | Celebration + **primary Upgrade**; W2 outline locked; **executable index stays 1 or flagged** | Code advances to W2 → CTA logic dies |
| Decline upgrade | Still Free; locked W2 themes visible | Dead end |
| Mid-W1 upgrade to Pro | Plan flips; no re-setup | Webhook lag; `?upgraded=1` ignored |
| Pro W1 clear | Unlock W2 sequentially | — |
| Sub-routes journey/plans/progress | Same stage guard | Unguarded today |
| Weeks away | Resume Zone 1 | Stale “Building…” forever |

### 3.5 Tools & entitlements

| Scene | Expected | Edge |
|-------|----------|------|
| Incomplete deep `/practice` | Interstitial: finish setup | Silent bounce |
| Free full mock #1 | Allowed | Diagnosis must **not** count |
| Free mock #2 | Upgrade CTA | Diagnosis consumed quota (today) |
| Practice 20/day | Cap message | Race on concurrent tabs |
| Writing AI Free | Blur / upgrade | Diagnosis hardcoded `plan=free` even for Pro |
| Mistakes Free | Row caps | — |
| Attempts pages | Journey guard | Unguarded today |

### 3.6 Billing

| Scene | Expected | Edge |
|-------|----------|------|
| Checkout cancel | Resume dashboard stage | Feels reset |
| Checkout success | Poll plan until Pro or timeout + help | Paid still Free |
| Webhook vs callback race | Non-destructive plan writes | Callback overwrites Pro |

### 3.7 Chrome

| Scene | Expected | Edge |
|-------|----------|------|
| Setup | Logo + Step N + account menu | Full nav / Pro escape |
| Unlocked | Full nav + account + plan badge | No identity |

---

## 4. Closed-loop definitions

### Free closed loop

Register → prefs (explicit receipt) → diagnosis → **score surface with coach status** → Dashboard (pending→ready) → Week 1 → clear → Upgrade primary → accept (Pro) or decline (W2 locked) → Sign out → Sign in resumes correct stage.

### Pro closed loop

Same setup once (or skip if diagnosis already done) → full report → W1 → W2+ sequential → unlimited mocks → Sign out → Sign in → Dashboard. **Never** re-onboard; **never** plan wiped on auth.

### Must never happen

- Diagnosis ↔ Dashboard bounce after submit  
- Hostage Waiting Room as primary UX  
- Silent date discard  
- Diagnosis billed as free mock  
- Free W1 clear advancing executable week past conversion CTA  
- Auth upsert destroying Pro  
- Tool links offered before unlock  
- No Sign out  

---

## 5. Diagnosis completion UX (rewritten)

**Composition = score results**, not a room named Waiting.

| Coach job | Primary UI | Primary action |
|-----------|------------|----------------|
| `pending` | Score + “Building your Week 1 plan…” | Soft-disabled “Open Week 1” + ETA honesty |
| `ready` | Same surface or Dashboard | **Open your Week 1** |
| `error` | Score kept + error | **Retry build** |

Optional: user navigates to Dashboard early → Zone 1 shows same honesty (pending/error/retry), tools soft-locked with reason — **not** redirect to diagnosis questions.

**Server:** diagnosis submit triggers coach run server-side (or durable queue); client poll is hydration, not the only trigger.

---

## 6. Free W1 → Pro conversion (rewritten)

| Rule | Normative |
|------|-----------|
| After Free W1 cleared | Set `w1_cleared_at`; **do not** move Free `current_week_index` to 2 for execution |
| Primary CTA | Upgrade to Pro |
| Outline | W2+ themes visible, execution locked |
| After Pro webhook | Unlock sequential W2 materialize |

---

## 7. Top fails ranked (code + scheme)

| # | Sev | Item |
|---|-----|------|
| 1 | P0 | Diagnosis submit ≠ routing stage; Dashboard/Practice CTAs bounce |
| 2 | P0 | No account / Sign out |
| 3 | P0 | Diagnosis consumes free mock quota |
| 4 | P0 | Auth callback can force `plan: free` |
| 5 | P0 | Free W1 clear advances week index → conversion CTA breaks |
| 6 | P0 | `journey_started_at` before plan/tasks durable + client-only coach trigger |
| 7 | P0 | Prior scheme’s Waiting Room as primary surface (product error) |
| 8 | P1 | Sub-routes / attempts skip journey guard |
| 9 | P1 | Date + unsure silent discard |
| 10 | P1 | Checkout success / webhook lag UX absent |
| 11 | P1 | `journey_horizon_weeks DEFAULT 12` corrupts prefs detection |
| 12 | P1 | Diagnosis `plan="free"` hardcoded |
| 13 | P2 | No exam-date edit later |
| 14 | P2 | Empty dashboard CTA says “mock” not “retry coach” |
| 15 | P2 | Mid-diagnosis abandon/resume underspecified |

---

## 8. Implementation phases (revised)

| Phase | Deliverable |
|-------|-------------|
| **A** | Migration: prefs stamp, diagnosis_completed_at, w1_cleared_at; fix horizon default; non-destructive profile upsert |
| **B** | Resolver + Dashboard-first after diagnosis; diagnosis results state machine; server-owned coach trigger + status API; exclude diagnosis from mock quota |
| **C** | Account menu + Sign out everywhere authenticated |
| **D** | Uniform guards; Free W1 clear conversion fix; soft tool locks with reasons |
| **E** | Onboarding date/unsure confirm + prefs receipt |
| **F** | E2E full catalog Free/Pro + `wangkejay@126.com` reset script |

---

## 9. QA backbone (personas)

Reset Free persona before full F1. Do **not** reset for resume paths.

- **F1–F4** Free: first run, mid-W1, W1 cleared, account  
- **P1–P3** Pro: first run, return, upgrade mid/post W1  
- Plus boundary matrix from §3 (logout mid-coach, webhook delay, mock #2, incomplete Practice deep link)

---

## 10. Approval trail

| Decision | Board recommendation | Founder |
|----------|----------------------|---------|
| Kill Waiting Room as primary UX | **Yes** | ☐ |
| Dashboard (or score composition) owns coach status | **Yes** | ☐ |
| App unlock = diagnosis + Week 1 tasks durable | **Yes** | ☐ |
| Account menu + Sign out P0 | **Yes** | ☐ |
| Diagnosis excluded from free mock quota | **Yes** | ☐ |
| Free W1 clear must not destroy Pro CTA | **Yes** | ☐ |
| Auth must never overwrite Pro to Free | **Yes** | ☐ |
| Proceed phases A→F | **Yes** | ☐ |

---

## Appendix — How this differs from revision 1

| Rev 1 | Rev 2 |
|-------|-------|
| Obsessed on diagnosis→dashboard loop | Full funnel audit (auth → Pro retention) |
| `/coach/waiting` primary | Score/Dashboard status; Waiting killed as place |
| Assumed Free conversion OK | Found week-index conversion bug |
| Assumed mock quota OK | Found diagnosis burns free mock |
| Soft on auth plan writes | Named Pro wipe as P0 |
| Thin edge list | Scene catalog §3 + ranked fails §7 |
