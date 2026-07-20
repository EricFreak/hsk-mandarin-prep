"use client";

import { useCallback, useState } from "react";

const STEPS = [
  {
    id: "diagnosis",
    step: "1",
    title: "Free Diagnosis",
    short: "Diagnosis",
    body: "Level 3 listening and reading — sized to open your report, not burn a mock quota.",
  },
  {
    id: "report",
    step: "2",
    title: "Full AI Report",
    short: "Full Report",
    body: "Complete weakness report — not truncated.",
  },
  {
    id: "outline",
    step: "3",
    title: "Outline + One Quote",
    short: "Outline & Quote",
    body: "Full outline, total workload, and a one-time quote.",
  },
  {
    id: "sample",
    step: "4",
    title: "Sample Taste + Writing AI",
    short: "Sample + AI",
    body: "Multi-skill sample including one full AI writing review.",
  },
  {
    id: "locked",
    step: "5",
    title: "Locked Task Previews",
    short: "Task Peeks",
    body: "See later work you can open after you pay — look, don’t do.",
  },
] as const;

type StepId = (typeof STEPS)[number]["id"];

function PreviewChrome({
  title,
  badge,
  children,
}: {
  title: string;
  badge: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-mist bg-white shadow-card">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-mist bg-paper-dark/60 px-3 py-2 sm:px-4">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-seal/40" />
          <span className="h-2.5 w-2.5 rounded-full bg-jade/40" />
          <span className="h-2.5 w-2.5 rounded-full bg-mist" />
          <span className="ml-2 truncate text-sm font-medium text-ink-muted">{title}</span>
        </div>
        <span className="shrink-0 rounded-full bg-jade/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-jade">
          {badge}
        </span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-3 sm:p-4">{children}</div>
    </div>
  );
}

function MockExamPreview() {
  return (
    <PreviewChrome title="HSK 3 Diagnosis · Listening & reading" badge="Free">
      <div className="grid h-full min-h-0 gap-3 lg:grid-cols-[1fr_13.5rem]">
        <div className="flex min-h-0 flex-col gap-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {["Listening", "Reading", "Writing"].map((section, index) => (
              <span
                key={section}
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                  index === 0
                    ? "bg-jade text-white"
                    : "border border-mist bg-paper-dark text-ink-muted"
                }`}
              >
                {section}
              </span>
            ))}
            <span className="ml-auto rounded-md border border-seal/20 bg-seal/5 px-2 py-0.5 text-[11px] font-semibold text-seal">
              24:18 left
            </span>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-jade">
              Listening · Question 3 of 8
            </p>
            <p className="mt-0.5 text-[11px] text-ink-muted">
              Audio · plays once · 你明天几点去学校？
            </p>
            <p className="mt-1.5 font-display text-lg font-semibold leading-snug text-ink sm:text-xl">
              你明天几点去学校？
            </p>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {["八点", "明天", "学校", "几点"].map((choice, index) => (
              <div
                key={choice}
                className={`rounded-lg border px-2.5 py-2 text-sm ${
                  index === 0
                    ? "border-jade bg-jade/10 font-medium text-jade"
                    : "border-mist text-ink-muted"
                }`}
              >
                <span className="mr-1.5 font-semibold text-ink-muted">
                  {String.fromCharCode(65 + index)}.
                </span>
                {choice}
              </div>
            ))}
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-2 gap-1.5 content-start">
            <div className="rounded-lg border border-mist bg-white px-2.5 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
                Up next · Reading
              </p>
              <p className="mt-1 text-xs leading-snug text-ink">
                他常常坐地铁去公司，因为___很方便。
              </p>
              <p className="mt-0.5 text-[10px] text-ink-muted">Cloze · pick 1 of 4</p>
            </div>
            <div className="rounded-lg border border-mist bg-white px-2.5 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
                Up next · Writing
              </p>
              <p className="mt-1 text-xs leading-snug text-ink">介绍你喜欢的运动（约 80 字）</p>
              <p className="mt-0.5 text-[10px] text-ink-muted">AI review in sample</p>
            </div>
          </div>

          <ul className="rounded-lg border border-mist bg-paper-dark/50 px-2.5 py-2 text-[11px] leading-snug text-ink-muted">
            <li>· Audio once — official format</li>
            <li>· Listening → Reading → Writing</li>
            <li>· Free · doesn&apos;t burn mock quota</li>
          </ul>
        </div>

        <div className="flex min-h-0 flex-col gap-2">
          <div className="rounded-lg border border-mist bg-paper-dark/50 p-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
              Exam progress
            </p>
            <div className="mt-2 space-y-2">
              {[
                { label: "Listening", done: 3, total: 8 },
                { label: "Reading", done: 0, total: 8 },
                { label: "Writing", done: 0, total: 1 },
              ].map((row) => (
                <div key={row.label}>
                  <div className="mb-0.5 flex justify-between text-[11px]">
                    <span className="font-medium text-ink">{row.label}</span>
                    <span className="text-ink-muted">
                      {row.done}/{row.total}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white">
                    <div
                      className="h-full rounded-full bg-jade"
                      style={{ width: `${(row.done / row.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="min-h-0 flex-1 rounded-lg border border-mist bg-white p-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
              What diagnosis unlocks
            </p>
            <ul className="mt-2 space-y-1.5 text-[11px] leading-snug text-ink-muted">
              <li>
                <span className="font-medium text-ink">Skill heatmap</span> — L58 · R78 · V85
              </li>
              <li>
                <span className="font-medium text-ink">Full coach report</span> — DeepSeek, not
                truncated
              </li>
              <li>
                <span className="font-medium text-ink">Sample writing AI</span> — one free
                red-line review
              </li>
            </ul>
          </div>
        </div>
      </div>
    </PreviewChrome>
  );
}

function SummaryPreview() {
  return (
    <PreviewChrome title="AI Learning Coach · Assessment report" badge="Preview">
      <div className="grid h-full min-h-0 gap-3 lg:grid-cols-[1fr_12.5rem]">
        <div className="flex min-h-0 flex-col gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-jade/10 px-2.5 py-0.5 text-[11px] font-semibold text-jade">
              DeepSeek coach
            </span>
            <span className="text-[11px] text-ink-muted">After HSK 3 diagnosis · example</span>
          </div>

          <div>
            <h3 className="font-display text-xl font-semibold leading-snug text-ink">
              You&apos;re close — listening is the bottleneck
            </h3>
            <div className="mt-2 space-y-1.5 text-xs leading-snug text-ink-muted sm:text-[13px]">
              <p>
                Mock score <span className="font-semibold text-ink">72%</span> — vocab and
                reading solid; most cloze and short passages correct.
              </p>
              <p>
                Gap: <span className="font-semibold text-seal">listening</span> on time /
                travel (几点、周末、车票). Two of three misses clustered there.
              </p>
              <p>
                One week of targeted listening + mistake-bank review → mid-70s to low-80s is
                realistic.
              </p>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-lg border border-jade/25 bg-jade/5 px-2.5 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-jade">
                Strengths
              </p>
              <ul className="mt-1.5 space-y-1 text-[11px] leading-snug text-ink-muted">
                <li>
                  <span className="font-medium text-ink">Vocabulary</span> — 85% cloze
                </li>
                <li>
                  <span className="font-medium text-ink">Reading</span> — short passages strong
                </li>
              </ul>
            </div>
            <div className="rounded-lg border border-seal/25 bg-seal/5 px-2.5 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-seal">
                Priority gaps
              </p>
              <ul className="mt-1.5 space-y-1 text-[11px] leading-snug text-ink-muted">
                <li>
                  <span className="font-medium text-seal">Listening · High</span> — time /
                  travel audio
                </li>
                <li>
                  <span className="font-medium text-ink">Grammar · Medium</span> — particles in
                  writing
                </li>
              </ul>
            </div>
          </div>

          <div className="rounded-lg border border-mist bg-paper-dark/50 px-2.5 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
              Mistake bank · started automatically
            </p>
            <ul className="mt-1.5 grid gap-x-3 gap-y-1 text-[11px] text-ink-muted sm:grid-cols-3">
              <li>
                <span className="font-medium text-ink">Q3</span> 几点 — time
              </li>
              <li>
                <span className="font-medium text-ink">Q5</span> 车票 — travel
              </li>
              <li>
                <span className="font-medium text-ink">Q7</span> 周末 — schedule
              </li>
            </ul>
            <p className="mt-1 text-[10px] text-ink-muted">
              These misses seed Week 3 drills by name.
            </p>
          </div>
        </div>

        <div className="flex min-h-0 flex-col rounded-lg border border-mist bg-paper-dark/50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
            Exam readiness
          </p>
          <p className="mt-1 font-display text-4xl font-semibold text-jade">68%</p>
          <p className="mt-1 text-[11px] leading-snug text-ink-muted">
            If you follow this week&apos;s tasks toward Sep 12.
          </p>
          <div className="mt-3 space-y-2.5 border-t border-mist pt-3">
            <div>
              <p className="text-[11px] font-semibold text-ink">Coach recommendation</p>
              <p className="mt-1 text-[11px] leading-snug text-ink-muted">
                15 listening items today · mistake bank tomorrow.
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-ink">Heatmap</p>
              <p className="mt-1 text-[11px] leading-snug text-ink-muted">
                L58 · R78 · V85 · G72
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-ink">Next</p>
              <p className="mt-1 text-[11px] leading-snug text-ink-muted">
                Outline + quote · then multi-skill sample
              </p>
            </div>
          </div>
        </div>
      </div>
    </PreviewChrome>
  );
}

function PlanPreview() {
  const journeyStages = [
    { label: "Diagnose", done: true },
    { label: "Foundation", current: true },
    { label: "Skills", done: false },
    { label: "Sprint", done: false },
  ];

  const outlineWeeks = [
    { week: 1, theme: "Vocab + grammar", detail: "40 drills · 1 writing", status: "Sample" },
    { week: 2, theme: "Grammar patterns", detail: "因为…所以… · particles", status: "Locked" },
    { week: 3, theme: "Listening · time/travel", detail: "24 miss-type items", status: "Locked" },
    { week: 4, theme: "Reading + writing", detail: "passages · AI review", status: "Locked" },
    { week: 5, theme: "Mini mocks", detail: "2 sections · score check", status: "Locked" },
  ];

  return (
    <PreviewChrome title="Journey Roadmap · Exam Sep 12, 2026" badge="Preview">
      <div className="flex h-full min-h-0 flex-col gap-2.5">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-jade">
              Target exam date
            </p>
            <p className="font-display text-lg font-semibold text-ink">September 12, 2026</p>
          </div>
          <p className="text-[11px] text-ink-muted">
            42 days · from diagnosis (72%) · same unit rate, three shapes
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-mist bg-paper-dark/50 px-2.5 py-2">
          {journeyStages.map((stage) => (
            <span
              key={stage.label}
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                stage.current
                  ? "bg-jade text-white"
                  : stage.done
                    ? "bg-jade/15 text-jade"
                    : "border border-mist bg-white text-ink-muted"
              }`}
            >
              {stage.done ? "✓ " : ""}
              {stage.label}
            </span>
          ))}
          <span className="ml-auto text-[11px] text-ink-muted">~18 tasks · ~11h total</span>
        </div>

        <ul className="grid grid-cols-2 gap-1.5 lg:grid-cols-3">
          {outlineWeeks.map((row) => (
            <li
              key={row.week}
              className={`rounded-lg border px-2.5 py-1.5 ${
                row.week === 1 ? "border-jade/30 bg-jade/5" : "border-mist bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-1.5">
                <p className="text-xs font-semibold leading-snug text-ink">
                  W{row.week} · {row.theme}
                </p>
                <span
                  className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase ${
                    row.status === "Sample"
                      ? "bg-jade/15 text-jade"
                      : "bg-paper-dark text-ink-muted"
                  }`}
                >
                  {row.status}
                </span>
              </div>
              <p className="mt-0.5 text-[10px] text-ink-muted">{row.detail}</p>
            </li>
          ))}
          <li className="flex items-center rounded-lg border border-dashed border-mist bg-paper-dark/40 px-2.5 py-1.5 text-[10px] leading-snug text-ink-muted">
            Weeks 6–8 continue after you pick a shape.
          </li>
        </ul>

        <div className="min-h-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
            One quote · three shapes · same unit rate
          </p>
          <div className="mt-1.5 grid h-[calc(100%-1rem)] gap-1.5 sm:grid-cols-3">
            <div className="rounded-lg border border-mist bg-white px-2.5 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
                Coach pack
              </p>
              <p className="mt-0.5 font-display text-base font-semibold text-ink">
                $13 / $26 / $39
              </p>
              <p className="text-[10px] text-ink-muted">4 / 8 / 12 wk · pay once</p>
              <ul className="mt-1.5 space-y-0.5 text-[10px] leading-snug text-ink-muted">
                <li>
                  Ex. 8 wk: <span className="font-medium text-ink">$26</span>
                </li>
                <li>96 drills · 8 AI · 4 mocks</li>
                <li>System builds weeks</li>
              </ul>
            </div>
            <div className="rounded-lg border border-mist bg-white px-2.5 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
                Exam custom
              </p>
              <p className="mt-0.5 font-display text-base font-semibold text-ink">
                Mix → live quote
              </p>
              <p className="text-[10px] text-ink-muted">Workload priced once</p>
              <ul className="mt-1.5 space-y-0.5 text-[10px] leading-snug text-ink-muted">
                <li>
                  This gap:{" "}
                  <span className="font-medium text-ink">listening-heavy → ~$22</span>
                </li>
                <li>Cut essays ↓ · add mocks ↑</li>
                <li>Still fit before Sep 12</li>
              </ul>
            </div>
            <div className="rounded-lg border border-mist bg-white px-2.5 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
                Emergency sprint
              </p>
              <p className="mt-0.5 font-display text-base font-semibold text-ink">
                First one free
              </p>
              <p className="text-[10px] text-ink-muted">≤ 6 days · once / account</p>
              <ul className="mt-1.5 space-y-0.5 text-[10px] leading-snug text-ink-muted">
                <li>
                  Now: <span className="font-medium text-jade">$0 first sprint</span>
                </li>
                <li>After: ~$13 for 6-day push</li>
                <li>No urgency premium</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </PreviewChrome>
  );
}

function SampleTastePreview() {
  const tasteStrip = [
    { skill: "Vocab", detail: "12 words", highlight: false },
    { skill: "Listen", detail: "4 clips", highlight: false },
    { skill: "Grammar", detail: "3 checks", highlight: false },
    { skill: "Writing", detail: "AI review", highlight: true },
  ];

  return (
    <PreviewChrome title="Sample taste · Writing AI review included" badge="Free once">
      <div className="grid h-full min-h-0 gap-3 lg:grid-cols-[9.5rem_1fr]">
        <div className="flex min-h-0 flex-col gap-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
            Cross-skill taster
          </p>
          {tasteStrip.map((item) => (
            <div
              key={item.skill}
              className={`rounded-lg border px-2.5 py-1.5 ${
                item.highlight
                  ? "border-jade bg-jade/10"
                  : "border-jade/25 bg-jade/5"
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <p className="text-xs font-semibold text-ink">{item.skill}</p>
                <span className="text-[10px] font-semibold text-jade">✓</span>
              </div>
              <p className="text-[10px] text-ink-muted">{item.detail}</p>
            </div>
          ))}
          <ul className="rounded-lg border border-mist bg-paper-dark/50 px-2.5 py-2 text-[10px] leading-snug text-ink-muted">
            <li>· ~35 min, one sitting</li>
            <li>· From your real plan</li>
            <li>· No card needed</li>
            <li>· Finish → quote unlocks</li>
          </ul>
        </div>

        <div className="flex min-h-0 flex-col gap-2 overflow-hidden rounded-lg border border-jade/30 bg-white p-2.5 sm:p-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-jade">
                DeepSeek writing review · free sample
              </p>
              <p className="mt-0.5 text-[11px] text-ink-muted">
                介绍你喜欢的运动，并说明原因（约 80 字）
              </p>
            </div>
            <div className="text-right">
              <p className="font-display text-2xl font-semibold text-jade">72</p>
              <p className="text-[9px] font-semibold uppercase text-ink-muted">/ 100</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {[
              { label: "Grammar", score: 70 },
              { label: "Vocab", score: 78 },
              { label: "Task", score: 68 },
              { label: "Flow", score: 74 },
            ].map((row) => (
              <div
                key={row.label}
                className="rounded-md border border-mist bg-paper-dark/40 px-1.5 py-1 text-center"
              >
                <p className="font-display text-sm font-semibold text-ink">{row.score}</p>
                <p className="text-[9px] text-ink-muted">{row.label}</p>
              </div>
            ))}
          </div>

          <div className="rounded-md border border-mist bg-paper-dark/40 px-2.5 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
              Your draft
            </p>
            <p className="mt-1 text-xs leading-snug text-ink sm:text-[13px]">
              我喜欢打篮球。因为篮球很有意思，我每个周末和朋友一起打。运动以后我觉得很开心，身体也
              <span className="bg-seal/15 text-seal line-through decoration-seal/60">
                健康的
              </span>
              <span className="ml-1 rounded bg-jade/15 px-1 font-medium text-jade">
                更健康了
              </span>
              。
            </p>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-2 gap-1.5 content-start">
            <div className="rounded-md border border-seal/20 bg-seal/5 px-2 py-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-seal">
                Grammar
              </p>
              <ul className="mt-1 space-y-1 text-[10px] leading-snug text-ink-muted">
                <li>
                  <span className="font-medium text-ink">更健康了</span> marks change-of-state
                  better than 健康的.
                </li>
                <li>
                  Link with <span className="font-medium text-ink">因为…所以…</span>
                </li>
              </ul>
            </div>
            <div className="rounded-md border border-jade/25 bg-jade/5 px-2 py-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-jade">
                Vocabulary · Next
              </p>
              <ul className="mt-1 space-y-1 text-[10px] leading-snug text-ink-muted">
                <li>Strong: 周末、朋友、开心</li>
                <li>
                  Try: <span className="font-medium text-ink">锻炼身体</span> /{" "}
                  <span className="font-medium text-ink">团队合作</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="rounded-md border border-jade/25 px-2 py-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-jade">
              Rewrite to try
            </p>
            <p className="mt-1 text-[11px] leading-snug text-ink">
              因为打篮球既有意思又能锻炼身体，
              <span className="rounded bg-jade/15 px-0.5 font-medium text-jade">所以</span>
              我每个周末都和朋友一起打。
            </p>
          </div>
        </div>
      </div>
    </PreviewChrome>
  );
}

function LockedPreviewsPreview() {
  return (
    <PreviewChrome title="Locked previews · your diagnosis, still visible" badge="Look only">
      <div className="flex h-full min-h-0 flex-col gap-2.5">
        <p className="text-xs leading-snug text-ink-muted">
          Paid tasks show real gap content — readable now;{" "}
          <span className="font-medium text-ink">Start stays locked</span> until you buy.
        </p>

        <div className="relative min-h-0 flex-[1.2] overflow-hidden rounded-lg border border-mist bg-white">
          <div className="absolute right-2 top-2 z-10 rounded-full bg-ink/80 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">
            Locked · Week 3
          </div>
          <div className="border-b border-mist bg-seal/5 px-3 py-2 pr-24">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-seal">
              Built from your misses
            </p>
            <p className="mt-0.5 font-display text-base font-semibold text-ink">
              Listening · Numbers &amp; time
            </p>
            <p className="mt-0.5 text-[10px] text-ink-muted">
              24 items · same cluster as diagnosis (几点 / 明天 / 周末)
            </p>
          </div>
          <ul className="divide-y divide-mist/80 px-3">
            {[
              { q: "Q1 · Audio", line: "男的明天几点开会？", tag: "Time · 几点" },
              { q: "Q2 · Audio", line: "他们周末去哪儿？", tag: "Schedule · 周末" },
              { q: "Q3 · Audio", line: "车票多少钱？", tag: "Travel · 车票" },
              { q: "Q4 · Audio", line: "飞机几点起飞？", tag: "Time · 几点" },
            ].map((row) => (
              <li key={row.q} className="flex items-center justify-between gap-2 py-1.5">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-ink-muted">{row.q}</p>
                  <p className="truncate text-sm text-ink">{row.line}</p>
                </div>
                <span className="shrink-0 rounded-full bg-paper-dark px-2 py-0.5 text-[9px] font-medium text-ink-muted">
                  {row.tag}
                </span>
              </li>
            ))}
          </ul>
          <div className="border-t border-dashed border-mist bg-paper-dark/40 px-3 py-1.5 text-center text-[11px] font-medium text-ink-muted">
            In your pack · Start locked until purchase
          </div>
        </div>

        <div className="grid min-h-0 flex-1 gap-2 sm:grid-cols-2">
          <div className="relative overflow-hidden rounded-lg border border-mist bg-white p-2.5">
            <div className="absolute right-2 top-2 rounded-full bg-ink/80 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-white">
              Locked
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-jade">
              Week 5 · Writing + AI
            </p>
            <p className="mt-0.5 pr-12 text-sm font-semibold text-ink">Essay: 我的假期计划</p>
            <div className="mt-1.5 space-y-1 text-[10px] leading-snug text-ink-muted">
              <p>
                <span className="font-medium text-seal">Grammar:</span> 了 / 过 on travel
                sentences
              </p>
              <p>
                <span className="font-medium text-jade">Vocab:</span> 打算、安排、特别
              </p>
              <p className="rounded bg-paper-dark/60 px-2 py-1">
                Full red-line unlocks with pack (7 more after free sample).
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-lg border border-mist bg-white p-2.5">
            <div className="absolute right-2 top-2 rounded-full bg-ink/80 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-white">
              Locked
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-jade">
              Week 4 · This week&apos;s map
            </p>
            <p className="mt-0.5 pr-12 text-sm font-semibold text-ink">Reading + writing mix</p>
            <ul className="mt-1.5 space-y-1 text-[10px] text-ink-muted">
              {[
                "Mon · 2 short passages",
                "Tue · 因为…所以… ×10",
                "Thu · Writing + AI review",
                "Sat · Mini mock · reading",
              ].map((line) => (
                <li key={line} className="flex gap-1.5">
                  <span className="text-jade" aria-hidden>
                    ·
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </PreviewChrome>
  );
}

function StepPreview({ stepId }: { stepId: StepId }) {
  switch (stepId) {
    case "diagnosis":
      return <MockExamPreview />;
    case "report":
      return <SummaryPreview />;
    case "outline":
      return <PlanPreview />;
    case "sample":
      return <SampleTastePreview />;
    case "locked":
      return <LockedPreviewsPreview />;
  }
}

export default function HowItWorksShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);

  const goTo = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const activeStep = STEPS[activeIndex];

  return (
    <section id="before-you-pay" aria-labelledby="before-you-pay-heading">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <h2
          id="before-you-pay-heading"
          className="text-center font-display text-3xl font-semibold text-ink"
        >
          What You Get Before You Pay
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-sm text-ink-muted">
          Full diagnosis, a clear quote, and a real multi-skill sample — including one AI
          writing review. Click a step to preview it.
        </p>

        <div className="mt-10 grid gap-8 lg:h-[40rem] lg:grid-cols-[minmax(0,18rem)_1fr] lg:items-stretch lg:gap-10">
          <ol
            className="flex gap-2 overflow-x-auto pb-1 lg:h-full lg:flex-col lg:gap-2 lg:overflow-visible lg:pb-0"
            aria-label="Before you pay steps"
          >
            {STEPS.map((step, index) => {
              const isActive = index === activeIndex;
              return (
                <li
                  key={step.id}
                  className="min-w-[10.5rem] shrink-0 lg:min-h-0 lg:min-w-0 lg:flex-1"
                >
                  <button
                    type="button"
                    onClick={() => goTo(index)}
                    className={`flex h-full w-full flex-col justify-center rounded-xl border px-3 py-3 text-left transition-all duration-200 ${
                      isActive
                        ? "border-jade/40 bg-jade/5 shadow-card"
                        : "border-mist bg-white hover:border-jade/20 hover:bg-paper-dark/50"
                    }`}
                    aria-current={isActive ? "step" : undefined}
                    aria-controls="before-you-pay-preview"
                    aria-label={step.title}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-display text-xs font-semibold transition-colors ${
                          isActive ? "bg-jade text-white" : "bg-seal/10 text-seal"
                        }`}
                      >
                        {step.step}
                      </span>
                      <h3 className="min-w-0 font-display text-sm font-semibold leading-snug text-ink">
                        {step.title}
                      </h3>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-ink-muted">{step.body}</p>
                  </button>
                </li>
              );
            })}
          </ol>

          <div
            id="before-you-pay-preview"
            className="min-h-[24rem] min-w-0 lg:h-full lg:min-h-0"
            aria-live="polite"
            aria-label={`Step ${activeStep.step}: ${activeStep.title}`}
          >
            <StepPreview stepId={activeStep.id} />
          </div>
        </div>
      </div>
    </section>
  );
}
