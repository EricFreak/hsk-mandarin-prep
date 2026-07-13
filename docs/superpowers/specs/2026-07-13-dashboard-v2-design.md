# Dashboard v2 — Product & UX Spec

- **Date:** 2026-07-13
- **Status:** Approved — design 2026-07-13; monetization A locked; Zone 1 + MasteryGate locked; **journey layer per full-journey positioning spec**
- **Scope:** Restructure logged-in Dashboard IA around the coach loop; Progress glance + Progress page; Past plans; mock history discoverability; **week-problem summary + priority-ordered tasks + post-task quality gate**
- **Layout approach:** Single-column stack (Approach 1)
- **Relates to:** Learning Coach (Phases A–E), practice session end, freemium gating, **`2026-07-13-full-journey-coach-positioning.md` (full-journey / single-track / Week-1 Pro gate)**
- **Monetization (locked):** **A — Report = conversion hook; full week plan + plan-driven practice + Progress/compare = paid main dish.** **Primary upgrade moment = after Week 1 tasks completed** (see journey positioning spec).

---

## 0. Journey layer (pointer)

Dashboard Zone 1 is the **weekly execution surface** of a **full-journey AI Coach** (HSK Level 3 single track; elastic stages by exam date).  

Normative positioning, onboarding, stage skeleton, and Free→Pro timing:  
**`docs/superpowers/specs/2026-07-13-full-journey-coach-positioning.md`**

Do not reintroduce an HSK 1–9 level picker on Dashboard. Optional chrome: journey stage label + days-to-exam (when `exam_date` exists).

---

## 0b. Monetization & trust (locked narrative A)

**Positioning line:** Mock-review coach — diagnose → this week’s tasks → re-test and compare.  
Not “buy two AI essays.”

| Layer | Role | Free | Pro |
|-------|------|------|-----|
| **AI report** | Trust + upgrade hook | Summary + **1 evidence-cited gap** | Full report |
| **Week 1 plan + practice** | Taste the Coach | **Complete Week 1** (primary Free runway) | — |
| **Week 2+ / journey continuation** | **Primary paid value** | Gated after Week 1 | Full stage quotas, continued weeks, plan-driven practice |
| **Progress / compare** | Proof that paying worked | Glance (limited) | Full Progress + comparison when shipped |

**Trust rules (product, not copy):**

1. Free gap must remain **evidence-checkable** (tie to mock/practice facts) — do not truncate away evidence to force upgrade.
2. Plan focus / top gap and **task rank #1** must stay coherent (see §4.1); tasks deep-link into practice.
3. Paywalls sit on **post–Week 1 continuation / locked journey weeks / full Progress**, not on Placement or completing Week 1.
4. Avoid “guaranteed pass” claims; promise updated prescriptions after each mock and tracked gap closure.
5. Differentiator vs HSK roadmap/题库 apps: **evidence-cited mock → plan → second-mock对照**, not official badge or question volume.
6. **MasteryGate** (quality threshold) must not be gameable via AI hints counting as mastery; Free cap is a product limit, not a skill judgment.
7. **Primary Pro conversion** after **Week 1 completion** — see full-journey positioning spec.

Research artifact: Cursor canvas `hsk-monetization-trust.canvas.tsx` (2026-07-13).

---

## 1. Problem statement

The Dashboard previously stacked CoachPanel, readiness-style progress, “Latest mock,” and mock history with **weak priority**. Learners need:

1. **Clear weekly problem** — what am I concentrating on this week (without Focus vs Top gap contradicting each other).
2. **Actionable week inventory** — all (visible) tasks, ordered by system priority; user may follow top→bottom or pick.
3. **Quality, not checkbox theater** — finishing a task must meet a mastery bar so practice yields real improvement.
4. **Trends & history findable** — multi-dim progress and mock archive without crowding the week surface.

**Goal:** Zone 1 = **understand this week’s problem → choose/start a priority-ordered task**; after each task, **MasteryGate** ensures the attempt was good enough; Progress glance + Latest mock stay secondary.

**Success metric for Zone 1 (updated):**  
Open Dashboard → know the week’s problem and the suggested order → start a task (usually #1) without decoding product jargon.  
*Not* “only one button on screen forever.”

---

## 2. Decisions (locked)

| Topic | Decision |
|-------|----------|
| Zone 1 job | **Orient + choose:** week-problem summary + **priority-ordered** full (visible) task list |
| System suggestion | **Order is the suggestion** (high→low). **No separate “Next up” hero card** |
| User agency | User may start **any Available** task; default path = top incomplete row |
| Focus vs Top gap | **One hierarchy:** Top gap = primary “this week’s problem”; other focus skills = *Also training* — never peer H2s that contradict |
| Rank invariant | **`PlanTask.rank = 1` must serve Top gap skill** (or equivalent primary gap) |
| Post-task quality | **MasteryGate** on session-end screen: Not yet (retry) / Passed / optional Challenge |
| Old week plans | Quiet **Earlier plans / Past plans →** (read-only archive) |
| Progress on hub | **Glance strip only** → Full progress page |
| Mock history on hub | **Latest mock** + **All attempts** (no history table on hub) |
| Layout | **Single-column stack** |
| Monetization | Narrative **A** (report hook / plan main dish) |

**Organizing principle:** Core loop `Assess → Interpret → Plan → Practice → Mastery check → (Re-assess)`.  
Visit modes share one hierarchy; no auto layout switch by “exam soon” in this version.

**Cost terminology (for design debates):**

| Term | Meaning | Zone 1 stance |
|------|---------|----------------|
| Learning cost (product) | Learning the UI/IA | Keep low via clear labels + stable layout |
| Decision cost | Choosing among actions | Cut via **priority order** + first-row emphasis — not by removing choice |
| Desirable difficulty | Effort that builds skill | Belongs **inside** tasks + MasteryGate — not in picking a list row |

---

## 3. Information architecture

### 3.1 Core objects

| Object | Owns | Lifecycle | Surfaces |
|--------|------|-----------|----------|
| **WeekPlan** | Active week; Focus / Top gap fields | `coach_study_plans`: one `active`; others `superseded` | Zone 1 summary |
| **PlanTask** | Ranked tasks (`rank` 1…n), status, pass marks | Belong to one WeekPlan | Zone 1 list |
| **TaskAttempt + Score** | One practice run + score evidence | Append-only per task | **Session-end screen** |
| **MasteryGate** | Policy: pass / challenge marks; onFail / onPass | Config per task type | Evaluated at session end |
| **Progress** | View over `coach_reports` | Append-only | Zone 2 + `/dashboard/progress` |
| **Attempts (mock)** | `mock_exam_attempts` | Immutable | Zone 3 + `/mock-exam/attempts` |

```
WeekPlan 1──* PlanTask
PlanTask 1──* TaskAttempt
TaskAttempt 1──1 Score
PlanTask ──> MasteryGate (policy)
WeekPlan ──> topGapSkill, alsoTrainingSkills[]
```

### 3.2 Dashboard zones (top → bottom)

```
┌─────────────────────────────────────────────┐
│ Zone 1 — This week                          │
│  This week’s problem (Top gap + evidence)   │
│  Also training: …                           │
│  Suggested order — start at top; any OK     │
│  Ranked task list (first incomplete strong) │
│  Earlier plans → (quiet)                    │
├─────────────────────────────────────────────┤
│ Zone 2 — Progress glance                    │
│  Readiness + Δ · skill ↑↓→ · Full progress  │
├─────────────────────────────────────────────┤
│ Zone 3 — Latest mock                        │
│  Score · date · Review · All attempts       │
└─────────────────────────────────────────────┘
  Plan badge / Upgrade — header or footer
```

**Does not belong on Dashboard body:**

- Separate “Next up” hero competing with the list
- Peer “Focus:” and “Top gap:” headlines with conflicting skill sets
- Full multi-series charts; superseded plan tables; full mock history table
- Long coach `summaryMarkdown`; MasteryGate score UI (that lives on **session end**)

### 3.3 Dedicated surfaces

| Route | Purpose |
|-------|---------|
| `/dashboard` | Three-zone hub |
| `/dashboard/progress` | Multi-dim trends from coach reports |
| `/dashboard/plans` | Past / earlier plans (read-only) |
| Practice / task session + **results** | Score + MasteryGate CTAs |
| `/mock-exam/attempts` | Full mock history |

---

## 4. Zone specifications

### 4.1 Zone 1 — This week

#### 4.1.1 Summary block (problem awareness)

**Primary line — This week’s problem (Top gap):**  
One skill + short evidence (from coach report gap #1 / plan primary gap).  
Example: `Listening detail — missed 4/6 on Sunday’s mock`

**Secondary line — Also training:**  
Remaining plan `focus_skills` (or supporting skills) that are **not** the top gap, demoted visually.  
Never present as an equal “Focus: L · V · G” H2 beside Top gap.

**Coherence rules:**

1. Nothing in the primary problem line that evidence cannot support.
2. **`PlanTask` with `rank = 1` targets the Top gap skill.**
3. If Focus includes skills beyond Top gap, they appear only under *Also training* / lower-ranked tasks.

#### 4.1.2 Task list (priority-ordered inventory)

- Show all **visible** tasks for the active plan (Free: truncated set — prefer tasks that close the week problem, not arbitrary first-N by raw insert order when implementing intentional truncation).
- **Sort = system priority** (high→low). Ordering **is** the suggestion.
- Helper copy (one line): `Suggested order — start at the top. Any task is fine.`
- **No “Next up” card.** First **incomplete / Available / Retry** row gets stronger visual weight (primary Start); other rows secondary Open/Start.
- Per row: human title; optional short meta (e.g. ~10 min · Listening); **status chip** (`Available` | `Retry` | `Passed` | `Challenge available`); one clear action.
- Do **not** expose raw schema jargon as primary UI (`day_offset`, `task_type` enums) — map to plain language if shown at all.
- Progress hint: e.g. `3 of 7 passed` (mastery-passed, not merely opened).
- Quiet link: **Earlier plans →** `/dashboard/plans`

#### 4.1.3 Behavior by coach status

| Status | Zone 1 |
|--------|--------|
| `none` | CTA → Take mock exam / get your plan |
| `pending` | Building your plan… (no fake tasks) |
| `ready` | Summary + ordered list as above |
| All visible tasks **Passed** | Congrats + suggest another mock / refresh coach |
| Free capped | Remaining tasks locked/preview + upgrade (product limit copy, not “you failed”) |

#### 4.1.4 Concrete example (ready)

```
THIS WEEK’S PROBLEM
Listening detail — missed 4/6 on Sunday’s mock
Also training: Reading · Grammar

Suggested order — start at the top. Any task is fine.
3 of 7 passed

1  Listening drill: detail questions     [Start]     ← emphasized
2  Review mistake bank                   [Open]
3  Reading skim set                      [Open]
…
Earlier plans →
```

---

### 4.2 Zone 2 — Progress glance

Unchanged intent:

- Readiness + Δ vs previous report; 3–4 skill chips (Free limited); **Full progress →**
- Upgrade emphasizes full week + full Progress (narrative A)
- Non-goals: percentiles, friend boards, hub charts

---

### 4.3 Zone 3 — Latest mock

- Latest attempt score + date; **Review**; **All attempts →**
- No history table on Dashboard

---

## 5. MasteryGate (post-task quality) — locked direction

**Purpose:** Ensure task completion reflects real improvement, not perfunctory checkbox clears.

**Where it lives:** **Session-end / results screen** after a plan task attempt. Dashboard only shows resulting **status chips**, not the full gate UI.

### 5.1 What the score measures

| Signal | Role |
|--------|------|
| Skill-tagged accuracy on the task’s target tags | **Primary** |
| Time | Soft signal only (rush/stall); **not** the pass bar alone |
| AI hint / coach-assisted answers | Must **not** inflate pass score |
| Mere completion / streak | Never the pass bar |

UI may show a simple **`N / 10`** (or percent) as a display of the same underlying evidence. Always pair with plain reason on fail (`Not yet — weak on [tags]`).

### 5.2 Threshold policy (normative defaults; calibrate per task type)

| Outcome | Condition (default) | User-facing | Primary CTA | Secondary |
|---------|---------------------|-------------|-------------|-----------|
| **Not yet** | Below pass mark (~**70–80%** skill-weighted; display e.g. &lt; 7/10) | `Not yet` — never “Failed” as identity | **Practice again** | Show 1–2 fix hints |
| **Passed** | At/above pass mark | `Passed` · locked into week | **Continue week** | **Push toward 10** (Challenge) |
| **Challenge** | Opt-in after pass; higher mark (~90%+) | Stretch / challenge | Complete challenge or skip | Never block Continue |

**Retry rules:**

1. Retry ≠ identical item grind when avoidable — regenerate / focus failed tags.
2. Allow limited immediate soft retries, then **space** (reappear later in week / next session) to avoid rage loops.
3. Cap forced attempts; then park + reschedule rather than infinite wall.
4. **Partial:** if some tags clear, may pass overall task and spawn a short tagged follow-up (implementation may stage this after MVP).

**Unscored task types** (e.g. rest; some flashcard modes): no fake /10 — completion / known-rate style → Continue only.

**Async scoring:** Show pending; allow navigation; resolve Pass/Retry when score lands — do not trap user in a spinner.

**Free plan:** Retries count toward visible/ quota rules; say so when relevant. Cap messaging is product limit, not shame.

### 5.3 Anti-patterns (do not ship)

- Infinite force-retry on the **same** item set with shame/red “FAIL”
- Hiding Continue behind mandatory Challenge
- Opaque scores with no skill reason
- Dashboard re-asking “did I pass?” with a second scoring UI
- Lowering the pass bar for Pro (Pro gets better diagnosis/challenge sets, not easier mastery)

### 5.4 Results screen example

```
Score  6 / 10
Pass at 7 · Not yet
Weak on: listening detail

[ Practice again ]
```

```
Score  8 / 10
Passed · locked into your week

[ Continue week ]
[ Push toward 10 ]
```

---

## 6. Progress page (full)

1. Readiness over time (per coach report)
2. Per-skill direction / series from report history
3. Gaps & strengths evolution (Free truncated + upgrade)

Empty → CTA to mock.

---

## 7. Past / earlier plans page

- Chronological plans: status, focus/top gap, task passed/total
- Read-only expand: task titles + mastery status
- No reactivate in this version

---

## 8. Empty & edge states

| State | Zone 1 | Zone 2 | Zone 3 |
|-------|--------|--------|--------|
| Never mocked | Take mock exam | Locked until coach | Empty + CTA |
| Mock done, coach running | Building your plan… | Prior glance if any | This attempt |
| Coach failed | Retry coach + mock | Prior glance if any | Latest |
| Plan ready | Problem summary + ordered list | Glance | Latest |
| Task Not yet | List shows Retry on that row | — | — |
| All visible Passed | Congrats + mock / refresh | Glance | Latest |
| Free capped | Lock/preview + upgrade | Glance | Latest |

---

## 9. Relationship to current implementation

**Prior Dashboard v2 spike** introduced glance/progress/plans routes and a This-week zone that still mixed Focus, Top gap, Next up, and full list.

**Target alignment:**

- Rewrite Zone 1 per §4.1 (hierarchy summary + ordered list; remove Next up hero)
- Add session-end MasteryGate per §5 (may land in a follow-on PR if scoring plumbing is incomplete — UI shell + rule-based MCQ score first)
- Keep Progress page + Past plans + Latest mock pattern
- Delete conflicting copy that implies Focus and Top gap are peer equal headlines

---

## 10. Success criteria

1. Populated Dashboard **first viewport** dominated by **week problem + ordered tasks** (not charts/history/Next-up duplicate).
2. Top gap and list **rank #1** tell the **same** primary skill story.
3. User can follow top→bottom **or** pick another Available task without a second hero CTA.
4. After a scored task, user hits **Not yet / Passed / optional Challenge** on results — checkbox-only complete without gate is insufficient for scored types.
5. Full mock history in ≤2 clicks (Latest → All attempts).
6. Multi-dim improve/decline on Progress with ≥2 coach reports.
7. Earlier plans reachable without a second plan list on the hub.
8. Free/Pro rules consistent with narrative A; mastery bar not secretly easier for Pro.

---

## 11. Non-goals (this version)

- Auto layout switching by “exam soon”
- Conversational coach chat on Dashboard
- Reactivating superseded plans
- Social / percentile comparisons
- Mandatory challenge mode
- DeepSeek-as-only-scorer before rule-based MVP gate exists
- Marketing / mock-taking / logo redesign

---

## 12. Implementation notes (non-binding)

Suggested order:

1. Spec-aligned Zone 1 UI (summary hierarchy + ordered list; remove Next up)
2. Enforce / migrate rank #1 ↔ top gap when generating plans
3. Progress glance + pages (if not already)
4. Past plans link/page
5. MasteryGate MVP: rule/MCQ score on practice end → statuses on PlanTask
6. Challenge mode + tagged partial pass + LLM scoring as follow-ons
7. E2E: open dashboard → start rank-1 task → fail gate → retry → pass → list status

---

## 13. Spec self-review

| Check | Result |
|-------|--------|
| Placeholders | Pass marks described as calibrate-able defaults (~70–80%); exact per-type tables left to implementation |
| Contradictions | Removed “single Start only” / “Next up hero” vs founder autonomy; success metric updated |
| Ambiguity | Score formula per task type to be detailed in implementation plan; objects and UX states are normative |
| Scope | Dashboard IA + MasteryGate direction included; full LLM scoring can phase after rule MVP |
| Commit | Update when founder requests |

---

## 14. Approval trail

- Clarifying: post-mock actions / past plans quiet link / glance + Progress page / latest + all attempts / single column — **approved** 2026-07-13
- Monetization narrative **A** — **locked** 2026-07-13; **primary Pro gate after Week 1** per full-journey positioning
- Full-journey / single-track Level 3 / elastic calendar / naming rules — **`2026-07-13-full-journey-coach-positioning.md`**
- Spec file updated — 2026-07-13
