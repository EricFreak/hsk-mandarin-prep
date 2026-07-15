# 现有产品方案 · 因锁项产生的影响与调整后总案

- **Date:** 2026-07-15  
- **Status:** 产品方案修订稿 · **未实施代码** · **部分过时草稿**（见下）  
- **EOD 2026-07-15：** 续谈见 `docs/superpowers/handoffs/2026-07-15-short-runway-freemium-scheme-eod.md`。你倾向 **废除 exam_sprint、只留 standard+compressed**——本文 §1c 双拍/sprint 段待明日按该意向重写后再标 Locked。  
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
| **会冲击现有方案** | 是。冲击集中在：三档时长轴、内容选择权、整单替换，以及 **Freemium 不能再用「一律清关卖 W2+」**（尤其 D=1 sprint）。 |
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
| 5 | Free：「做完 **Week 1** → 推 Pro → **解锁 W2+**」 | 单一 Short 不够：三档里 **exam_sprint（尤其 D=1）** 清关时考试常还没过，硬卖 W2/下场完整线会空心 | 见 **§1c**：standard/compressed 清关可续本旅程；**sprint 双拍**（清关=拍A平静；考后=拍B主转化） | 明天考、今晚清关 → 先庆祝继续考前练；考过后再主推 Pro 下场完整线 |
| 6 | rev2：家在 Dashboard、四段路由、诊断免费、登录 | 和你的锁项不打架 | **基本不动** | 登录门、Dashboard、Sign out 等照旧 |

### 调整后一句话总叙事（对应上表）

- 还是**同一个产品**：时间够 → 完整旅程；时间紧 → 短跑道（里再选听系统或自己定时间比例）。  
- 换计划从「在旧计划上改改」变成「**整份换成新的**」。  
- Free 转化：三档都「本程用满」；**卖点按档分叉**（standard/compressed=续本旅程；exam_sprint=考后主转化），见 §1c。

### 和「只证明新功能自己能闭环」的差别

- **不够：** 只画 Short/Focus 自己怎么点。  
- **够：** 必须改掉上表里会打架的旧句子（1–5），并说清 6 不变，得到**一份改完还自洽的总说明书**。

---

## 1c. 第五项深挖：付费转化必须按「三档」+ 边界拆开

先前把 `compressed` / `exam_sprint` 压成一个 **Short**，再用「清关 → 下场完整线」一句话带过——在 **D=1（明天考）** 上会空心：用户清关时往往**还没考完**，主心智是「今晚还能练什么」，不是「下场 12 周」。

故：Freemium **时机与卖点都必须回到初版三档**（与讨论底稿一致），再单写极限边界。

### 三档回顾（时长轴，非内容轴）

| `plan_mode` | 距考约 | 本程长什么样 | 和「W2+」的关系 |
|-------------|--------|--------------|-----------------|
| **standard** | ≥21 天，或 I'm not sure | 完整旅程；Free 执行 Week 1 | 清关后 Pro **就是**解锁本旅程 W2+ |
| **compressed** | 7–20 天 | 压进真实 D；仍可能有 1–3 个可执行周；禁止 `max(21,D)` | Free 仍先吃满**第一可执行周**；清关后 Pro = 解锁**本压缩旅程剩余周**（像缩小版 standard） |
| **exam_sprint** | 1–6 天（含今天考 D=0） | 单窗突击；不装多周地图 | **没有**本旅程 W2。清关 ≠ 自动等于「该卖下场完整线」——要看考期过没过 |

内容轴（Coach-led / Focus）只挂在需要短跑道选择权的档上；**不改变**上表 Freemium 分叉。

### 不变量（三档共用）

> 诊断 / 策略拍 / **本程执行中途**不炸主 Pro 墙。Free **给满本程**（sprint 不因天数短再砍半）。

### 三档 × Free → Pro（并排）

| | standard | compressed | exam_sprint（含 D=1） |
|--|----------|------------|------------------------|
| Free 给满 | Week 1 | 压缩旅程的**第 1 可执行周** | **整段单窗突击** |
| 清关戳 | `w1_cleared_at` | 同左（第一周清） | 同左（sprint complete） |
| 清关后若仍 **Free** | 主 CTA：Upgrade → **续本旅程 W2+** | 主 CTA：Upgrade → **续本压缩旅程剩余周** | **见下一节双拍**——禁止照搬「Unlock Week 2」 |
| 拒付费停哪 | W2 可见不可跑 | 剩余周可见不可跑 | 突击已结束；考前可练工具（权益内）；无「下一周执行」 |

---

### 极限例：距考只剩 1 天（`exam_sprint`，D=1）应如何走 Pro

**用户路径（Free）：**

```
选明天考试 → one-beat 告知「这是考前突击，不是多周地图」
  → 诊断 →（可选 Coach / Focus）→ 生成「到考前」单窗任务
  → Dashboard 做突击（中途不主推 Pro）
  → 本程可能几小时内清关（w1_cleared_at）
```

此时钟面上通常是：**考试还没开始或就在今晚/明天**。若立刻用 standard 同款高潮「升级解锁 Week 2 / 下场完整旅程」——承诺与场景错位。

**推荐：sprint 用「双拍转化」，不要单拍硬塞下场完整线。**

| 拍 | 触发条件 | Dashboard 主表达 | Pro 是否主 CTA | Pro 若点开卖什么 |
|----|----------|------------------|----------------|------------------|
| **拍 A · 清关当下（考期未过）** | sprint 已清，且 `today ≤ examDate` | 庆祝「突击计划完成」+ **平静延续到考前**（今日任务/工具仍可用） | **否（不当主墙）**；Pro 可作次要链（Pricing / 文案弱） | 次要可讲：**考前火力权益**（如写作评分、额外模考次数等既有 Pro 包）——**不**讲 Unlock Week 2，**不**强迫设下场日期 |
| **拍 B · 主转化高潮** | `today > examDate`（考期已过），或用户主动「设下一考期」 | “Exam date has passed — unlock your next full journey” / 设下一考期 | **是** | **下场 / 持续备考**：新日期 → standard 或再分档；+ 既有 Pro 权益 |

**D=1 时间线示意：**

```
Day 0 选考期=明天 → 诊断 → 突击进行中 …… 禁止主 Pro 墙
Day 0/1 突击清关 → 【拍 A】庆祝 + 考前继续练；Pro 仅次要
考试日结束 / 次日回访 → 【拍 B】主 CTA = Pro 下场完整旅程
```

**若清关时考期已经过了**（起得很晚、或改过系统日）：跳过拍 A，**直接拍 B**。

**若清关前就付费（中途升级）：** 允许；不重走 setup。考前享用 Pro 权益；考后自然具备拍 B 的「下场完整线」能力，不再卡第二道主墙。

**Free 一直拒付费：** 拍 A 后可停留；拍 B 出现后主 CTA 持续；也可用 Custom 设新考期开**新 Free 本程**（新一程再走对应分档与清关规则）。

---

### compressed 为何不必跟 sprint 同一套双拍

7–20 天压缩后通常仍有「第一周之后还有可执行周」。清关后的 Pro 承诺与 standard **同构**（续本旅程），只是旅程更短——**单拍即可**。

只有 **exam_sprint（无剩余周）** 必须双拍，否则会把「下场完整线」砸在临考大脑上。

---

### 与 Custom replan

- Custom **不改** `profiles.plan`。  
- 重置本程进度；未清关不把旧清关姿态带去骗过转化。  
- sprint 在拍 A 未到拍 B 前 Custom 换日期：若新 D 进入 standard/compressed，转化逻辑跟新档走。

### ◆ 取代原 ◆D-Short-Pro（请确认）

- **◆D-Freemium-Tiers：** 付费叙事按 **standard / compressed / exam_sprint** 三档，不再用单一 Short 卖点。  
- **◆D-Sprint-Pro：** exam_sprint（含 D=1）**主转化高潮在拍 B（考期过后或主动设下场）**；拍 A 清关不当主 Pro 墙。  
- compressed：清关后单拍，卖点 = 续本压缩旅程剩余周。  

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
| §6 Freemium 主转化在 W1 clear + Pro=解锁 W2+ | 🔴 对 **exam_sprint/D=1** 卖点与时机都冲突 | 按三档：standard/compressed 清关续本旅程；**sprint 双拍**（§1c）。禁止 sprint 清关当下写 Unlock Week 2 / 强迫下场完整线 |
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
| Free 闭环定义「→ Week 1 → clear → Upgrade（→ W2+）」 | 🔴 sprint/D=1 不能同构 W2+ | 三档分叉；sprint **拍B** 才是主转化（§1c） |
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
2. **◆ 默认切分（待你确认）：** D≥21 或 unsure → standard；7≤D≤20 → compressed；1≤D≤6（含 D=0 今天考）→ exam_sprint。  
3. **standard：** 维持四阶段弹性骨架；弱项 reweight 不推翻骨架。  
4. **compressed：** 总跨度=真实 D，禁止 `max(21,D)`；可保留压缩后的阶段/1–3 周。  
5. **exam_sprint：** 单窗突击，不装多周地图；日历 end=真实考期；内容轴见 R2。

### R2 · 内容轴（挂在 compressed / exam_sprint；与 Freemium 三档独立）

1. `compressed` 与 `exam_sprint` 在诊断后可选/须选：`focus_strategy ∈ { coach_led, user_focus }`（◆ 是否 compressed 也强制二选一，可与 sprint 对齐或仅 sprint 强制——默认：**两档都提供**，与选择权一致）。  
2. **coach_led：** 系统按诊断薄弱排满剩余时间。  
3. **user_focus：** 五维 %，**Σ=100%** 才可生成。  
4. **退回 coach_led：** 生成前向导内；生成后仅 Custom replan。  
5. **standard 不出现** R2 二选一。

### R3 · 三档 Freemium（修 2026-07-13 §5–6；废止「单一 Short 卖点」）

1. 时长轴恢复 **`plan_mode ∈ { standard, compressed, exam_sprint }`**（与初版三档一致）；付费叙事跟档走，不用笼统 Short。  
2. Free **给满本程**；中途禁主 Pro 墙。清关戳统一 `w1_cleared_at`。  
3. **standard：** 清关 → 主 CTA Pro = 解锁本旅程 **W2+**。  
4. **compressed：** 清关 → 主 CTA Pro = 解锁**本压缩旅程剩余周**（单拍，同构缩小版 standard）。  
5. **exam_sprint（含 D=1 / 今天考）：双拍**  
   - **拍 A**（已清关且考期未过）：庆祝 + 考前延续；**Pro 不当主墙**（可次要链讲权益包）。  
   - **拍 B**（考期已过，或用户主动设下场）：**主转化** = 下场/持续备考完整线。  
6. Custom replan：不改 `profiles.plan`；进度/清关姿态按 §1c。  

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
  → 执行本程 → 清关 →（Free）转化按档——§1c
        ├─ standard / compressed：主 CTA Pro = 续本旅程剩余周
        └─ exam_sprint：拍A考前平静；拍B考后/设下场才主转化
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

---

## 5. 专家团评审：调后总案是否自洽、是否覆盖边界

### 5.1 产品

- **影响识别充分：** 最大真实冲突是 §4 骨架不变量与 Focus 主权、以及 §4.4 再生成与「冻结契约」。R1–R5 对症。  
- **闭环：** 调整后 Free/Pro 主叙事仍闭环；短跑道不再假装长旅程，减少假日历开环。  
- **要求你确认 ◆D1（D≤20）**，否则 short/standard 边界仍虚。

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
| Freemium | 本程给满；**三档分叉**；sprint 双拍（§1c）；Custom 不改 plan |
| 旧路径兼容 | Pro 长旅程用户仍走 standard；已 complete 用户不被强制进 Focus |

### 5.5 评审结论

> **可以对现有方案做有版本的修订，并形成自洽总案。**  
> 不是「新功能自闭环」，而是：**长旅程让出三档时长轴 + sprint 双拍 Freemium + 再生成整单替换 + 内容轴选择权。**  
> 代码未跟方案前，以本文 + rev2 已落地部分并存；开干应按 R1–R7 改生成与闸门。

---

## 6. 文档关系（调整后）

| 文档 | 调整后地位 |
|------|------------|
| 本文 | **锁项冲击 + 修订总案**（优先阅读） |
| `2026-07-14-post-login-closed-loop-design.md` | 基线仍有效；与本文冲突处以 **本文 R*** 为准 |
| `2026-07-13-full-journey-ux-brand-design.md` | §4–6 被 R1–R3 修订 |
| `2026-07-14-auth-aware-user-journey-design.md` | §3 直线被 R4 修订 |
| `2026-07-15-short-exam-horizon-design.md` | 讨论底稿 |
| `2026-07-15-plan-shape-focus-product-scheme.md` | 细节/矩阵附录；若与本文冲突 → **以本文为准** |

---

## 7. 请你确认后，总案即可标 Locked

1. 是否接受 **§3 R1–R7** 作为对现有三份基线的正式修订？  
2. ◆D1：**三档切分**（≥21 standard / 7–20 compressed / 1–6 sprint；D=0 并入 sprint），是否照用？（废止「D≤20=单一 short」）  
3. 策略拍固定诊断后（R2/R4），是否照用？（内容轴；与三档独立）  
4. ◆D-Sprint-Pro：**D=1 等 exam_sprint 采用双拍**（清关考前=拍A不主推；考后/设下场=拍B主转化），是否照用？见 §1c。  

确认前 **不改代码**。
