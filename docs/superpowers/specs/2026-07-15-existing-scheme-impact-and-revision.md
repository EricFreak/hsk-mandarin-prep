# 现有产品方案 · 因锁项产生的影响与调整后总案

- **Date:** 2026-07-15（Freemium 段 **2026-07-16 锁定回写**）  
- **Status:** 行程/短跑道修订稿 + **计费以 Locked 定价终案为准** · **未实施代码**  
- **计费权威：** `2026-07-16-unit-time-fair-pricing-scheme.md`（**Locked 2026-07-16**）。本文 §1c / R3 已按该终案回写；与旧「月费解锁 W2+ / sprint 双拍」冲突处以定价终案为准。  
- **EOD：** `handoffs/2026-07-15-short-runway-freemium-scheme-eod.md`  
- **目的：** 回答「锁项对**现有方案**有何影响、应如何改」，并给出**调整后的整体方案**——不是只证明新功能自己能闭环。  
- **现有方案基线（被改对象）：**  
  1. `2026-07-13-full-journey-ux-brand-design.md`（完整旅程 / 弹性阶段 / Freemium）  
  2. `2026-07-14-auth-aware-user-journey-design.md`（CTA × 阶段）  
  3. `2026-07-14-post-login-closed-loop-design.md` rev2（诊断后家 / 四阶段 / 异步是状态）  
- **锁项来源：** backlog JUX-003 及短跑道讨论已锁内容（选择权、Standard/Short、五维 Σ100%、退回 Coach、Custom replan 等）

---

## 1. 结论先行

| 判断 | 说明 |
|------|------|
| **会冲击现有方案** | 是。冲击集中在：三档时长轴、内容选择权、整单替换，以及 **Freemium 改为 Coach-day 单价 + Runway pack + sprint 一生一次免费**。 |
| **不推翻** | 登录后阶段门、Dashboard 当家、诊断不算免费模考次数、升级主高潮、账号不把 Pro 刷成 Free、不要 Waiting Room。 |
| **调整方式** | **改旧说明书里的句子**，让新旧不打架；不是再做一个 App。 |

---

## 1b. 主要冲击（白话版 · 先看懂这里）

下面 6 条就是「现有方案里原来怎么定 → 现在和短考期/自选时间冲突在哪 → 改成什么」。  
名词先翻译：

- **四阶段骨架**：原来默认人人都按 Diagnose → Foundation → Skills → Sprint 拉一条长备考线。  
- **三档**：standard（≥21/unsure）/ compressed（7–20）/ exam_sprint（1–6，含今天）。  
- **Focus / 自选比例**：短跑道里用户自己定听/读/写/词/语各占多少时间，加起来 100%。  
- **冻结契约**：计划一旦生成，不能在上面偷偷改参数；要换就整份重做一个新计划（Custom replan）。  
- **本程**：用户当前这一份可执行计划（完整线里常叫 Week 1；短线里就是这一段突击）。

| # | 现有方案原来怎么说 | 为啥和你锁的方向打架 | 调整后怎么说（人话） | 举例 |
|---|--------------------|----------------------|----------------------|------|
| 1 | 所有人同一套「四阶段」长备考骨架 | 只剩几天考试的人，再装完整四段，日历会对不上（甚至内部比考期还长） | **三档**：standard 完整四段；compressed 压进真实 D；exam_sprint 单窗突击、不装多周地图 | 明天考试 → exam_sprint，只排到考前的突击任务 |
| 2 | 诊断出弱项后，只是微调比例，**不能推翻**阶段骨架 | 你要求 Focus 可把时间 **按自己比例砸满 100%**，那就等于可以「听我说怎么练」，而不是「系统阶段说了算」 | **仅当用户选 Focus** 时：以用户比例为准。听系统建议（Coach-led）或完整线：仍主要由系统排 | Focus：听力 70%+阅读 30%。Coach-led：系统按诊断弱项自动排 |
| 3 | 以后改考期 → 系统在**当前计划上悄悄重算** | 你要求计划生成后是冻结的，改念要走自定义重规划，不能打补丁 | 改考期 / 改策略 / 改比例 → **作废旧计划，生成新计划**（先确认） | 已开始突击又改考期：确认「替换当前计划」后重做，而不是后台偷改任务列表 |
| 4 | 填日期 → 诊断 → **直接**进入 Week 1 | 短跑道还要让用户选「听建议」还是「自己分配时间」，中间少一步 | 诊断后：**Short 先选策略（±填比例）再生成**；Standard 仍可诊断后直接生成完整线 | 还剩 10 天：诊断后先选 Coach 或 Focus，再出任务 |
| 5 | Free：「做完 **Week 1** → 推 Pro → **解锁 W2+**」（月费同学费） | 同学费不同剩余周不公；sprint 无剩余周可卖；紧急强收像打劫 | 见 **§1c + 定价终案**：Coach-day 单价 R；长档 Free 第1周后买剩余天×R；sprint **lifetime 一次 Free**，再次 D×R 无溢价 | 30 天与 50 天用户按剩余付费天计价；明天考首次紧急免单 |
| 6 | rev2：家在 Dashboard、四段路由、诊断免费、登录 | 和你的锁项不打架 | **基本不动** | 登录门、Dashboard、Sign out 等照旧 |

### 调整后一句话总叙事（对应上表）

- 还是**同一个产品**：时间够 → 完整旅程；时间紧 → 短跑道（里再选听系统或自己定时间比例）。  
- 换计划从「在旧计划上改改」变成「**整份换成新的**」。  
- Free 转化：长档「本程用满 → Runway pack」；sprint「一生一次免 → 再次按天付」；见 §1c + 定价终案。

### 和「只证明新功能自己能闭环」的差别

- **不够：** 只画 Short/Focus 自己怎么点。  
- **够：** 必须改掉上表里会打架的旧句子（1–5），并说清 6 不变，得到**一份改完还自洽的总说明书**。

---

## 1c. Freemium（已锁定 · 2026-07-16）

**权威全文：** [`2026-07-16-unit-time-fair-pricing-scheme.md`](./2026-07-16-unit-time-fair-pricing-scheme.md)（Locked）。

### 底线

> 卖 **单位时间可量化的公平价值**（Coach-day 单价 **R**）；即使用户只剩一天，**不趁火打劫**（无紧急溢价）。

### 三档 × 计费（锁定）

| `plan_mode` | 距考 | Free | 付费 |
|-------------|------|------|------|
| **standard** | D≥21 或 unsure | 诊断+报告+大纲+**Week 1** | W1 清关后：**Runway pack** = 剩余 Coach-days × R |
| **compressed** | 7≤D≤20 | 同上（第一可执行周） | 第一周清关后：剩余天 × R（同单价） |
| **exam_sprint** | **1≤D≤6**（含 D=0） | **每账号 lifetime 一次**整段紧急方案给满（`free_sprint_used_at`） | **再次** sprint：D × R；无溢价。首次清关**不当**旅途续费主墙 |

### 已锁定的四项确认

1. 采纳定价终案 P1–P5 + R-Pay-1…6  
2. Sprint 免费窗 = **D≤6**  
3. 首版主 SKU = **Runway pack**（月费预充 → 二期）  
4. **保留** sprint，一生一次免费  

### 废止的旧 Freemium 说法（本文曾写、现废）

- 月费同学费解锁不等量「剩余周」当作公平  
- sprint「双拍：考期过了再主推下场完整线」作为主转化（含糊且未对齐单位时间）  
- 「Short 清关统一卖 Unlock Week 2」

### Custom / 防刷

- Custom **不重置** `free_sprint_used_at`  
- 不白送新的 Runway 余额  
- 多账号骗免：MVP 接受  

---

## 2. 影响分析：锁项 × 现有条款（细则表）

下列表格是 §1b 的依据明细。图例：🔴 冲突须改 · 🟡 部分过时须补 · 🟢 兼容无改

### 2.1 vs 完整旅程方案（2026-07-13）

| 现有条款 | 冲击 | 调整后应变成 |
|----------|------|----------------|
| §3.2 Onboarding：日期或 unsure→12 周→Placement→旅程 | 🟡 Short 用户不能再默认「一上来就是多周完整旅程」 | 日期提交后算 `plan_shape`；**short 进入诊断后多策略拍**；standard / unsure 仍走完整旅程叙事 |
| §4.1–4.2 四阶段 Diagnose→Foundation→Skills→Sprint + `horizon` 弹性分配 | 🔴 代码/方案隐含短跨度仍套阶段骨架；与「禁止假跨度 / 选择权」冲突 | **Standard：** 保留弹性四阶段。**Short：** 不以完整四阶段为必选骨架；日历跨度 = 真实剩余天数；内容由 Coach-led 或 Focus 比例驱动 |
| §4.2 不变量：弱项只 **reweight**，不替换 stage skeleton | 🔴 Focus-led「Σ100% 砸自选」= **可以替换**默认 skeleton | 规定：**仅 `focus_strategy=user_focus` 时**，配额由 `focus_allocation` 主导；Coach-led short / 全部 standard 仍服从 stage 或诊断 reweight |
| §4.3 Slim strip = stage + days-to-exam | 🟡 unsure 假 “to exam”；Short/Focus 铬不同 | Strip 按 shape/strategy 显示；unsure 用 planning horizon 文案（联动 JUX-001） |
| §4.4 再生成：Onboarding complete→旅程；考期编辑→重算 | 🔴 与「禁止在现方案打补丁、须 Custom replan」部分打架 | **考期/策略/比例变更**一律走 **Custom replan（整单 superseded）**；不再静默「编辑考期重算进行中周」作为主路径（见 §4 修订） |
| §5 大纲可见 + 顺序解锁 + Free 仅 W1 | 🟡 Short 可能只有「一程」而非多周 outline | Short：大纲退化为短列表/突击日程；清关仍打「本程完成」戳（复用 w1_cleared_at）；Free 仅执行本 Short 程 |
| §6 Freemium 主转化在 W1 clear + Pro=解锁 W2+ | 🔴 月费×剩余周不公；sprint 无货 | **以定价终案为准**：Coach-day×R；Runway pack；sprint lifetime 一次 Free |
| §7 Placement→报告→旅程 init→W1 | 🟡 Short 在「旅程 init」前插入策略/分配 | 诊断后 →（short：策略±分配）→ 再生成 |

### 2.2 vs Auth-aware 旅程（2026-07-14）

| 现有条款 | 冲击 | 调整后应变成 |
|----------|------|----------------|
| §1 / §3 门径：exam date → diagnosis → **Week 1** | 🟡 Short 不总是「Week 1」多周隐喻 | 文案/矩阵改为 → diagnosis → **first executable plan（W1 或 short 本程）** |
| §2.3 阶段机 needs_* / complete | 🟢 路由轴可保留 | 其下挂 plan_shape / focus_*，**不**为策略再拆登录路由 |
| §4 营销 CTA 矩阵 | 🟢 大体不变 | short 用户 complete 后仍进 Dashboard；无需新营销门 |
| Diagnosis vs Mock 分工 | 🟢 不变 | 诊断仍必做；完整 Mock 仍是工具 |

### 2.3 vs 登录后闭环 rev2（2026-07-14）

| 现有条款 | 冲击 | 调整后应变成 |
|----------|------|----------------|
| 原则 2–3：里程碑≠后端；异步是状态 | 🟢 强化 | 策略/分配/生成均不得新开 Waiting 页 |
| 原则 5：冲突要一拍 | 🟡 增加策略拍、分配校验、Custom 确认、退回 Coach | 写入场景表 |
| Setup：prefs→diagnosis→diagnosis_done→complete | 🟡 complete 的「任务落库」触发点延后到策略选定之后（short） | short：`diagnosis_done` 可更长；**策略未选不算 complete** |
| Free 闭环定义「→ Week 1 → clear → Upgrade（→ W2+）」 | 🔴 卖点尺子错位 | 长档 → clear → **Runway pack**；sprint 首次免，再次 D×R（定价终案） |
| Must never：假工具门、逼重考等 | 🟢 | 另增：Must never **静默覆盖用户 Focus 比例**；Must never **在 active 上打补丁改焦** |
| Recovery = Retry coach | 🟡 | 保留；另增 Custom replan / 向导退回 Coach-led |

### 2.4 对「已实现代码行为」的隐含影响（方案层）

| 现行为 | 因锁项必须改（开干后） |
|--------|------------------------|
| `allocateStages` 的 `max(21,D)` | Short 禁止；Standard 可保留舒适下限 |
| 诊断提交后直接 `runCoach` 无策略 | Short 须 **gate**：先策略（±分配）再生成，或生成前向导阻塞 complete |
| JourneyStrip 统一 “days to exam” | unsure / 代理终点改文案 |
| 无 superseded / Custom replan | 新流程；并 **废止**「随便改考期就地重算执行周」作主路径 |
| 满导航在 diagnosis_done | rev2 已要求软门；与新方案并存，非本锁项独创 |

---

## 3. 现有方案修订条款（正式改写）

以下条款 **取代** 基线中相冲突的句子；未点名的基线条款继续有效。

### R1 · 时长轴与旅程骨架（修 2026-07-13 §4）

1. 时长轴恢复 **`plan_mode ∈ { standard, compressed, exam_sprint }`**（对齐初版三档；**废除**「D≤20=单一 short」作付费叙事）。  
2. **◆D1 已锁定：** D≥21 或 unsure → standard；7≤D≤20 → compressed；1≤D≤6（含 D=0）→ exam_sprint。  
3. **standard：** 维持四阶段弹性骨架；弱项 reweight 不推翻骨架。  
4. **compressed：** 总跨度=真实 D，禁止 `max(21,D)`；可保留压缩后的阶段/1–3 周。  
5. **exam_sprint：** 单窗突击，不装多周地图；日历 end=真实考期；内容轴见 R2。

### R2 · 内容轴（挂在 compressed / exam_sprint；与 Freemium 三档独立）

1. `compressed` 与 `exam_sprint` 在诊断后可选/须选：`focus_strategy ∈ { coach_led, user_focus }`（◆ 是否 compressed 也强制二选一，可与 sprint 对齐或仅 sprint 强制——默认：**两档都提供**，与选择权一致）。  
2. **coach_led：** 系统按诊断薄弱排满剩余时间。  
3. **user_focus：** 五维 %，**Σ=100%** 才可生成。  
4. **退回 coach_led：** 生成前向导内；生成后仅 Custom replan。  
5. **standard 不出现** R2 二选一。

### R3 · Freemium / 计费（修 2026-07-13 §5–6；**以定价终案 Locked 为准**）

1. 价值单位：**Coach-day**；全场同一单价 **R**（对外可说每周 W=7R）。禁止紧急溢价。  
2. 首版主 SKU：**Runway pack** = 剩余付费 Coach-days × R；月费预充 → 二期。  
3. **standard / compressed：** Free 给满第一可执行周；清关后主转化 = 购 Runway pack（剩余天×R），不再叙事「月费随便解锁多少剩余周」。  
4. **exam_sprint（D≤6）：** 每账号 **lifetime 一次** Free 紧急方案（`free_sprint_used_at`）；再次 = D×R。首次清关不当旅途续费主墙。  
5. 工具权益（模考/写作等）随付费席（有效 Runway/预充）附带。  
6. Custom replan：不重置免费紧急戳；余额规则见定价终案 R-Pay-5。  
7. 全文细则：`2026-07-16-unit-time-fair-pricing-scheme.md`。

### R4 · 诊断后 → 生成（修 auth-aware §3 直线）

```
diagnosis_completed_at
  → 若 standard：允许直接 coach/旅程生成 → complete
  → 若 short：进入策略（±分配）闸门 → 通过后才生成 → complete
diagnosis_done 期间：Dashboard 可进；工具仍锁到 complete
```

### R5 · 变更与再生成（废止/收窄 2026-07-13 §4.4「考期编辑重算」主路径）

| 用户意图 | 调整后 |
|----------|--------|
| 想改焦点比例 / 策略 / 实质换一套计划 | **Custom replan**：确认 → 选策略 →（可选）再诊 → 新 plan active，旧 superseded |
| 想改考期 | 纳入 Custom replan（新 D 可能改变 plan_shape） |
| Coach 失败 | 仍 **Retry** 同契约，不视为 Custom |
| 生成前自选后悔 | 向导内退回 Coach-led（不建 superseded） |

**Passed / 已清算归档周：** 仍只读；Custom 不改写历史周档案，只换 active 执行契约。

### R6 · 铬与文案（修 strip / unsure）

1. Standard + 真实考期：可 “N days to exam”。  
2. Unsure / 无真实考期：**禁止**假装 to exam → planning horizon / 12-week plan（JUX-001）。  
3. Short + coach_led / user_focus：strip 体现策略与（Focus）比例摘要。  
4. 过去日期：选择器层禁止（JUX-002）；与方案日历诚实一致。

### R7 · 路由例外（修 rev2「complete 禁止再进诊断」）

- 常态：complete → `/diagnosis` 回 Dashboard。  
- **例外：** Custom replan 会话中用户选「重新诊断」→ 允许诊断卷，完成后回到 replan 生成，不当作「第一次 setup」。

---

## 4. 调整后的整体方案（一幅图）

### 4.1 学习者状态（调整后）

```
Auth × Plan(free|pro)
× Setup(needs_exam_prefs → needs_diagnosis → diagnosis_done → complete)
× plan_mode(standard|compressed|exam_sprint) ← 新（三档）
× focus_strategy(coach_led|user_focus) ← compressed/sprint，新
× focus_allocation[]                   ← 仅 user_focus，新
× plan_lifecycle(active|superseded)    ← 新
× coach_job(none|pending|ready|error)
× execution(本程进行中 | 本程已清 Free | Pro 续周…)
```

### 4.2 端到端（调整后唯一主叙事）

```
创建账户
  → 考期偏好（真实日期 | unsure→12w；禁过去日）
  → 诊断（必做）
  → ┬─ standard：生成完整旅程骨架 + 本程(W1)任务
     └─ short：选 Coach-led 或 Focus-led（Σ100%）
              （可退回 Coach-led）
              → 按剩余真实天数生成短程任务
  → Dashboard 为家（pending 用状态+Retry）
  → 执行本程 → 清关 →（Free）转化按档——§1c + 定价终案
        ├─ standard / compressed：主 CTA = Runway pack（剩余天 × R）
        └─ exam_sprint：首次 lifetime Free；再次 D×R；首次清关不主推旅途续费
  → 若改念：Custom replan（整单替换），禁止打补丁
  → Sign out / Sign in：按 DB 恢复
```

### 4.3 仍有效的旧闭环不变量

- 诊断分数是用户里程碑；Coach 是状态。  
- 诊断 ≠ Free mock。  
- Auth 不覆盖 Pro。  
- 无 Waiting Room 主场地。  
- Outline（多周时）可见；执行顺序解锁；Free 本程外执行锁定。

### 4.4 明确废止或降级的旧说法

| 旧说法 | 处置 |
|--------|------|
| 所有人同一套四阶段骨架直至考期 | **仅 standard**；short 不适用 |
| 弱项永远只 reweight、永不主导配额 | **user_focus 例外** |
| 考期编辑 → 静默重算进行中旅程 | **降级**；主路径改为 Custom replan |
| 「永远 Week 1」作为唯一第一程隐喻 | **扩展为本程**（W1 或 short） |
| 诊断提交立刻无条件开始最终旅程生成（short） | **加策略闸门** |
| 月费同学费 = 公平；清关卖 Unlock W2+ | **废止为主叙事** → Coach-day×R + Runway pack |
| sprint 双拍「考期过了再转化」 | **废止为主路径** → lifetime 一次 Free + 再次按天 |

---

## 5. 专家团评审：调后总案是否自洽、是否覆盖边界

### 5.1 产品

- **影响识别充分：** 最大真实冲突是 §4 骨架不变量与 Focus 主权、以及 §4.4 再生成与「冻结契约」。R1–R5 对症。  
- **闭环：** 调整后 Free/Pro 主叙事仍闭环；短跑道不再假装长旅程，减少假日历开环。  
- **◆D1 已锁定**（三档切分）。计费 **◆ 定价终案已锁定**。

### 5.2 UX

- 现有「日期→诊断→家」骨架保留，short 只在诊断后加决策，符合「冲突要一拍」又不过早吓人。  
- 须在实现时把 **diagnosis_done 且尚未选策略** 做成明确引导（否则用户停在家却无本程）——这是对 **现有** Dashboard pending 文案的调整，不是新孤岛。

### 5.3 IA

- 未新增顶级 Nav；Custom replan / 策略拍挂在已有家与结果表面上，对 2026-07-13 §3.1 IA **损伤小**。  
- 路由轴保持四阶段，避免 auth-aware 矩阵爆炸。

### 5.4 边界覆盖（针对「调整后总案」）

| 类 | 覆盖要点 |
|----|----------|
| 考期 | 过去/今天/D=1/D=20/D=21/unsure/跨时区；短禁假 21 天 |
| 策略 | 未选中断恢复；Focus Σ；退回 Coach；Standard 无 A/B |
| 契约 | Retry vs Custom；superseded；replan 再诊豁免 |
| Freemium | Coach-day×R；Runway pack；sprint 一次 Free；Custom 不重置紧急戳 |
| 旧路径兼容 | Pro 长旅程用户仍走 standard；已 complete 用户不被强制进 Focus |

### 5.5 评审结论

> **可以对现有方案做有版本的修订，并形成自洽总案。**  
> 不是「新功能自闭环」，而是：**三档时长轴 + 单位时间公平计费（Runway pack / sprint 一次免）+ 整单替换 + 内容轴选择权。**  
> 计费以 `2026-07-16-unit-time-fair-pricing-scheme.md` 为准；开干前仍待实现计划与明确开工令。

---

## 6. 文档关系（调整后）

| 文档 | 调整后地位 |
|------|------------|
| 本文 | 行程/短跑道冲击 + 修订总案 |
| `2026-07-16-unit-time-fair-pricing-scheme.md` | **计费 / Freemium 权威（Locked）**；与本文 R3 冲突时以它为准 |
| `2026-07-14-post-login-closed-loop-design.md` | 基线仍有效；Freemium 转化被定价终案修订 |
| `2026-07-13-full-journey-ux-brand-design.md` | §4 被 R1；§6 被定价终案 / R3 修订 |
| `2026-07-14-auth-aware-user-journey-design.md` | §3 直线被 R4 修订 |
| `2026-07-15-short-exam-horizon-design.md` | 讨论底稿 |
| `2026-07-15-plan-shape-focus-product-scheme.md` | 细节附录；冲突 → 本文 / 定价终案 |

---

## 7. 锁定状态（2026-07-16）

| 项 | 状态 |
|----|------|
| 计费终案（Coach-day / Runway pack / sprint 一次免 / D≤6） | **Locked**（见定价规格 §10） |
| ◆D1 三档切分 | **Locked**（写入 R1） |
| R1–R7 行程/策略/Custom（除 R3 已按定价回写） | 行程侧仍有效；**R3 以定价终案为准** |
| R2 策略拍（compressed/sprint 诊断后） | 默认有效；若要收窄「仅 sprint 强制」可另令 |
| 产品代码 | **未实施**；未下令前不改 |

**下一步（需你下令）：** 写实现计划 → 改 entitlements / checkout / 旅程生成闸门。
