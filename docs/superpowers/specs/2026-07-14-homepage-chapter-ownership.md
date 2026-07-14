# Homepage chapter ownership (A) — executed

Date: 2026-07-14  
Status: Implemented  

## Principle

Necessary meaning stays. Each chapter **owns** it once. Side narration / duplicated microcopy is removed — not deleted from the product story.

## Ownership map

| Meaning | Owner |
|--------|--------|
| Promise + CTA | Hero |
| Why not random apps + syllabus cite | Problem |
| Coach loop | How it works preview (+ step names only) |
| Free Week 1 / Pro continue | Pricing (cards + section headline) |
| Mock length, writing AI, level picker, Free/Pro edge | FAQ |
| Final push | CTA buttons only |

## Removed as channels (content relocated)

- Hero ✓ badge stack and Free Week 1 in hero body  
- Problem eyebrow / support paragraph / brush rule  
- Standalone `SyllabusTrust`, `HomeBridge`  
- How it works intro, brush, per-step taglines  
- FAQ eyebrow / support line  
- Final CTA body paragraph  

## Verify

- Scroll home: each beat should feel like one job.  
- Freemium clarity lives under Pricing headline + cards.  
- `e2e/public/marketing.spec.ts` MKT-001.  
