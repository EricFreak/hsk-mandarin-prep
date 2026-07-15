# Handoff — 2026-07-15 短跑道 / Freemium 方案讨论存档

**Status:** EOD archived — **明日从「是否砍掉 exam_sprint」续**  
**Branch:** `feature/mvp-implementation`  
**Worktree:** `/Users/eric/cursor_projects/hsk-mandarin-prep/.worktrees/mvp-implementation`  
**Production:** Vercel 跟此分支 · https://hsk-mandarin-prep.vercel.app  
**Personas:** Free `wangkejay@126.com`；Pro `657696471@qq.com`  
**Chat transcript:** [`6b58f1e1-c3ca-4338-8a83-c1ef47b6163e`](../../../../.cursor/projects/Users-eric-cursor-projects/agent-transcripts/6b58f1e1-c3ca-4338-8a83-c1ef47b6163e/6b58f1e1-c3ca-4338-8a83-c1ef47b6163e.jsonl)  
**代码：** 今日 **未** 按新方案改产品代码（方案未 Locked）

---

## 明日第一句话（接续）

> 昨晚你倾向：**去掉距考 &lt;7 天的 exam_sprint，只保留 standard + compressed**。待你确认：选日期 &lt;7 天时用 **禁止选择** 还是 **可填但不生成旅程、引导改期**——确认后改写总案（废止 sprint），再谈 Free 本程次数防刷，**仍不改代码直到你下令**。

---

## 今日做了什么（方案 / 文档，非实现）

| 产出 | 路径 | 备注 |
|------|------|------|
| 旅程 UX 积压（只记你点名的） | `docs/superpowers/specs/2026-07-15-journey-ux-fix-backlog.md` | JUX-001/002/003 |
| 短跑道讨论底稿（含初版三档） | `…/2026-07-15-short-exam-horizon-design.md` | 对照用 |
| plan_shape / Focus 综合稿 | `…/2026-07-15-plan-shape-focus-product-scheme.md` | 曾被纠偏：不能只证新功能自闭环 |
| **现有方案冲击与修订总案** | `…/2026-07-15-existing-scheme-impact-and-revision.md` | 主战场；含白话冲击表 §1b、Freemium §1c、R1–R7 |
| 规则：改产品须修订总案 | `.cursor/rules/product-scheme-amendment.mdc` | 项目规则，**不是** Cursor User Rule |
| 规则：勿漏工程 Syncing 铬 | `.cursor/rules/ux-not-implementation-chrome.mdc` | 同左 |
| 专家评审画布：short 为何付费 | [canvases/short-mode-why-pay-expert-review.canvas.tsx](file:///Users/eric/.cursor/projects/Users-eric-cursor-projects/canvases/short-mode-why-pay-expert-review.canvas.tsx) | 十二席 |

本地未提交杂项（存档时按需处理，**勿进今日方案 commit 也行**）：

- `DashboardView.tsx` — 去掉 Syncing 指示（此前对话）  
- `scripts/reset-user-data.mjs` — `--to-signup` 等  
- `docs/prototypes/` — 抛开勿提交  

---

## 已锁定（你明确说过的，仍有效）

原则：**用户选择权**；未下令 **不写代码**；积压 **不擅自扩项**。

| 项 | 锁 |
|----|-----|
| Standard | 完整长旅程可保留现风 |
| 短跑道内容策略 | 诊断后 **Coach-led** 或 **Focus-led** |
| Focus 维 | HSK3 五维 skill；**% 自订且 Σ=100%** |
| 退回 Coach | 生成前向导可退；生成后仅 Custom replan |
| 计划变更 | **禁止 inplace 打补丁** → Custom replan 整单替换 |
| 产品纪律 | 一切变更改**现有总方案**至闭环无冲突；新功能不能当孤岛 |

---

## 今日共识演进（很重要）

### A. 三档 → 付费话术不能捏成一个 Short

初版时长轴：

| 档 | 距考约 |
|----|--------|
| standard | ≥21 或 unsure |
| compressed | 7–20 |
| exam_sprint | 1–6（含今天） |

曾用「单一 Short + 清关卖下场完整线」——你指出 **尤其 D=1 讲不通**；又指出「考期已过」话术含糊（产品并不知道考生是否进场），**已废弃作主叙事**。

### B. 你击中的根问题（专家团同意）

> Standard 有完整前链路（诊断→报告→周计划→Week1）才养出付费意愿。short（尤其 sprint）前链路不对等时，紧急用户凭什么付钱？

综合裁决（见画布）：

- **compressed** ≈ 迷你 Standard → 付费可讲「续剩余周」  
- **exam_sprint** → 信任厚度不够；不宜旅程型 Pro；临考收割焦虑否决  

### C. 防刷疑问（你提的）

「sprint 不收费 → 反复填短日期刷 Free 凑齐 HSK」：

- **≠** 刷到完整 Standard 课（sprint 是窄突击，不是全大纲）  
- **=** 仍怕「无限免费新本程」挖空 freemium → 需 **Free 本程次数闸**（与收不收费独立）  

### D. 你最新意向（未最终锁文案门）

**去掉 &lt;7 天的 exam_sprint，只留 compressed + standard。**

待你明日确认的门：

1. 用户选距考 **1–6 天**：① 日期选择器禁止，还是 ② 可填但不生成旅程、引导改期？  
2. （建议顺带）Free **本程**生涯/周期次数：1 / 2–3 / 先不定？  
3. exam_sprint 若废止：总案 R1/R3/§1c 整段重写；`◆D1` 从「D≤20=short」改为两档切分。

---

## 文档权威顺序（明日改方案时）

1. **以你口头最新意向为准**（两档），总案尚未改完之前 **impact 文里 sprint 双拍等段落视为过时草稿**  
2. 改完后：`2026-07-15-existing-scheme-impact-and-revision.md` 为修订总案  
3. `short-exam-horizon-design.md` / `plan-shape-focus-…` = 底稿/附录，冲突以总案为准  
4. 基线仍是：`2026-07-13` 完整旅程 · `2026-07-14` auth-aware · `2026-07-14` 闭环 rev2  

工作规则：`.cursor/rules/product-scheme-amendment.mdc`

---

## 明确不要做（除非你下令）

- 不要实现 Short/Focus/三档/两档代码  
- 不要擅自加积压项  
- 不要把 product-scheme 建成 **User Rule**（你已否）  
- 不要 force push / 改 git config  

---

## 明日建议顺序

1. 锁：**废 sprint + `&lt;7` 门（禁选 vs 可填不生成）**  
2. 改写 impact 总案：两档时长轴 + Freemium 同构（standard / compressed）+ Free 本程防刷条款  
3. 你确认 R 条款 Locked 后，再开实现（另开实现计划）  
4. （可选）提交/推送：Syncing 移除、reset 脚本、`.cursor/rules`——与方案分开亦可  

---

## 快速链接

- 积压：`docs/superpowers/specs/2026-07-15-journey-ux-fix-backlog.md`  
- 总案草稿：`docs/superpowers/specs/2026-07-15-existing-scheme-impact-and-revision.md`  
- 付费评审画布：`short-mode-why-pay-expert-review.canvas.tsx`  
- 前序闭环 handoff：`2026-07-14-post-login-closed-loop-v1.md`
