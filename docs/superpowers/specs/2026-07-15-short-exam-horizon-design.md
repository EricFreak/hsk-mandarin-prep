# Short exam runway — Product / UX / IA 方案（JUX-003）

- **Date:** 2026-07-15  
- **Status:** 讨论底稿 · **规范请以** [`2026-07-15-plan-shape-focus-product-scheme.md`](./2026-07-15-plan-shape-focus-product-scheme.md) **为准**  
- **Backlog:** `2026-07-15-journey-ux-fix-backlog.md` → JUX-003  
- **约束：** 可新增产品分支；不复活 Waiting Room；用户里程碑 ≠ 后端任务；Free 主转化点仍在「完整 Week 1（或等价）清关后」

---

## 0. 文档结构说明

| 章节 | 内容 |
|------|------|
| §1–§9 | 专家团初版推荐（按距考自动分桶）— **仅作对照，你暂未锁定** |
| **§10** | 你的反提案：短跑道把选择权还给用户（Auto vs 自选突击焦点） |
| **§11** | 专家团对你提案的正式评审意见 |

---

## 1. 三席会诊结论（初版 · 对照用）

| 角色 | 裁决 |
|------|------|
| **产品** | 极短考期不能硬套「多周完整旅程」。新增明确分支：`plan_mode = standard \| compressed \| exam_sprint`。用考期距离分桶，**禁止**再用 `max(21天)` 把假跨度盖在真实考期上。 |
| **UX** | 选完日期当场诚实：短跑道要有 **one-beat 告知**（不是恐吓）。主界面文案跟模式一致（Sprint ≠ “Week 12 of foundation”）。 |
| **信息架构** | Setup 仍：偏好 → 诊断 → 家。差别在 **家之后的旅程铬**：Sprint 模式弱化多阶段点阵，强化「距考 N 天 + 今日突击任务」。诊断仍做（校准弱点），不因短考期跳过诊断。 |

**初版推荐：三档分桶 + 考前 Sprint 专用分支。** 你不同意「短档完全由系统静默决定内容」——见 §10–§11。

---

## 2. 问题本质（现状为何不合理）

当用户选「明天考」时，现行逻辑会：

1. 接受真实 `target_exam_date`；  
2. `allocateStages` 却用 `total = max(21, 距考天数)` **假装至少约 3 周**拆 diagnose/foundation/skills/sprint；  
3. 阶段窗终点又钉在真实考期 → **日历自相矛盾**。

产品谎言：界面写 to exam = 1 day，内部却在规划 3 周结构。用户会觉得 artificial 或坏掉。

---

## 3. 推荐产品分支：`plan_mode`

用 **距考日历日** `D = examDate - today`（本地时区日，实施时再钉；方案层按「整日」理解）：

| `plan_mode` | 条件 | 用户一句话 | 系统承诺 |
|-------------|------|------------|----------|
| **standard** | `D ≥ 21` **或** I'm not sure（12 周代理） | 完整备考旅程 | 现行弹性阶段 + 多周大纲（unsure 仍走 12 周，文案走 JUX-001） |
| **compressed** | `7 ≤ D ≤ 20` | 时间紧，压缩旅程 | 阶段仍在，但总跨度 = 真实 D（**禁止 floor 到 21**）；周大纲约 1–3 周 |
| **exam_sprint** | `1 ≤ D ≤ 6` | 考前突击 | **不假装多周旅程**；诊断后生成「考前 N 日突击计划」 |

`D = 0`（今天考）并入 **exam_sprint**，文案改为 “Exam today”。  
过去日期 → 归 **JUX-002**（选择器禁选），本方案不处理。

### 3.1 `exam_sprint` 行为（新分支）

**仍走通：** Onboarding → Diagnosis →（score）→ Dashboard 家。

**生成物改变：**

- 不写「foundation → skills → sprint」四段长日历；  
- `stage_calendar` 可收敛为 **单窗** `{ stage: "sprint", start: today, end: examDate }`（或 diagnose 1 天 + sprint 剩余）；  
- 周大纲：**1 个可执行块**（可称 Week 1 / Exam sprint，对内 `current_week_index = 1`）；  
- Coach：任务密度按剩余天数排「今日优先」的弱点突击（仍可走现有任务类型：practice / flashcards / mistakes；可选轻量 mock section，**不**默认要求再考完整 mock——时间不够）。

**Freemium：**

- Free：**整段突击内容可执行完**（等价于「给满这一程」，不因天数短再砍半）；  
- 突击清关（`w1_cleared_at` 或新戳 `sprint_cleared_at`，实施时二选一，优先 **复用 w1_cleared_at** 降低分叉）后：主 CTA 仍可是 Pro（下一场完整旅程 / W2+），避免在诊断或突击中途爆主转化。

**考期过后（可选但推荐的小钩）：**

- 若 `today > target_exam_date` 且尚未重设考期：Dashboard 一条产品提示  
  “Exam date has passed — set your next date or switch to a 12-week plan.”  
- 不自动静默改成 unsure；要用户确认一拍。

### 3.2 `compressed` 行为

- `allocateStages`：**`total = max(D, 下限可议，建议 ≥7 且 ≤D)`，禁止 `max(21,D)`**；  
- 阶段比例保留，但全部压进真实考期内；  
- 周数 ≈ `ceil(D/7)`；Free 仍先吃满 Week 1。

### 3.3 `standard` 行为

- 保持现网长旅程算法（可继续用 ≥21 的舒适分配）；  
- unsure：代理终点 = today+12×7，**展示文案跟 JUX-001 对齐**（不写假 “to exam”）。

---

## 4. UX：one-beat 与持续铬

### 4.1 Onboarding 提交时（选了具体短日期）

在进入 Diagnosis **之前**插一拍确认（与「有日期又点 unsure」同级的诚实拍）：

| 模式 | 标题意图 | 用户动作 |
|------|----------|----------|
| compressed | “Your exam is in N days — we’ll build a **compressed plan**, not a full multi-month journey.” | Continue / Pick another date |
| exam_sprint | “Your exam is in N days — we’ll build an **exam sprint** after a short diagnosis. This won’t look like a long weekly roadmap.” | Continue / Pick another date |

不恐吓、不推销 Pro。

### 4.2 Dashboard / Journey 铬

| 模式 | Journey strip | Full journey |
|------|---------------|--------------|
| standard | 现有阶段点 + 天数（有真考期） | 多周 outline |
| compressed | 阶段点可保留但标注 Compressed | 1–3 周 outline |
| exam_sprint | **弱化多点阵**；主信息：`Exam sprint · N days left` | 单页「突击日程」或极短列表，不假装 12 周地图 |

### 4.3 Diagnosis

三档都保留诊断。Sprint 成绩页主 CTA 文案可改为 “Open your exam sprint” / “Open dashboard”（与 Building sprint plan 对齐），避免 “Week 1” 在 2 天场景里违和——若实现成本高，首版 Dashboard 统一用 “Your plan”，Sprint 在 strip 区分即可。

---

## 5. 信息架构位置

```
Onboarding(exam date)
  ├─ [若 short] Confirm beat (compressed | exam_sprint)
  └─ Diagnosis  (校准，不分叉跳过)
        └─ Dashboard
              ├─ standard / compressed → 旅程 strip + 周任务
              └─ exam_sprint → Sprint strip + 突击任务（仍是同一 Dashboard 家）
```

- **不新开** `/sprint` 顶级导航（避免工具膨胀）。  
- Sprint 是 **plan_mode 状态**，不是新 app 栏目。  
- Pricing / Free 转化钩仍挂在「这一程突击或 Week1 清关后」。

---

## 6. 刻意否定的备选

| 备选 | 为何否 |
|------|--------|
| 短于 21 天禁止选日期 | 赶考用户是真实流量；硬拒伤门；应用分支而非关门 |
| 短考期跳过诊断 | 越短越需要弱点校准；跳过会瞎突击 |
| 继续 `max(21)`  internally | 制造自相矛盾日历（当前 bug 模式） |
| Sprint 单独成「等待页」 | 违反闭环学说：异步是状态不是场地 |
| 短考期立刻主推 Pro | 破坏「一程用满再转化」；Sprint 给满 Free |

---

## 7. 数据与实现触点（方案层，非整活）

| 字段/点 | 意图 |
|---------|------|
| `learner_profiles.plan_mode` 或运行时由 D 推导 | 可先 **运行时推导**（少迁移）；若要审计历史再落库 |
| `allocateStages(total)` | compressed/standard 分支；sprint 走另一 builder |
| Onboarding API | 返回 `plan_mode` + 可选 `needsConfirm`；或纯前端按日期算完再确认一拍后提交 |
| JourneyStrip / 成绩页文案 | 读 mode |
| Freemium 清关戳 | **优先复用 `w1_cleared_at`** |

阈值边界（供锁库）：**21 / 7** —— 可按教研再调，但需要一条产品线，避免无穷档。

---

## 8. 验收场景（锁方案后）

1. D=1 → 确认拍 → 诊断 → Dashboard 为 Exam sprint，无 3 周假阶段；任务跨度 ≤ 考期。  
2. D=10 → compressed，周数合理，阶段 end ≤ examDate。  
3. D=40 → standard，行为接近现网。  
4. unsure → standard+12w 代理，且不说假 “to exam”（JUX-001）。  
5. Free 做完突击清关 → 出现 Pro CTA，中途无强制付费墙挡诊断。

---

## 9. 待你锁的决策（初版 · 现已部分过时）

初版四问仍可参考时间阈值；**内容策略已被 §10 原则改写**。锁定前 **不改生产代码**。

---

## 10. 你的反提案（原则：把选择权交给用户）

> **不动：** `standard` 可按初版完整旅程方案走。  
> **短跑道（原 compressed / exam_sprint）：** 不单靠「系统替你安排一切」，而支持用户在两种内容策略里选：

| 用户策略 | 用户心态 | 系统行为 |
|----------|----------|----------|
| **A · Coach-led（听建议）** | 时间短，也不知道该干什么 | 诊断后由系统按薄弱项 **自动建议** 突击计划，占满剩余时间 |
| **B · Focus-led（我来定焦点）** | 就是来突击的，目标明确 | 用户选定一项或多项内容（技能/题型等），**剩余时间全部砸在所选焦点上** |

分桶「standard vs 短跑道」仍可用（日历诚实：禁止假 21 天）。**短跑道内部的内容主权** → 交给用户二选一（可再改焦点，需产品定是否允许考期前重选）。

---

## 11. 专家团评审意见（针对 §10）

### 11.1 总评

| 角色 | 态度 | 一句话 |
|------|------|--------|
| **产品** | **原则同意，建议采纳方向** | 「选择权给用户」补上了初版最大漏洞：短考期用户里混着「无助」和「有主见」两种人，静默自动排期会得罪后者。 |
| **UX** | **同意，附带交互纪律** | 二选一必须在诊断**之后**出现（先有数据再谈建议/自选）；选项要短、可比，禁止再建第三套迷你课程目录吓跑用户。 |
| **信息架构** | **同意，主张「策略轴」正交于「时长轴」** | `plan_mode`（standard / short）管日历形状；`focus_strategy`（coach_led / user_focus）管任务怎么填。两轴正交，比把六种排列做成平行产品线更清晰。 |

**结论：§10 应升为短跑道的产品主原则；初版 §3 的「系统独自塞满突击内容」降级为 coach_led 默认路径之一，而非唯一路径。**

---

### 11.2 产品席：赞成什么 / 卡什么

**赞成**

1. **用户分层真实：** 无助者需要 Coach-led；自知者（「我就练听力/阅读」）需要 Focus-led，否则会感到产品在抢方向盘。  
2. **与品牌一致：** AI Coach = 建议权，不是剥夺选择权；短跑道更要尊重「我只有 N 天」。  
3. **可与 Freemium 共存：** 两种策略都是「给满这一程」；转化点仍放在清关后，不在二选一墙上付费。

**必须守住的边界**

1. **诊断不可跳：** 即使 Focus-led，也应先诊断再选焦点——否则「全砸听力」可能建立在错误自我认知上；允许用户 **忽略建议、仍选自己的焦点**，但不建议允许「跳过诊断直接自选」。  
2. **Focus 目录要可控：** 选项应来自 **诊断已暴露的技能/版块**（如 listening / reading / writing / vocab 等现有枚举），加可选「跟 Coach 建议一致」快捷项；不要开放自由文本「我想学茶艺」。  
3. **「全部时间都放到所选内容」要可执行：** 技术上 = 任务生成时 skill 权重 ≈ 100% 落在所选集合；仍要保留极少「恢复/混合」缓冲是否允许——产品建议 **首版允许 100% 纯度**（兑现承诺），若教研反对再加 10% 机动。  
4. **多选焦点时的时间分配：** 用户选 2–3 项时，默认 **均分剩余时间**；进阶才开放百分比（首版可不出百分比 UI，防复杂）。  
5. **Standard 不强制这套二选一：** 长旅程仍 Coach 编排；避免每个用户多一次决策疲劳。短跑道（D < 21 或你定的短档）才出现策略选择。

**风险**

| 风险 | 缓解 |
|------|------|
| 决策点过多（日期 → 确认短计划 → 诊断 → 再选 A/B → 再选焦点） | 合并拍：短日期确认里只诚实说「接下来会让你选听建议或自选焦点」；真正 A/B 放在 **诊断结果页**（信息最大处） |
| Focus-led 选错焦点考砸 | 结果页用 Coach 建议作 **默认高亮**，自选是显式切换；文案：「You can override」 |
| Free/Pro 纠缠 | 焦点选择 **不对 Free 上锁**；否则「选择权」变味 |

---

### 11.3 UX 席：流程与文案纪律

**推荐决策落点（IA + UX）**

```
Onboarding(date) → [若短] 轻提示「时间紧，诊断后你会选择跟建议或自选突击」
    → Diagnosis
    → 结果页 / 进入 Dashboard 前的一拍：
         ○ Get a coach plan from my results     ← coach_led
         ○ I’ll choose what to drill            ← user_focus
              → 若 B：焦点芯片多选（来自诊断技能）
    → Building plan… → Dashboard
```

**文案原则**

- A：强调「based on your diagnosis」  
- B：强调「all remaining time on what you pick」——必须能兑现，否则勿写 all  
- 避免：Quiz / Mode 1 / Mode 2 / Agent vs Manual 等内部词  

**铬**

- Coach-led：strip 可显示 「Coach sprint · based on gaps」  
- Focus-led：strip 显示 「Focus · Listening + Reading」（所选标签）  
- 两种都不要复活 Waiting Room；生成中仍是 Dashboard 状态横幅  

**允许中途改策略吗？**  
首版建议：**计划生成后至考期前可「Change focus」一次入口**（Dashboard 次要链），避免锁死；不做每日换焦（任务系统会被抽空）。

---

### 11.4 信息架构席：模型建议

```
时长轴 plan_shape:
  standard | short          ← 由 D 或 unsure 推导（日历诚实）

内容轴 focus_strategy:      ← 仅 short 必选；standard 隐含 coach_journey
  coach_led | user_focus

user_focus_skills: string[]  ← 仅 user_focus；⊆ 诊断技能集合
```

- **Dashboard 仍是唯一家**；不按策略拆路由。  
- Full journey outline：short 形态仍是短列表；Focus-led 的「周主题」= 用户焦点，不写成假 foundation。  
- 初版里 compressed vs exam_sprint 的 **铬差异可保留为 short 的呈现密度**（D≤6 更像突击条，D=7–20 略像压缩周），但 **内容轴统一用 focus_strategy**，不要做成 2×2 四套互不相通的产品。

---

### 11.5 专家团修订后的推荐形状（仍待你锁）

1. **Standard：** 初版完整旅程（可吸收 JUX-001 文案）。  
2. **Short（合并原 compressed + exam_sprint 的内容问题）：**  
   - 日历：跨度 = 真实 D，禁止假 21；  
   - 诊断后用户选 **Coach-led** 或 **Focus-led**；  
   - Focus-led → 多选诊断技能，时间 **全部**（或你拍板的纯度）投入所选。  
3. **可选呈现差：** D≤6 用更狠的 Sprint 铬；不强制两套不同任务引擎。

### 11.6 仍要你拍板的题（部分已由你回复）

| # | 题 | 你的裁定（2026-07-15） | 专家后续 |
|---|-----|------------------------|----------|
| 1 | Short 的 D 阈值 | （未锁） | 仍待你定 |
| 2 | A/B 是否诊断后 | （未锁；专家仍荐诊断后） | 仍待你定 |
| 3 | Focus 多选均分？ | **否。** 全 HSK3 范畴 + **自定义比例 Σ=100%**；自选后可退回系统推荐（§12.1.5） | **已写入 §12.1** |
| 4 | 生成后 Change focus？ | **否：不允许在现有方案上调整**；若要改 → **走自定义流程** | **已锁进 §12.2**（流程设计你已同意） |

---

## 12. 你的增量裁定 + 专家团落地设计（2026-07-15 下午）

### 12.1 Focus 时间分配 — 你的裁定（覆盖「主/次」与「均分」）

**你的裁定（2026-07-15）：**

1. 允许用户选择 **HSK Level 3 考试相关的全部范畴**（见下方范畴表）。  
2. 用户为各范畴设定 **自定义时间比例**。  
3. **所有已启用范畴的比例之和必须 = 100%**（校验失败不可生成）。  
4. **否决** 多选均分；**否决** 仅「主+次」偷懒模型（已被本裁定取代）。

**专家团接收意见：** 同意。这比主/次更符合「选择权在用户」；100% 约束让「把时间都花在所选上」可验证、可验收。

#### 12.1.1 范畴目录（与现网 Coach / HSK3 技能对齐）

首版可分配范畴 = 产品已在用的 HSK Level 3 技能维（报告与配额同一套命名）：

| 范畴 ID | 对用户展示（建议） | 说明 |
|---------|-------------------|------|
| `listening` | Listening | 试卷听力域 |
| `reading` | Reading | 试卷阅读域 |
| `writing` | Writing | 试卷书写域 |
| `vocabulary` | Vocabulary | 词汇（贯穿三卷、SRS/练习权重） |
| `grammar` | Grammar | 语法（贯穿练习权重） |

- **允许：** 只勾其中一部分，勾中项比例之和 = 100%；未勾 = 0%，不占时间。  
- **允许：** 单项 100%（真·all-in）。  
- **不允许：** 勾了却不填、填了和不等于 100、负数、或目录外自由文本。

*若你希望「范畴」严格等于试卷三大节（仅 listening/reading/writing），把 vocabulary/grammar 去掉即可——当前按代码里 HSK3 五维技能给全集合；你可改成三节。*

#### 12.1.2 数据形状（方案层）

```
focus_allocation: Array<{ skill: Hsk3Skill; percent: number }>
  // 仅包含 percent > 0 的项
  // Σ percent === 100
  // skill ⊆ { listening, reading, writing, vocabulary, grammar }
```

任务 / Coach 生成：按 percent 权重抽题与排 day tasks；验收用「计划内任务的 skill 分布 ≈ 比例」（允许小误差，方案验收可定 ±5% 或按任务计数四舍五入）。

#### 12.1.3 UX 要点（聚焦交互）

- 诊断后若选 Focus-led：进入 **分配板**（五维滑条或步进器 + 实时总和）。  
- 总和 ≠ 100%：「Totals 87% — adjust to 100%」主按钮禁用。  
- 快捷：**Use coach suggestion**（一键灌入诊断薄弱排名比例，仍可再改）——是快捷方式，不是夺走选择权。  
- 自定义重规划（§12.2）里 Focus-led **同一套分配板**，不另发明第二种。

#### 12.1.4 与 §12.2 的关系

第四点不变：分配板只在 **首建 Focus-led** 或 **Custom replan → Focus-led** 出现；**禁止**在 active 计划上就地拖滑条改比例。

#### 12.1.5 自选结束后允许退回「系统推荐计划」（你的裁定）

**裁定（2026-07-15）：** 用户做完 Focus 自选（范畴 + 比例）之后，仍须能 **退回**，改为按 **系统推荐（Coach-led）** 执行。范畴保持五维，不改成三维。

**专家落地（两处出口，语义一致）：**

| 时机 | 行为 |
|------|------|
| **生成前（向导内）** | 分配板 / 确认生成页提供明确出口：`Use coach recommendation instead`。效果：丢弃本次自选比例，回到 **Coach-led**，按诊断生成系统建议计划。 |
| **生成后（已有 Focus 计划在执行）** | **仍不**在旧计划上打补丁。走 §12.2 **Custom replan** → 选 **Coach-led** → 新计划替换；确认文案写明将作废当前自选方案。 |

**UX：** 向导内退回低摩擦；执行中退回必须经自定义重规划确认拍。系统推荐侧展示「基于诊断」摘要。

**IA：** `user_focus` → `coach_led` 只允许发生在 **尚未 active 的向导会话** 或 **replan 整单生成**；不出现半自选半系统的脏状态。


### 12.2 生成后不允许「在现方案上改」— 自定义重规划流程

**原则（按你的话落地）**

1. 当前短跑道方案一旦 **Building plan 成功并落库**，视为一份 **冻结的执行契约**。  
2. **不允许：** 在同一份 plan/tasks 上改焦点比例、勾掉任务类型、换技能标签却沿用旧周计划。  
3. **允许：** 用户主动进入 **Custom replan（自定义重规划）** —— 这是 **新流程、新生成**，旧方案归档/作废，不「打补丁」。

#### 12.2.1 入口（IA）

| 位置 | 行为 |
|------|------|
| Dashboard（short 模式） | 次要链接：**“Start a custom plan”** / **“自定义计划”**（非主 CTA） |
| 不在 | 任务行内「换技能」、Strip 上隐形编辑 |

主路径仍是执行当前任务；自定义是逃逸舱，不抢「今日主按钮」。

#### 12.2.2 流程（端到端）

```
[Dashboard · 当前方案冻结中]
        │
        ▼ 用户点 “Start a custom plan”
[确认拍 · Abandon current plan?]
  文案意图：将结束当前突击/压缩计划并生成一份新的；进度按「新计划」重算，不把旧任务改名凑合。
  动作：Cancel（回 Dashboard）| Continue
        │
        ▼ Continue
[策略选择 · 与首建相同的内容轴]
  ○ Coach-led — 按（已有）诊断结果让系统重排
  ○ Focus-led — 我指定主焦点（+可选次焦点）
        │
        ├─ Coach-led ──────────────────────────────┐
        │                                            │
        └─ Focus-led → [选 Primary (+ optional Secondary)]
                         （规则见 §12.1，非均分）     │
                                                     ▼
                                        [可选] 复用最近诊断 / 「重新诊断」
                                           默认：复用（省时间）
                                           显式：Re-run diagnosis → /diagnosis
                                                 完成后再回到生成
                                                     │
                                                     ▼
                                        [生成新计划 · Dashboard 状态横幅]
                                           旧 plan → archived / superseded
                                           新 plan → active；journey/sprint 契约换新
                                                     │
                                                     ▼
                                        [Dashboard · 只执行新契约]
```

#### 12.2.3 产品规则细节

| 规则 | 说明 |
|------|------|
| **诊断** | 自定义默认 **复用** `diagnosis` 结果；提供「重新诊断」给觉得水平变了的人。不强迫每次自定义都重考。 |
| **时长轴** | 仍按 **此刻** 距考 D 计算 short/standard；若 D 已进入 standard 区间，自定义可升格为标准旅程生成（诚实跟日历）。 |
| **旧任务** | 标记 superseded，不在 Zone1 展示；不删审计痕迹（便于支持/调试）。 |
| **清关 / Freemium** | 新计划是新一程；`w1_cleared_at` 策略：**自定义重开则视为新的「一程」执行**——若旧程未清关，清关戳不自动保留「已转化」态（避免用旧清关骗过 Pro 墙）。若旧程已清关，自定义不重置付费态（Pro 仍 Pro；Free 已清关仍停在转化逻辑，由你后续可再细调）。**首版建议：自定义不影响 `profiles.plan`；只重置执行计划与未完成的清关进度。** |
| **次数** | 不设人为次数墙（选择权）；防刷可仅限「同时只能有一份 active plan」（本流程已保证）。 |
| **生成中** | 同现网：Dashboard 状态，无 Waiting Room。 |

#### 12.2.4 UX 文案意图（英文产品语气）

- 入口：`Start a custom plan`  
- 确认：`This replaces your current plan. Your new plan will be built from scratch.`  
- Coach-led：`Build a new plan from my diagnosis`  
- Focus-led：`Choose what to drill — most or all time on your primary focus`  
- 次焦点（若保留主/次）：`Optional secondary (smaller share of time)` —— **禁止**出现 “split equally”。

#### 12.2.5 信息架构小结

```
focus_strategy: coach_led | user_focus     （短跑道首建 + 每次自定义）
user_focus_primary / user_focus_secondary （禁止多选均分数组）
plan_lifecycle: active | superseded
replan_flow: / 独立步进（可用同一 Dashboard 上的向导叠层或 /plan/custom 单页；推荐叠层/单页向导，不进顶级 Nav）
```

**不新增** 顶级导航「自定义」常驻项；仅 Dashboard 逃逸入口。

---

### 12.3 专家团对本节的表态

| 席位 | 意见 |
|------|------|
| **产品** | 冻结契约 + 自定义整单重生成，干净。Focus **百分分配 Σ=100%** 比主/次/均分都忠于选择权；需做好总和校验与生成履约。 |
| **UX** | 强确认拍保留。分配板要看见实时总和；给「Use coach suggestion」快捷但可改。 |
| **IA** | `focus_allocation[]` + `superseded` 生命周期清晰；自定义走面向导不污染全局 IA。 |

---

*§12 写入：2026-07-15 · 仍未实施 · 仍未整体锁库*
