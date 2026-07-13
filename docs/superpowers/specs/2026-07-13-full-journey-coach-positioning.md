# Full-Journey AI Coach — Positioning & Journey Spec

- **Date:** 2026-07-13
- **Status:** Approved — founder confirmed 2026-07-13
- **Relates to:** Learning Coach design (2026-07-10), Dashboard v2 (2026-07-13), freemium narrative A
- **Supersedes (partial):** “weekly-only Coach” as the top-level product story; week plans remain the **execution layer** under a longer journey

---

## 1. One-line product definition

**Full-journey AI Coach for HSK Level 3** — diagnose → plan by exam date → week-by-week execution → re-assess — not a multi-level catalog and not a one-off weekly patch.

```
Product scope (now):  single track = HSK Level 3
Coach scope:          full prep journey (elastic calendar)
Execution layer:      weekly tasks (Dashboard Zone 1) + MasteryGate
```

---

## 2. Positioning (locked)

### 2.1 What we are

| Claim | Meaning |
|-------|---------|
| **AI Coach** | Evidence-based loop: placement/mock → report → journey plan → tasks → practice → re-test |
| **Full journey** | Stages across the path to exam day, not only “this week’s gaps” |
| **Single track** | Everyone prepares for **HSK Level 3**; no HSK 1–9 level picker |

### 2.2 What we are not (yet)

- Not a 1–9 level marketplace (Migii-style catalog)
- Not “study-abroad HSK 4+ admissions coach” until a later track exists
- Not a fixed photocopy of a 14-week PDF plan for every user

### 2.3 Naming rules (critical)

| Do | Don’t |
|----|--------|
| Lead with **HSK Level 3** / “first serious HSK” / elementary certificate | Lead marketing with **“HSK 3.0”** as if the app covers the whole reform |
| Say **“aligned with the HSK 3.0 (GF0025) syllabus”** in footer / FAQ / about | Imply users choose among nine official levels inside the app |
| Quiet roadmap: **Level 4 later** after L3 Coach is sticky | Promise “HSK 3 only forever” as brand destiny |

**Why:** “HSK 3.0” = standard reform; “HSK Level 3” = one band. Mixing them confuses SEO and users.

**Suggested door line:**  
*AI Coach for your first real HSK — not nine apps in one.*

### 2.4 Beachhead ICP

- International / English-UI learners finishing **elementary** Mandarin who want a structured certificate path
- Users who want Coach (what to do next), not a level browser

**Not primary (until L4+):** scholarship / university admissions that still cite legacy HSK 4–5+

---

## 3. Journey model (locked)

### 3.1 Fixed stage skeleton (logic)

Order of stages does not change:

1. **Diagnose** — placement + first report  
2. **Foundation** — vocab + grammar weighted; listening/reading support  
3. **Skills** — listening + reading + writing slots more balanced  
4. **Sprint** — mocks + mistake review; stop piling new modules  

### 3.2 Elastic calendar (duration)

**Not** a fixed 14-week template.

Inputs:

- **Exam date** (or approximate month) — required for journey math; soft “I’m not sure” → default horizon (e.g. 12 weeks) editable later  
- **Placement / early mock results** — starting strength inside Level 3  
- **Optional:** minutes per day — task density  

Engine:

```
today → exam_date  ⇒  total days
allocate days across stages (sprint locked to final 2–4 weeks when horizon allows)
each week = stage quotas × density × weak-skill weights from Coach report
```

Examples:

- **~6 weeks left:** compress Foundation; enter Skills earlier; reserve ~2 weeks Sprint  
- **~20 weeks left:** longer Foundation; longer Skills; Sprint still last 2–4 weeks  

Weekly Dashboard tasks remain the **execution surface** (see Dashboard v2). The journey bar answers: *which stage am I in, how far to exam?*

### 3.3 Onboarding (no level picker)

1. Account create  
2. **Exam date** (or unsure → default horizon)  
3. **Placement** (in-app diagnostic — not off-site first)  
4. AI report (Free: truncated + evidence)  
5. **Week 1** plan generated under Diagnose → early Foundation  

Do **not** ask “which HSK level are you taking?” while product is single-track Level 3.

---

## 4. Placement materials (locked direction)

| Layer | Role | Source |
|-------|------|--------|
| **Placement** | Short diagnostic after signup | In-app Level 3–aligned shortened paper (evolve from existing mock template) |
| **Full mock** | Deeper assess / sprint | In-app full (or scaled) Level 3 mock |
| **Official samples** | Supplementary trust | Link chinesetest.cn / FAQ — not the primary onboarding hop |

Placement results feed Coach snapshot + stage start point.

---

## 5. Freemium & conversion (locked update)

**Narrative A retained:** report = trust hook; full plan + journey continuation = paid main dish.

**Normative detail (outline vs execution, sequential weeks):** see `2026-07-13-full-journey-ux-brand-design.md` §§5–6.

| Stage | Free | Pro |
|-------|------|-----|
| Onboarding + Placement | ✅ | ✅ |
| First AI report | Truncated + **1 evidence-cited gap** | Full report |
| **Journey outline** (week themes) | ✅ always visible | ✅ always visible |
| **Week 1 execution** | Full Week 1 — complete the week (taste the Coach) | ✅ |
| **Primary upgrade moment** | After **Week 1 cleared** | — |
| **Week 2+ execution** | Gated (Pro); outline still visible | Continues **sequential unlock**: clear week N → execute N+1 (not a full dump of all weeks at once) |
| Mid-journey / Sprint | Soft gates | Full sprint calendar + mock volume (still sequential by week clear) |

**Composite rule:** Outline always visible (theme-level). Execution is week-serial after Passed. Free executes Week 1 only; Pro unlocks continued sequential weeks after Week 1 clear.

**Why primary conversion after Week 1:** founder decision — trust from *executing* the plan beats converting on report alone.

Secondary upgrade surfaces (not primary): locked task rows after Week 1, full Progress, extra mocks.

Paywalls must not block Placement or the calm completion of Week 1.

---

## 6. Relationship to weekly Coach / Dashboard v2

| Layer | Spec |
|-------|------|
| Positioning + journey + freemium timing | **This document** |
| Zone 1 week UI (problem summary, ordered tasks, MasteryGate) | `2026-07-13-dashboard-v2-design.md` |
| Report/plan/LLM pipeline | `2026-07-10-learning-coach-agent-design.md` |

**Compatibility rule:** Generating a week plan must know `current_stage` + `exam_date` + report gaps. Weak skills **reweight** stage quotas; they do not replace the stage skeleton with an all-listening week unless the stage allows it.

---

## 7. Success criteria

1. New user never asked to pick HSK 1–9 while single-track.  
2. Marketing primary copy does not lead with ambiguous “HSK 3.0” as product scope.  
3. User with exam date D gets a stage timeline that ends in Sprint before D (when D − today is long enough).  
4. Free user can finish Week 1 without hitting the main Pro wall mid-week.  
5. Main Pro CTA triggers when Week 1 is complete (or equivalent “week cleared” state).  
6. Dashboard still answers “what do I do this week?” under the journey chrome.  
7. Journey outline shows upcoming week themes; execution unlocks only after prior week is cleared (see UX/brand design §5–6).

---

## 8. Non-goals (this spec)

- Shipping HSK Level 4–9 practice in this milestone  
- Fixed 14-week identical plans for all users  
- Primary conversion on first report view only  
- Requiring off-site placement (hskmock.com) to start the Coach  

---

## 9. Implementation notes (non-binding)

1. Profile fields: `exam_date` (nullable), `journey_horizon_weeks` (default), `current_stage`, remove/ignore target-level picker UI  
2. Placement artifact + wire into `run-coach` / snapshot  
3. Stage allocator service (pure function: dates + placement → stage calendar)  
4. Plan generator: stage quotas + gap weights  
5. Entitlements: Week 1 complete → Pro gate for week 2+  
6. Marketing/nav copy audit per §2.3  

---

## 10. Approval trail

- Full-journey Coach (not weekly-only top story) — confirmed  
- Single-track **product** = HSK Level 3; no 1–9 picker — confirmed  
- Naming: avoid leading with “HSK 3.0”; Level 3 / elementary framing — per positioning review 2026-07-13  
- Elastic stages by exam date — confirmed (reject fixed 14-week template)  
- **Primary Pro conversion after Week 1 completion** — founder preference locked 2026-07-13  
- **Outline visible + sequential week execution; Free W2+ behind Pro** — locked 2026-07-13 (UX/brand design)  
- Spec written 2026-07-13; §5 amended same day for sequential/outline rule  
