# Handoff — 2026-07-15/16 短跑道 + 单位时间公平定价

**Status:** 计费终案 **Locked 2026-07-16** · 行程锁项大部分已对齐 · **未实施代码**  
**Branch:** `feature/mvp-implementation`  
**Worktree:** `/Users/eric/cursor_projects/hsk-mandarin-prep/.worktrees/mvp-implementation`  
**Live:** https://hsk-mandarin-prep.vercel.app  

---

## 开口第一句（下次续）

> 计费已锁：Coach-day 单价 R + Runway pack + sprint（D≤6）一生一次免费。下一步等你下令写**实现计划**或先钉 **R 的具体美元价**；未下令不改代码。

---

## 2026-07-16 已锁定（计费）

权威：`docs/superpowers/specs/2026-07-16-unit-time-fair-pricing-scheme.md`

| # | 锁定 |
|---|------|
| 1 | 采纳终案 P1–P5 + R-Pay-1…6 |
| 2 | Sprint 免费窗 **D≤6**（含今天考） |
| 3 | 首版 **Runway pack**；月费预充 → 二期 |
| 4 | **保留** exam_sprint；每账号 **lifetime 一次** Free |

适配：

- **standard / compressed：** Free 第一周 → 清关买剩余天×R  
- **exam_sprint：** 首次整段 Free；再次 D×R，无紧急溢价  

回写：`2026-07-15-existing-scheme-impact-and-revision.md` §1c / R3 / §7  

画布：`unit-time-fair-pricing-final.canvas.tsx` · `pricing-model-horizon-mismatch.canvas.tsx`

---

## 仍有效的行程锁项（此前）

| 项 | 锁 |
|----|-----|
| 内容策略 | Coach-led / Focus-led；五维 Σ100% |
| 退回 Coach | 生成前向导；生成后仅 Custom |
| 变更 | Custom replan 整单替换，禁止打补丁 |
| ◆D1 三档 | ≥21 standard / 7–20 compressed / 1–6 sprint |
| 纪律 | 改产品须修订总案闭环 |

开放（未单锁）：R 的具体价格数字；compressed 是否强制策略二选一（默认两档都提供）。

---

## 明确不要做

- 未下令不改代码 / checkout / entitlements  
- 不擅自扩积压  
- 不恢复「月费同学费=公平」或「sprint 双拍考期过了再转化」为主叙事  

---

## 本地未提交杂项（可选另 commit）

- `DashboardView.tsx`（去 Syncing）  
- `scripts/reset-user-data.mjs`  
- `docs/prototypes/`  

---

## 建议下一步（需下令）

1. 钉 **R**（或每周展示价 W）与 Runway pack Stripe 形态  
2. 写实现计划：字段 `free_sprint_used_at`、pack 余额、生成闸门、废 `max(21,D)` on short  
3. 实现 + 测试  
