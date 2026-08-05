# Full-Journey UX & Brand — Design Spec

- **Date:** 2026-07-13
- **Status:** Approved — founder confirmed 2026-07-13
- **Scope:** Brand/IA/visual chrome + full journey build (elastic stages, placement, MasteryGate, sequential week unlock)
- **Relates to:**
  - `2026-07-13-full-journey-coach-positioning.md` (positioning; freemium timing amended by §6 here)
  - `2026-07-13-dashboard-v2-design.md` (Zone 1 + MasteryGate UI)
  - `2026-07-10-learning-coach-agent-design.md` (report/plan pipeline)

---

## 1. One-line outcome

Ship **HSK Prep** as a full-journey Level 3 AI Coach: exam-dated stage calendar, weekly execution under a slim journey strip, sequential week unlock after mastery, with a always-visible journey outline of upcoming week themes.

---

## 2. Locked product shell

| Topic | Decision |
|-------|----------|
| Brand name | **HSK Prep** (nav). Full: HSK Mandarin Prep where legal/meta needs it |
| Tagline | *AI Coach for HSK Level 3* |
| Door line | *AI Coach for your first real HSK — not nine apps in one.* |
| Naming rules | Lead with **HSK Level 3** / first serious HSK. Do **not** lead marketing with “HSK 3.0”. “Aligned with HSK 3.0 / GF0025” → footer/FAQ only |
| Top nav | **Dashboard · Practice · Mock Exam · Pricing** (Approach A — keep three tools + journey chrome on Dashboard) |
| Journey chrome | **Slim strip** above Zone 1: stage dots + days-to-exam (not a journey hero) |
| Visual | **Refine current** — jade / seal / paper / 考 seal asset; tighten hierarchy; fewer loud cards |
| Implementation scope | **Full journey build (B)** — surface + elastic stage engine + MasteryGate + placement artifact |

No HSK 1–9 level picker while product is single-track Level 3.

---

## 3. Information architecture

### 3.1 Global

```
Marketing (public)
  └─ HSK Prep brand + Level 3 Coach story

App
  ├─ Dashboard     ← journey slim strip + Zone 1 week + glance links
  ├─ Practice      ← standalone + plan-task deep links
  ├─ Mock Exam     ← full mock / sprint assessment
  └─ Pricing

Secondary (from Dashboard, not top nav)
  ├─ Progress
  ├─ Past plans
  └─ Learner journey outline (may live on Dashboard expand or /dashboard/journey)
```

### 3.2 Onboarding (no level picker)

1. Account create  
2. **Exam date** (or “not sure” → default ~12-week horizon, editable later)  
3. **Placement** (in-app Level 3 short diagnostic)  
4. AI report (Free: truncated + 1 evidence-cited gap)  
5. Initialize `learner_journey` + generate **Week 1**  
6. Land Dashboard: slim strip + Zone 1

---

## 4. Journey engine

### 4.1 Stage skeleton (fixed order)

1. **Diagnose** — placement + first report + Week 1 bootstrap  
2. **Foundation** — vocab + grammar weighted; listening/reading support  
3. **Skills** — listening + reading + writing more balanced  
4. **Sprint** — mocks + mistake review; stop piling new modules  

### 4.2 Elastic allocation (deterministic, testable)

**Inputs:** `exam_date` (or default horizon), placement/report strengths, optional `minutes_per_day`.

```
horizon_days = exam_date − today
Sprint   = last 14–28 days when horizon allows (~20% capped); compress if short horizon
Diagnose = short fixed window (~3–7 days); not stretched by weak skills
Remainder → Foundation : Skills (short horizon compresses Foundation; long horizon lengthens both)
```

Weekly plan generation:

```
week_plan = stage_skill_quotas[current_stage]
          × density(minutes_per_day)
          × gap_reweight(coach_report)
```

**Invariant:** Weak skills **reweight** quotas; they do **not** replace the stage skeleton (e.g. Foundation weeks stay vocab/grammar-led).

### 4.3 Data concepts

| Entity | Role |
|--------|------|
| `learner_journey` | `exam_date`, horizon flags, `current_stage`, stage date ranges, `current_week_index` |
| `journey_week_outline[]` | Ordered weeks: `week_index`, `stage`, **theme summary** (e.g. “Vocabulary focus”), status `locked \| available \| passed` |
| `week_plan` / `plan_tasks` | Executable tasks for the **available** week only (detail generated when week unlocks or at W1) |

Slim strip reads `current_stage` + days-to-exam from real journey state — no decorative fake progress.

### 4.4 Regeneration triggers

| Event | Effect |
|-------|--------|
| Onboarding complete | Journey + outline + Week 1 tasks |
| Week N cleared (all required tasks Passed) | Unlock Week N+1 execution; generate/materialize that week’s tasks |
| New mock → new report | Reweight **unlocked / in-progress** week; may **update outline themes** for future weeks; Passed weeks stay read-only archive |
| Exam date edited | Recompute stage ranges + future outline; do not rewrite Passed weeks |

---

## 5. Learner journey outline vs execution (founder lock)

**Two layers:**

| Layer | Visibility | Content fidelity |
|-------|------------|------------------|
| **Outline** | Always visible in learner journey UI (Free and Pro) | **Theme / skill-quota level** only — e.g. “Week 1 · Vocabulary”, “Week 2 · Grammar”, “Week 3 · Listening”. Not full task lists or item counts for locked weeks |
| **Execution** | Only the **current available** week’s tasks on Dashboard Zone 1 | Full ranked tasks + MasteryGate |

**Sequential unlock (all users):**

```
Week N becomes available only when Week N−1 is cleared
  (all required plan tasks Passed / week-cleared equivalent)
Week 1 available after placement + plan generation
No skipping ahead to execute Week N+2 while N+1 is locked
```

Optional later: “补练” on a past week does **not** advance `current_week_index`.

**Why outline is coarse:** Avoid promising exact drills that the engine may change after a mock reweight; themes can update with a quiet “Updated after your last mock” note.

---

## 6. Freemium (amends positioning §5)

> **2026-07-16 修订：** 本节「Week 1 → Pro 解锁 W2+ / 月费叙事」已被  
> [`2026-07-16-unit-time-fair-pricing-scheme.md`](./2026-07-16-unit-time-fair-pricing-scheme.md)（**Locked**）取代为：  
> **Coach-day 单价 R** · **Runway pack** · **exam_sprint 每账号 lifetime 一次 Free**。  
> 下表保留作历史基线对照；实施与冲突裁决以定价终案为准。

Narrative A retained: report = trust hook; continued journey execution = paid main dish.

| Capability | Free | Pro |
|------------|------|-----|
| Placement + onboarding | ✅ | ✅ |
| First report | Truncated + 1 evidence gap | Full |
| Journey **outline** (themes) | ✅ visible | ✅ visible |
| **Week 1 execution** | ✅ complete the week (MasteryGate applies) | ✅ |
| **Primary upgrade moment** | After Week 1 cleared | — |
| **Week 2+ execution** | Locked behind Pro (outline still visible) | Sequential unlock continues: clear Wn → execute Wn+1 |
| Progress compare / mock volume | Per existing entitlements | Full per entitlements |

**Composite rule (normative):**

> Outline is always visible. Execution is strictly sequential by Passed weeks. Free may execute Week 1 only; after Week 1 is cleared, the primary CTA unlocks Pro so Week 2+ execution can continue under the same sequential rule.

Paywalls must not interrupt Placement or calm completion of Week 1.

---

## 7. Placement artifact

| Layer | Role |
|-------|------|
| Placement | In-app Level 3–aligned **short diagnostic** (evolve from mock template) |
| Full mock | Deeper assess / Sprint |
| Official samples | FAQ / chinesetest.cn links — not primary onboarding hop |

Placement → snapshot → Coach report → journey init → Week 1.

---

## 8. MasteryGate (execution quality)

Per Dashboard v2 §5 (normative):

- Lives on **session-end**; Dashboard shows status chips only  
- Skill-weighted accuracy primary; ~70–80% → Passed; else Not yet + Practice again  
- AI hints must not inflate pass  
- Challenge optional; never blocks Continue week  
- MVP: rule/MCQ scoring first; async score may resolve after navigate  

Week cleared = required tasks Passed (Challenge optional).

---

## 9. Visual / brand polish (refine current)

| Keep | Tighten |
|------|---------|
| Jade primary, seal accent, paper ground, 考 seal | Less card chrome; quieter paper; stronger type hierarchy |
| Display serif for brand moments | App chrome stays readable sans |
| Existing hero/avatar assets | Audit copy that leads with “HSK 3.0”; replace with Level 3 / Coach |

Marketing + app share tokens; no purple/glow redesign; no new visual system in this milestone.

---

## 10. Key screens (build targets)

1. **Onboarding** — exam date → placement → report → Dashboard  
2. **Dashboard** — slim journey strip + Zone 1 + link to journey outline  
3. **Learner journey** — full week theme outline; current week highlighted; locked weeks show theme only  
4. **Practice session end** — MasteryGate  
5. **Week 1 cleared** — celebration + Pro CTA (Free); Pro continues to Week 2 tasks  
6. **Marketing** — HSK Prep + Level 3 Coach naming pass  

---

## 11. Non-goals

- HSK Level 4–9 tracks in this milestone  
- Fixed identical 14-week PDF for every user  
- Primary conversion on first report view only  
- Off-site placement as required first step  
- Pixel-new brand system / Cool Coach / seal-led redesign  
- Generating full task detail for all future weeks at onboarding  

---

## 12. Success criteria

1. New user never picks HSK 1–9.  
2. Primary marketing does not lead with ambiguous “HSK 3.0” product scope.  
3. Exam date D yields Sprint before D when horizon allows.  
4. Free user can finish Week 1 without mid-week Pro hard-stop.  
5. Free user sees outline for Week 2+ but cannot execute until Pro (after W1 clear).  
6. Pro (and Free within W1) cannot execute Week N+1 until Week N is cleared.  
7. Dashboard still answers “what do I do this week?” under the slim strip.  
8. Same `(exam_date, report)` → same stage allocation in unit tests.

---

## 13. Implementation notes (ordering hint)

1. Profile / `learner_journey` + outline model  
2. Pure stage allocator + tests  
3. Plan generator: stage quotas × gap weights; materialize tasks on unlock  
4. Placement short paper + wire into coach run  
5. Dashboard slim strip + journey outline UI  
6. MasteryGate session-end MVP  
7. Entitlements: sequential week + Free W2+ Pro gate  
8. Naming / copy audit  

Decompose into multiple PRs if needed; this spec is one design unit, not one mandatory mega-PR.

---

## 14. Approval trail

| Decision | Status |
|----------|--------|
| Brand = HSK Prep + Level 3 Coach tagline | Locked (brainstorm A) |
| Nav = keep Dashboard · Practice · Mock | Locked (A) |
| Journey chrome = slim strip | Locked (A) |
| Visual = refine current | Locked (A) |
| Scope = full journey build | Locked (B) |
| Design §§1–3 (shell, engine, placement/MasteryGate/Pro) | Founder OK |
| Outline always visible; execution sequential by Passed week; Free W2+ = Pro after W1 clear | Founder lock 2026-07-13 |
| Spec written | 2026-07-13 |
