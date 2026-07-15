# 计划形态 × 焦点策略 — 优化后产品方案（锁项合成 + 专家闭环评审）

- **Date:** 2026-07-15  
- **Status:** 方案合成稿 · **待你确认开干前默认项** · **未实施代码**  
- **合成来源：**  
  - 闭环基线：`2026-07-14-post-login-closed-loop-design.md`（rev2，已部分落地）  
  - 短跑道讨论：`2026-07-15-short-exam-horizon-design.md` §10–§12  
  - 清单锁项：`2026-07-15-journey-ux-fix-backlog.md` JUX-003  
- **本文件角色：** 把「已锁定」收敛成**可走通的规范方案**；专家团补齐闭环缺口的**默认闭合值**（标为 ◆ 待确认）；并对全流程做边界覆盖评审。

---

## 0. 锁项 / 默认项分列（防自作主张）

### 0.1 你已锁定（规范，不可在实现里改淡）

| ID | 锁项 |
|----|------|
| L1 | 选择权交给用户（短跑道内容策略可选） |
| L2 | **Standard** = 较长完整旅程 |
| L3 | **Short** = **Coach-led**（诊断建议）或 **Focus-led**（用户自选） |
| L4 | Focus 范畴 = HSK3 **五维**：listening / reading / writing / vocabulary / grammar（不改为三维） |
| L5 | Focus 时间 = 用户自定义比例，**Σ = 100%**；否决均分、否决主/次模型 |
| L6 | 自选结束后可退回 **系统推荐（Coach-led）** |
| L7 | **禁止**在现有 active 方案上打补丁；若改 → **Custom replan** 整单重生成（你已同意流程） |
| L8 | 不复活 Waiting Room；Dashboard 为诊断后的耐久家；异步是状态不是场地（rev2） |

### 0.2 专家为「闭环完整」提出的默认闭合值（◆ 开干前请你点头或改数）

| ID | 默认 | 依据 |
|----|------|------|
| ◆D1 | `plan_shape = short` 当且仅当 **有真实考期且 D ≤ 20 天**；否则 `standard`（含 I'm not sure → 12 周代理） | 需一条切分线才能实施；21+ 走完整旅程 |
| ◆D2 | Coach-led / Focus-led **必在诊断完成后**选择（结果页或紧随其后的一拍） | 无诊断数据则 Focus 无校准；与专家此前一致 |
| ◆D3 | I'm not sure 后主界面 **不得** 写 “N days to exam”（JUX-001 诚实日历，与锁项同精神） | 否则与「禁止假跨度」矛盾 |
| ◆D4 | 日期选择：**本地时区「今天」为 min**，过去日不可提交（JUX-002） | 支撑 UC-O05 |
| ◆D5 | Custom replan / 向导退回 Coach-led：**默认复用诊断**；可选重新诊断 | 已写在 §12.2，升为默认 |
| ◆D6 | 清关戳：短跑道路程清关 **复用 `w1_cleared_at`**；Custom replan **重置本程执行进度、不改 `profiles.plan`** | 降低字段爆炸 |

若你否决任一 ◆，只改默认值，不推翻 L1–L8。

---

## 1. 规范状态模型（在 rev2 上扩展）

### 1.1 Setup 轴（路由，已落地思想）

```
needs_exam_prefs → needs_diagnosis → diagnosis_done → complete
  (onboarding_prefs_at)  (diagnosis_completed_at)  (journey_started_at / 等价「active plan 已落库」)
```

### 1.2 计划轴（本方案新增 · 正交）

| 轴 | 取值 | 谁决定 |
|----|------|--------|
| `plan_shape` | `standard` \| `short` | 系统按考期/unsure（◆D1） |
| `focus_strategy` | `coach_led` \| `user_focus` | **仅 short**：用户在诊断后选（◆D2）；standard 隐含全程 coach 旅程 |
| `focus_allocation` | `{ skill, percent }[]`，Σpercent=100，skill⊆五维 | **仅 user_focus** |
| `plan_lifecycle` | `active` \| `superseded` | 系统；Custom replan 时旧→superseded |

**禁止：** `allocateStages` 再用 `total = max(21, D)` 盖住真实考期（短日历必须诚实）。

### 1.3 App 解锁（保持 rev2）

- Dashboard 家：自 `diagnosis_done` 起可进。  
- 工具全开：自 `complete`（active 计划任务已落库）起。  
- Coach pending/error：状态在 Dashboard / 成绩页，Retry，不强迫重考诊断。

---

## 2. 端到端主路径（优化后）

### 2.1 公共前缀（所有用户）

```
注册/登录
  → /onboarding
       ├─ 选考期（◆D4：不可过去）
       │     ├─ D≥21 或逻辑上 standard → plan_shape=standard
       │     └─ D≤20 → plan_shape=short；轻提示「诊断后可选听建议或自选分配」
       ├─ I'm not sure → target_exam_date=null，horizon=12，plan_shape=standard
       │                 （◆D3：后续铬写 planning horizon，不写假 to exam）
       └─ 有日期又点 unsure → 确认拍（已有）
  → /diagnosis（不可跳）
  → 成绩页（诊断戳已落；coach 可并行）
```

### 2.2 Standard 分支（L2）

```
成绩 / Dashboard
  → 系统生成完整旅程（弹性阶段，日历按真实考期或 12 周代理）
  → complete 后执行 Week1… →（Free）清关 → Pro CTA
  → 无 Coach-led/Focus-led 二选一（避免长旅程决策疲劳）
```

### 2.3 Short 分支（L3–L6）

```
诊断完成
  → 策略拍：
       ○ Coach-led  → 按诊断自动排满剩余天数
       ○ Focus-led  → 五维分配板，Σ=100% 才可继续
            └─ 出口：Use coach recommendation instead（L6，生成前退回 Coach-led）
  → Building plan（Dashboard 状态横幅，非 Waiting Room）
  → complete：执行本程
       Strip：Coach sprint · based on gaps  |  Focus · Listening 40% · …
  → 清关 → Pro CTA（一程给满后再转化）
```

### 2.4 改主意 / 自定义重规划（L7）

```
Dashboard 次要：Start a custom plan
  → 强确认：作废当前 active 计划
  → 再次：Coach-led | Focus-led（+ 分配板）
  → 默认复用诊断 / 可选重新诊断（◆D5）
  → 旧 plan → superseded；新 plan → active
  → （Focus active 想改回系统推荐）＝ 本流程选 Coach-led，不是就地改比例
```

**明确禁止：** 任务行改技能、Strip 拖滑条、半改比例沿用旧任务。

---

## 3. Freemium（保持闭环高潮）

| 规则 | 说明 |
|------|------|
| 诊断 | 不计 Free mock 配额 |
| Short / Standard 本程 | Free **给满可执行内容**（不因 short 再砍一半） |
| 主转化 | 本程清关后（复用 `w1_cleared_at` ◆D6） |
| 策略选择 / 分配板 / Custom replan | **不对 Free 上锁** |
| Auth | 不覆盖已有 Pro |

---

## 4. 信息架构一页

```
Marketing
App setup:  Onboarding → Diagnosis（极简头 + Account）
App home:   Dashboard（诊断后耐久家）
App tools:  Practice / Flashcards / Mistakes / Mock（complete 后）
Secondary:  Journey / Plans / Progress；Custom replan 向导（非顶级 Nav）
```

---

## 5. 专家团联合评审 — 闭环与边界

### 5.1 评审结论（产品 + UX + IA）

| 维度 | 结论 |
|------|------|
| **主路径闭环** | **可以闭环**：prefs → 诊断 →（short 策略/分配）→ 生成 → 执行 → 清关 → 转化；登出复登靠 DB。 |
| **改念闭环** | **可以闭环**：冻结 + Custom replan；Focus→Coach 生成前直退、生成后走 replan。 |
| **日历诚实** | **须落地假跨度禁令 + ◆D3**，否则短考期与 unsure 在感知上再次开环。 |
| **残留风险** | ◆D1/D2 未由你手写确认前，实现组不得自行改数；建议你确认后本方案升为 Locked。 |

**总评：** 在 L1–L8 + ◆D1–D6 下，产品方案在逻辑上可闭环；当前代码仍是旧 `max(21,D)` 单轨，**方案 ≠ 已上线**。

### 5.2 主路径闭环检查表

| # | 路径 | 起点 → 终点 | 断点风险 | 方案对策 |
|---|------|-------------|----------|----------|
| C1 | Free 新用户 standard | 注册→清关→Pro CTA | 假 21 天仅伤 short；standard OK | L2 |
| C2 | Free 新用户 short+Coach | 诊断→Coach-led→执行→清关 | 未选策略就生成 | ◆D2 强制策略拍 |
| C3 | Free 新用户 short+Focus | 分配 Σ100→执行 | Σ≠100 强提 | L5 校验 |
| C4 | Focus 向导退回 Coach | 分配中/确认前→Coach 生成 | 脏 allocation 残留 | 丢弃 allocation（L6） |
| C5 | Custom：Focus→Coach | replan→Coach active | 打补丁 | L7 superseded |
| C6 | Custom：Coach→Focus | replan→分配→Focus active | 同上 | L7 |
| C7 | 诊断后 pending | Dashboard Retry | Waiting Room | L8 |
| C8 | Coach error | error+Retry，分数保留 | 逼重考 | rev2 recovery |
| C9 | 登出再登 | 任意阶段 | tab 状态 | DB stage |
| C10 | Unsure | 12w standard | “days to exam” 撒谎 | ◆D3 |
| C11 | Pro 复登 | 保留 Pro | plan 被刷 Free | rev2 upsert |

### 5.3 边界场景全覆盖矩阵

#### A. 考期与日历

| ID | 边界 | 期望 |
|----|------|------|
| E-A01 | 过去日期 | 选择器不可用 + API 拒（◆D4） |
| E-A02 | 今天考 D=0 | short；策略拍；日历跨度诚实（今日→今日/极短） |
| E-A03 | D=1 | short；禁止 max(21,1) |
| E-A04 | D=20 | short（◆D1） |
| E-A05 | D=21 | standard（◆D1） |
| E-A06 | I'm not sure | standard+12w；铬非 “to exam”（◆D3） |
| E-A07 | 有日期又 unsure | 确认拍后同 E-A06 |
| E-A08 | 生成后考期已过 | Dashboard 提示重设/转 12w；不静默改（沿用短考讨论） |
| E-A09 | 时区跨日 | min/计算 D 用**用户本地日历日**（◆D4） |

#### B. 策略与分配

| ID | 边界 | 期望 |
|----|------|------|
| E-B01 | Short 未选 A/B 就关页 | 再进：成绩页/Dashboard 引导回策略拍；不静默当 Coach-led |
| E-B02 | Focus Σ=0 / 99 / 101 | 禁止生成 |
| E-B03 | Focus 单项 100% | 允许 |
| E-B04 | Focus 五维都有比例 | 允许，Σ=100 |
| E-B05 | Use coach suggestion 灌比例后再改 | 允许，仍校验 100% |
| E-B06 | 生成前退回 Coach | 清除 user_focus allocation |
| E-B07 | Standard 用户看到 A/B | **不应出现** |

#### C. 计划生命周期

| ID | 边界 | 期望 |
|----|------|------|
| E-C01 | 误点 Custom | Cancel 回原 active |
| E-C02 | Custom 确认后生成失败 | active 仍可用或明确 error+Retry；不丢诊断 |
| E-C03 | 连续两次 Custom | 仅一份 active；更旧均 superseded |
| E-C04 | Custom 时选重新诊断 | 可进 /diagnosis；完成后回 replan 生成（需防 complete 用户被硬甩 Dashboard——**方案要求：replan 会话允许诊断**） |
| E-C05 | 旧任务点开 | 不可作 Zone1 主任务；superseded |

#### D. 执行与 Freemium

| ID | 边界 | 期望 |
|----|------|------|
| E-D01 | Short Free 配额 | 诊断免费；正式 mock/练习配额同现网 Free |
| E-D02 | Short 清关 | w1_cleared_at；Pro CTA |
| E-D03 | 清关后 Custom | 不降 Pro；Free 仍停在转化逻辑（◆D6） |
| E-D04 | Focus 计划任务 skill 分布 | 约等于 allocation（允许计数圆整误差） |

#### E. 路由与信任

| ID | 边界 | 期望 |
|----|------|------|
| E-E01 | diagnosis_done 点工具 | 软禁用或硬回 Dashboard + 原因（rev2 债，评审标为闭环配套） |
| E-E02 | complete 再开 /diagnosis 常态 | 回 Dashboard；**例外** E-C04 replan 会话 |
| E-E03 | Sign out | 任意点可；身份菜单常在 |
| E-E04 | 双账号 | 不静默切号（rev2） |

### 5.4 评审发现的缺口 → 方案补丁（已写入本文）

| 缺口 | 补丁 |
|------|------|
| 未选策略就中断 | E-B01：再入引导，不静默默认 |
| Custom 时重新诊断与「禁止再进诊断卷」冲突 | E-C04：定义 **replan 会话**豁免 |
| unsure / 假 exam 文案 | ◆D3 升到与日历诚实同级 |
| 阈值你未锁 | ◆D1 显式待确认，避免工程私定 |

### 5.5 专家席签字（方案层）

| 席位 | 意见 |
|------|------|
| **产品** | L1–L8 下主路径与改念路径可闭环；◆D1–D6 作为实施默认可接受，**须你确认 D 切分**后再标 Locked。 |
| **UX** | 策略拍放诊断后、分配板校验 100%、退回与 Custom 文案分层正确；注意 E-B01 中断恢复的引导文案要实现时写清。 |
| **IA** | `plan_shape × focus_strategy × allocation × lifecycle` 正交清晰；replan 会话是唯一需要写进路由例外的新概念。 |

---

## 6. 相对现网代码的差距（便于开干）

| 现网 | 本方案 |
|------|--------|
| 单一 allocateStages + max(21,D) | short 诚实跨度 + standard 长旅程 |
| 无策略拍 / 无分配板 | short：Coach vs Focus + Σ100% |
| 无 plan superseded / Custom replan | L7 整单重生成 |
| JourneyStrip 统一 “days to exam” | unsure / 代理终点要换文案（◆D3） |
| Syncing 条 | 本地已删，待你入库（非本方案核心） |

---

## 7. 开干前请你回复的最少集合

1. **◆D1** 切分：D≤20 = short，是否照用？  
2. **◆D2** 策略拍固定在诊断后，是否照用？  
3. **◆D3–D6** 是否一揽子同意？  

回复「按本文 ◆ 默认开干」或改正数后，本文件可标 **Locked for implementation**。在此之前仍 **不改生产行为代码**（除非你另行下令）。

---

## 8. 相关文件

| 文件 | 关系 |
|------|------|
| `2026-07-14-post-login-closed-loop-design.md` | 闭环基线 |
| `2026-07-15-short-exam-horizon-design.md` | 讨论底稿；**规范以本文为准** |
| `2026-07-15-journey-ux-fix-backlog.md` | 问题入口；链到本文 |
