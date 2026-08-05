# 首页信息架构重梳 · 设计文档

- **Date:** 2026-07-17
- **Status:** Approved（创始人逐节确认 §1–§5）· **未实施代码**
- **Branch / worktree:** `feature/mvp-implementation` · `.worktrees/mvp-implementation`
- **对齐权威：** `2026-07-16-three-service-lp-pricing-design.md`（三服务 + LP + 免费可信度链）
- **EOD 对话底稿：** `handoffs/2026-07-16-homepage-ia-redesign-eod.md`
- **改动对象：** 营销首页 `src/app/(marketing)/page.tsx` 及其章节组件（HowItWorks / ProblemFrame / Pricing 嵌入 / FAQ）

---

## 1. 问题与目标

### 1.1 现状问题

首页仍在卖「一个 AI 周计划教练 + 旧 freemium」：

| 块 | 冲突 |
|----|------|
| Hero | 暗示「填考期 → 诊断 → 周计划」单路径 |
| HowItWorksShowcase | 旧 6 步：mock → score → summary → roadmap → this week → track |
| ProblemFrame | 「mastery gate / next week unlocks」= 旧周墙 |
| 首页 Pricing | Free$0 大卡并排 Coach 价表 = 旧 freemium 视觉语法 |
| FAQ | Week 1 /「AI 精批仅付费」等与新免费链冲突 |

### 1.2 目标

首页主叙事改为：**信任链优先 → 再选三种服务结果 → 压缩 Why-us → FAQ 边界 → 终 CTA**。  
完整价目与长权益表仍在 `/pricing`；首页不做第二定价页。

### 1.3 已锁定决策

| # | 决策 | 锁定 |
|---|------|------|
| 1 | 主叙事轴 | **信任链优先**（非服务菜单优先、非考期焦虑优先） |
| 2 | 三服务深度 | **中等展示**（三卡：主导方 / 适合谁 / 价格形态） |
| 3 | How it works | **整段改为可信度链** |
| 4 | 整页骨架 | **方案 1 · 信任漏斗** |
| 5 | 样例形态 | **A. 跨技能拼盘（≠ 日历 Day1）** |
| 6 | 样例写作 | **开放 1 次完整 AI 精批**（DeepSeek；每账号 lifetime 1 次） |
| 7 | FAQ 第 3 条 | **边界题「样例是否有限」**，不复述信任链清单 |

---

## 2. 章节地图（所有权）

| # | 章节 | 只回答 | 不负责 |
|---|------|--------|--------|
| 1 | Hero | 这是什么、第一步做什么 | 价目、三服务细节 |
| 2 | 可信度链（原 How it works） | 付费前白拿什么、怎么走 | SKU 对比 |
| 3 | 三服务中等卡 | 三种结果怎么选、价格形态 | 完整权益表、Free$0 大卡 |
| 4 | Why-us（压缩） | 为何不是词库/乱刷 | 流程、价格 |
| 5 | FAQ | 运营细节与边界 | 主转化说服 / 复述信任链 |
| 6 | 终 CTA | 现在开始 | 新信息 |

**废止（首页）：**

- Free$0 大卡并排 Coach 价表
- 「Free Week 1 / Unlock Week 2 / Pro 月费 / mastery gate」
- How-it-works 旧 6 步
- 「样例日 = 计划日历 Day1」（若 Day1 是单技能单元，则只试用单词）

---

## 3. Hero

**承诺：** HSK Level 3；先免费看清弱项与完整方案，再按工作量一次买断（非订阅）。

**支撑一句：** 付款前已有：完整报告、大纲与报价、跨技能样例（含 1 次 AI 写作精批）、锁定预览。

| 元素 | 规格 |
|------|------|
| 主 CTA | `Start with a free diagnosis` → 注册/onboarding（服务选择在 onboarding，Hero 不强迫选 SKU） |
| 次 CTA | `See how it works` → 锚点 `#before-you-pay` |
| 禁写 | Week 1 / 月费 / 首屏价表 / 首屏塞三服务细节 |

品牌/产品名保持首屏主信号；视觉体系沿用现有营销壳。

---

## 4. 可信度链（`#before-you-pay`）

**标题：** `What you get before you pay`  
**副标题：** `Full diagnosis, a clear quote, and a real multi-skill sample — including one AI writing review.`

| # | 步骤 | 说明 |
|---|------|------|
| 1 | Free diagnosis | Level 3 听读诊断；不计免费模考额度 |
| 2 | Full AI report | 完整弱项报告，不截断（DeepSeek coach） |
| 3 | Outline + one quote | 完整大纲 + 总工作量 + 一次性报价 |
| 4 | Sample taste | 见 §4.1 |
| 5 | Locked previews | 后续任务可看不可做；点到报价 |

**呈现：** 保留 `HowItWorksShowcase` 步骤条 + 预览壳 + 轮播交互，替换步骤数据与预览内容。锚点由 `#how-it-works` 改为 `#before-you-pay`。

**与 onboarding：** 产品流为选服务 → 诊断 → …；营销链从诊断起讲。首页不假装没有选服务，也不把选服务做成抢主 CTA 的第 0 步。

### 4.1 Sample taste（核心修订）

**问题：** 若课表按「一天一种技能」（词→听→语→写）排，则「样例 = 日历 Day1」≈ 只试用单词，听力/语法/写作无体感 → 伤付费转化。

**锁定解法 A：** 样例与日历 Day **解耦**。

- 免费可执行内容 = 独立 **taster set**（跨技能拼盘），不是裸复用 Day1。
- 拼盘含：词汇一小撮 + 听力几题 + 语法几题 + **写作 1 篇 + 完整 AI 精批 1 次**。
- 总量约 30–45 分钟。
- 日历仍可按单元日排；不影响样例权益。

**全貌分工：**

| 目标 | 负责层 |
|------|--------|
| 跨技能体感（含写作精批） | Sample taste |
| 结构全貌 | Outline |
| 价格全貌 | One quote |
| 个性化钩子 | Locked previews（引用本人弱项；写作「他人样例」批改可另作锁卡，不替代本人 1 次精批） |

### 4.2 样例写作精批 · 成本与风控

- **模型：** DeepSeek（与 Coach 一致；现网写作路由仍为 OpenAI 的，实现时迁 DeepSeek）。
- **成本（估）：** `deepseek-v4-pro` 单次约 **$0.0004–$0.002**（含余量）；1 万账号各 1 次 ≈ 数美元级。相对 Coach 包 $13–$39，**包得住 → 样例直接开放完整精批**。
- **风控：** 每账号 **lifetime 1 次**样例写作精批；非无限 Free API。
- **禁止：** 只展示他人批改、本人提交无反馈，作为样例写作的主体验。

---

## 5. 三服务中等卡

**标题：** `Choose how you want to prepare`  
**副标题：** `Same rate for every plan. You pick the outcome — system-led, you-led, or emergency.`

三列等权（移动端竖叠）。**禁止** Free$0 并排大卡。

| 卡 | 主导 | 适合谁 | 价格露出 | 一句 |
|----|------|--------|----------|------|
| Coach package | 系统 | 固定周期、少选择 | **$13 / $26 / $39**（4/8/12 周） | System builds the weeks. You follow. |
| Custom exam plan | 用户 | 有考期、自控负荷 | **Priced by workload** → 诊断后一次报价 | You set the mix. We check it fits before exam day. |
| Emergency sprint | 系统 | 距考 ≤6 天 | **First sprint free**（一生一次）；再次按工作量、无加急溢价 | Short window. Full push. One free per account. |

- 卡 CTA：未登录 → 注册/onboarding；已登录 → `/plan/quote`。文案可用 `Start with diagnosis`。
- 次链：`Full pricing` → `/pricing`。
- 脚注可选：`Pay once. No subscription. Unused work credited if you replan.`
- 卡内不堆完整 `PRO_BENEFITS`；强调**同一费率**。

---

## 6. Why-us（压缩）

**形态：** 取消双栏大对比；**标题 + 三要点单列** + 大纲权威脚注。

**标题：** `Built for your first real HSK — not another endless word bank`

1. **Exam-dated, not endless** — 对准考期或固定 coach 周期，不是无限 streak。  
2. **HSK Level 3 syllabus (GF0025-2021)** — 现行 Level 3，非旧 2.0 词表。  
3. **Diagnosis → plan → practice** — 弱项驱动下一步；付款前可见大纲与报价。

**脚注：** Aligned to HSK Level 3 (GF0025-2021). Not affiliated with Hanban. · `/hsk-2-vs-3` · chinesetest.cn

**禁写：** mastery gate / next week unlocks；本段塞价表或服务卡。

---

## 7. FAQ + 终 CTA

### 7.1 FAQ

**标题：** `Questions before you start`

| # | Q | A |
|---|---|---|
| 1 | Is this HSK 2.0 or HSK Level 3? | Level 3（GF0025-2021）；链 exam guide |
| 2 | How long is the free diagnosis? | 一次听读诊断，短于官方全卷；用于开报告与方案 |
| 3 | Is the free sample limited? | 是。每账号一次跨技能试学（含 1 次 AI 写作精批），不是无限免费练习。完整链见上方 Before you pay。 |
| 4 | Is writing scored by AI? | 样例含 1 次完整精批（DeepSeek）；此后随所购包 |
| 5 | What are the three plans? | Coach / Custom / Sprint（首次 Sprint 免费） |
| 6 | Do you charge more when the exam is soon? | 否；同一费率，无加急溢价 |
| 7 | Do I pick an HSK level? | 否；单轨 Level 3 |

**删除旧 FAQ：** Week 1 措辞；「Free 可交写作但 AI 精批仅付费」的旧二分。

### 7.2 终 CTA

- 标题：`Get your free diagnosis`
- 支撑：`No credit card. See your report, outline, and a real sample — including one AI writing review — before you pay.`
- 主：`Start with a free diagnosis`
- 次：`See plans` → 锚到三服务节或 `/pricing`

---

## 8. 对产品/工程的隐含要求（首页文案之外）

实施首页时，下列行为须与文案一致（可列入实现计划任务，不全在 marketing 组件内）：

1. **Taster set 生成/门禁**：与日历 Day1 解耦；跨技能；账号级 lifetime 标记样例写作精批已用。  
2. **写作评分迁 DeepSeek**（或样例路径走 DeepSeek），与成本假设一致。  
3. **MarketingFaq / ProblemFrame / HowItWorksShowcase / 首页 Pricing 嵌入** 按本文替换；`/pricing` 保留完整价目。  
4. E2E：首页文案与锚点、定价页分流断言更新。

---

## 9. 非目标

- 不在本设计中重做视觉品牌体系（字体/色板大换）。  
- 不把首页做成完整 `/pricing` 镜像。  
- 不改登录后 Dashboard IA（另案）。  
- 不在本 spec 钉 ρ/权重数值（已在 LP 方案钉）。

---

## 10. 验收标准（设计层）

用户只看首页应能回答：

1. 付费前白拿什么？（五步链）  
2. 样例会不会只有单词？（否——跨技能 + 1 次写作精批）  
3. 三种服务怎么选、价格形态？（三卡）  
4. 为何不是词库？（三要点）  
5. 样例有没有限？（FAQ #3）  

**失败标准：** 首屏或信任链仍出现 Week 1 墙 / Free$0 并排价表 / 样例=单技能 Day1。
