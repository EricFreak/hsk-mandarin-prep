# Handoff — 2026-07-16 首页 IA 重梳（EOD）

**Status:** Design **Approved 2026-07-17** · Spec 已写 · **未改代码**  
**Branch:** `feature/mvp-implementation`  
**Worktree:** `/Users/eric/cursor_projects/hsk-mandarin-prep/.worktrees/mvp-implementation`  
**PR（三服务 LP 已实现）：** https://github.com/EricFreak/hsk-mandarin-prep/pull/2  
**权威产品方案：** `docs/superpowers/specs/2026-07-16-three-service-lp-pricing-design.md`  
**首页 IA Spec：** `docs/superpowers/specs/2026-07-17-homepage-ia-design.md`

---

## 开口第一句（下次续）

> 首页 IA design 已写入 `2026-07-17-homepage-ia-design.md`。请你审完 spec；确认后写实现计划（writing-plans），未下令不改代码。

---

## 已锁定（今天）

| # | 决策 | 选择 |
|---|------|------|
| 1 | 主叙事轴 | **A. 信任链优先**（诊断→报告→大纲报价→样例日→再介绍三服务） |
| 2 | 三服务在首页的深度 | **2. 中等展示**（三张服务卡：谁主导 / 适不适合你 / 价格形态；完整价目仍在 `/pricing`） |
| 3 | How it works 处置 | **A. 整段改成免费可信度链**（取代旧 6 步 mock→周任务） |
| 4 | 整页骨架方案 | **方案 1 · 信任漏斗**（用户回「A」视为确认方案 1） |

### 方案 1 章节顺序

```text
Hero
→ 可信度链（原 How it works 位）
→ 三服务中等卡
→ Why-us（压缩，去掉周解锁旧话）
→ FAQ
→ 终 CTA
```

### 明确废止（首页）

- Free$0 大卡并排 Coach 价表（旧 freemium 视觉语法）
- 「Free Week 1 / Unlock Week 2 / Pro 月费」叙事
- How-it-works 旧 6 步：mock → score → AI summary → roadmap → this week → track
- Problem / Why-us 里「mastery gate before next week unlocks」作为主卖点

---

## 第 1 节草稿（待确认 OK）

**章节所有权**

| # | 章节 | 只回答 | 不负责 |
|---|------|--------|--------|
| 1 | Hero | 这是什么、第一步做什么 | 价目、三服务细节 |
| 2 | 可信度链 | 付费前白拿什么、怎么走 | SKU 对比 |
| 3 | 三服务 | 三种结果怎么选、价格形态 | 完整权益表 |
| 4 | Why-us（压缩） | 为何不是词库/乱刷 | 流程、价格 |
| 5 | FAQ | 运营细节与边界 | 主转化说服 |
| 6 | 终 CTA | 现在开始 | 新信息 |

**Hero 必写**

- 品牌/产品名作首屏主信号
- 承诺：HSK Level 3；先免费看清弱项与完整方案，再按工作量一次买断（非订阅）
- 支撑：付款前已有完整报告、大纲与报价、1 天样例、锁定预览
- 主 CTA：`Start with a free diagnosis`（服务选择在 onboarding，Hero 不强迫选 SKU）
- 次 CTA：`See how it works` → 锚到可信度链

**Hero 禁写：** Free Week 1 / 月费 / 首屏价表 / 首屏塞三服务细节

---

## 设计节状态

1. ~~章节地图 + Hero~~ ✅  
2. ~~可信度链~~ ✅（含 A 拼盘 + DeepSeek 1× 精批）  
3. ~~三服务中等卡~~ ✅  
4. ~~Why-us 压缩~~ ✅  
5. ~~FAQ + 终 CTA~~ ✅（FAQ#3 = 样例有限，不复述信任链）  
6. ~~Spec 已写~~ → `2026-07-17-homepage-ia-design.md` → **等用户审 spec** → `writing-plans`

---

## 当前首页现状（问题快照）

文件：`src/app/(marketing)/page.tsx`

| 块 | 问题 |
|----|------|
| Hero | 仍像「填考期→诊断→周计划」单路径 |
| HowItWorksShowcase | 旧 6 步 freemium 漏斗 |
| ProblemFrame | 「weekly bar / mastery gate」偏 Coach-only |
| PricingTable on home | Free 卡 + Coach 价表并排 = 旧语法；与主轴打架 |
| FAQ | 仍有 Week 1 措辞 |

---

## 流程约束（续聊时）

- 技能：`brainstorming` — **未批准 design 前不写代码、不写 implementation plan**
- 用户规则：产品改动要改完整说明书；首页是营销 IA，spec 写清章节所有权与禁写
- 学习模式：实现阶段再请用户填关键文案抉择；今日只存档设计对话

---

## 相关链接

- 三服务 LP 设计：`docs/superpowers/specs/2026-07-16-three-service-lp-pricing-design.md`
- 实现计划：`docs/superpowers/plans/2026-07-16-three-service-lp-pricing.md`
- PR #2：https://github.com/EricFreak/hsk-mandarin-prep/pull/2
