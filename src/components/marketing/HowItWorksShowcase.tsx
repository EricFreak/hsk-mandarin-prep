"use client";

import { useCallback, useState } from "react";

/** Canonical demo persona — keep every mock on these numbers. */
const PERSONA = {
  mockScorePct: 72,
  readinessPct: 68,
  listening: 58,
  reading: 78,
  vocab: 85,
  grammar: 72,
  writingReview: 72,
  examDate: "September 12, 2026",
  daysLeft: 42,
} as const;

const STEPS = [
  {
    id: "diagnosis",
    step: "1",
    title: "Free Diagnosis",
    body: "Level 3 listening and reading — sized to open your report, not burn a mock quota.",
  },
  {
    id: "report-plan",
    step: "2",
    title: "Report · Outline · Quote",
    body: "Full weakness report, exam-dated outline, one-time quote — plus locked peeks of later work.",
  },
  {
    id: "sample",
    step: "3",
    title: "Sample Taste + Writing AI",
    body: "Multi-skill sample including one full AI writing review.",
  },
] as const;

type StepId = (typeof STEPS)[number]["id"];

const DESKTOP_FRAME =
  "mt-10 hidden lg:grid lg:h-[30rem] lg:max-h-[30rem] lg:grid-cols-[minmax(0,16rem)_1fr] lg:items-stretch lg:gap-8 lg:overflow-hidden";

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
    <div className="flex h-full min-h-0 max-h-full flex-col overflow-hidden rounded-2xl border border-mist bg-white shadow-card">
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
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-paper-dark/25 p-3 sm:p-3.5">
        {children}
      </div>
    </div>
  );
}

function MockExamPreview() {
  return (
    <PreviewChrome title="HSK 3 Diagnosis · Listening & reading" badge="Free">
      <div className="grid h-full min-h-0 gap-2.5 lg:grid-cols-[1fr_12.5rem]">
        <div className="flex min-h-0 flex-col gap-1.5">
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

          <div className="rounded-lg border border-mist bg-white px-2.5 py-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
              Earlier in this section
            </p>
            <ul className="mt-1 space-y-1 text-[11px] text-ink-muted">
              <li className="flex justify-between gap-2">
                <span>Q1 · 她今天去哪儿？</span>
                <span className="font-medium text-jade">✓ 商店</span>
              </li>
              <li className="flex justify-between gap-2">
                <span>Q2 · 男的怎么去机场？</span>
                <span className="font-medium text-jade">✓ 坐地铁</span>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-jade">
              Listening · Question 3 of 8
            </p>
            <p className="mt-0.5 text-[11px] text-ink-muted">
              ▶ Audio · plays once · 你明天几点去学校？
            </p>
            <p className="mt-1 font-display text-lg font-semibold leading-snug text-ink">
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
                    : "border-mist bg-white text-ink-muted"
                }`}
              >
                <span className="mr-1.5 font-semibold text-ink-muted">
                  {String.fromCharCode(65 + index)}.
                </span>
                {choice}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <div className="rounded-lg border border-mist bg-white px-2.5 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
                Up next · Reading
              </p>
              <p className="mt-1 text-xs leading-snug text-ink">
                他常常坐地铁去公司，因为___很方便。
              </p>
              <p className="mt-1 text-[10px] text-ink-muted">Cloze · pick 1 of 4</p>
            </div>
            <div className="rounded-lg border border-mist bg-white px-2.5 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
                Up next · Writing
              </p>
              <p className="mt-1 text-xs leading-snug text-ink">介绍你喜欢的运动（约 80 字）</p>
              <p className="mt-1 text-[10px] text-ink-muted">AI review in sample step</p>
            </div>
          </div>

          <div className="rounded-lg border border-mist bg-white px-2.5 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
              Session notes
            </p>
            <ul className="mt-1 space-y-1 text-[11px] leading-snug text-ink-muted">
              <li>· Audio plays once — same as official format</li>
              <li>· Sections unlock in order: Listening → Reading → Writing</li>
              <li>· Free diagnosis — doesn&apos;t burn mock-exam quota</li>
            </ul>
          </div>
        </div>

        <div className="flex min-h-0 flex-col gap-1.5">
          <div className="rounded-lg border border-mist bg-white p-2.5">
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
                  <div className="h-1.5 overflow-hidden rounded-full bg-paper-dark">
                    <div
                      className="h-full rounded-full bg-jade"
                      style={{ width: `${(row.done / row.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-mist bg-white p-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
              After this unlocks
            </p>
            <ul className="mt-2 space-y-1.5 text-[11px] leading-snug text-ink-muted">
              <li>
                Heatmap L{PERSONA.listening} · R{PERSONA.reading} · V{PERSONA.vocab} · G
                {PERSONA.grammar}
              </li>
              <li>Full coach report · not truncated</li>
              <li>Exam-dated outline + one-time quote</li>
              <li>Sample taste with writing AI</li>
            </ul>
          </div>

          <div className="rounded-lg border border-seal/20 bg-seal/5 p-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-seal">
              Detected so far
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {["几点", "明天", "周末", "车票"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-ink"
                >
                  {tag}
                </span>
              ))}
            </div>
            <ul className="mt-2 space-y-1 text-[10px] leading-snug text-ink-muted">
              <li>· Time / schedule cluster forming</li>
              <li>· Seeds Week 3 listening drills by name</li>
              <li>
                · Target readiness {PERSONA.readinessPct}% if you follow the plan
              </li>
            </ul>
          </div>
        </div>
      </div>
    </PreviewChrome>
  );
}

function ReportPlanPreview() {
  const outlineWeeks = [
    { week: 1, theme: "Vocab + grammar", detail: "40 drills · 1 writing", status: "Sample" },
    { week: 2, theme: "Grammar patterns", detail: "因为…所以…", status: "Locked" },
    { week: 3, theme: "Listening · time/travel", detail: "24 miss-type items", status: "Locked" },
    { week: 4, theme: "Reading + writing", detail: "AI review", status: "Locked" },
  ];

  return (
    <PreviewChrome title="Report · Outline · Quote · Locked peeks" badge="Preview">
      <div className="flex h-full min-h-0 flex-col gap-2">
        <div className="grid gap-2 lg:grid-cols-[1fr_9.5rem]">
          <div className="rounded-lg border border-mist bg-white p-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-jade/10 px-2 py-0.5 text-[10px] font-semibold text-jade">
                DeepSeek coach
              </span>
              <span className="text-[10px] text-ink-muted">
                Mock {PERSONA.mockScorePct}% · example learner
              </span>
            </div>
            <h3 className="mt-1.5 font-display text-base font-semibold leading-snug text-ink">
              You&apos;re close — listening is the bottleneck
            </h3>
            <p className="mt-1 text-[11px] leading-snug text-ink-muted">
              Gap: time / travel audio (几点、周末、车票). Vocab and reading are solid.
            </p>
            <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {[
                { label: "L", pct: PERSONA.listening, hot: true },
                { label: "R", pct: PERSONA.reading, hot: false },
                { label: "V", pct: PERSONA.vocab, hot: false },
                { label: "G", pct: PERSONA.grammar, hot: false },
              ].map((row) => (
                <div
                  key={row.label}
                  className={`rounded-md border px-2 py-1 text-center ${
                    row.hot ? "border-seal/30 bg-seal/5" : "border-mist bg-paper-dark/40"
                  }`}
                >
                  <p className="font-display text-sm font-semibold text-ink">{row.pct}%</p>
                  <p className="text-[9px] text-ink-muted">{row.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-mist bg-white p-2.5 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
              Readiness
            </p>
            <p className="mt-0.5 font-display text-3xl font-semibold text-jade">
              {PERSONA.readinessPct}%
            </p>
            <p className="mt-1 text-[10px] leading-snug text-ink-muted">
              If you follow this week&apos;s tasks toward {PERSONA.examDate.split(",")[0]}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-mist bg-white px-2.5 py-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-jade">
            Target
          </span>
          <span className="text-xs font-semibold text-ink">{PERSONA.examDate}</span>
          <span className="text-[11px] text-ink-muted">
            · {PERSONA.daysLeft} days · from diagnosis ({PERSONA.mockScorePct}%)
          </span>
        </div>

        <ul className="grid grid-cols-2 gap-1.5 lg:grid-cols-4">
          {outlineWeeks.map((row) => (
            <li
              key={row.week}
              className={`rounded-lg border px-2 py-1.5 ${
                row.week === 1 ? "border-jade/30 bg-jade/5" : "border-mist bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-1">
                <p className="text-[11px] font-semibold leading-snug text-ink">
                  W{row.week} · {row.theme}
                </p>
                <span
                  className={`shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-semibold uppercase ${
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
        </ul>

        <div className="grid gap-1.5 sm:grid-cols-3">
          <div className="rounded-lg border border-mist bg-white px-2.5 py-2">
            <p className="text-[10px] font-semibold uppercase text-ink-muted">Coach pack</p>
            <p className="font-display text-sm font-semibold text-ink">$13 / $26 / $39</p>
            <p className="text-[10px] text-ink-muted">4 / 8 / 12 wk · pay once</p>
          </div>
          <div className="rounded-lg border border-mist bg-white px-2.5 py-2">
            <p className="text-[10px] font-semibold uppercase text-ink-muted">Exam custom</p>
            <p className="font-display text-sm font-semibold text-ink">Same unit rate</p>
            <p className="text-[10px] text-ink-muted">Quote after diagnosis</p>
          </div>
          <div className="rounded-lg border border-mist bg-white px-2.5 py-2">
            <p className="text-[10px] font-semibold uppercase text-ink-muted">Sprint</p>
            <p className="font-display text-sm font-semibold text-ink">First free</p>
            <p className="text-[10px] text-ink-muted">≤6 days · then same rate</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-lg border border-dashed border-mist bg-white px-2.5 py-2">
          <span className="absolute right-2 top-2 rounded-full bg-ink/80 px-1.5 py-0.5 text-[8px] font-semibold uppercase text-white">
            Locked peek
          </span>
          <p className="pr-16 text-[10px] font-semibold uppercase tracking-wide text-seal">
            After you pay · readable now
          </p>
          <p className="mt-0.5 text-xs font-semibold text-ink">
            Week 3 · Listening · Numbers &amp; time — 24 items from your misses
          </p>
          <p className="mt-0.5 text-[10px] text-ink-muted">
            Start stays locked until purchase · look, don&apos;t do
          </p>
        </div>
      </div>
    </PreviewChrome>
  );
}

function SampleTastePreview() {
  return (
    <PreviewChrome title="Sample taste · Writing AI review included" badge="Free once">
      <div className="grid h-full min-h-0 gap-2.5 lg:grid-cols-[8.5rem_1fr]">
        <div className="flex min-h-0 flex-col gap-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
            Cross-skill taster
          </p>
          {[
            { skill: "Vocab", detail: "12 words" },
            { skill: "Listen", detail: "4 clips" },
            { skill: "Grammar", detail: "3 checks" },
            { skill: "Writing", detail: "AI review", hot: true },
          ].map((item) => (
            <div
              key={item.skill}
              className={`rounded-lg border px-2.5 py-1.5 ${
                item.hot ? "border-jade bg-jade/10" : "border-jade/25 bg-jade/5"
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <p className="text-xs font-semibold text-ink">{item.skill}</p>
                <span className="text-[10px] font-semibold text-jade">✓</span>
              </div>
              <p className="text-[10px] text-ink-muted">{item.detail}</p>
            </div>
          ))}
          <ul className="rounded-lg border border-mist bg-white px-2.5 py-2 text-[10px] leading-snug text-ink-muted">
            <li>· ~35 min, one sitting</li>
            <li>· From your real plan</li>
            <li>· No card needed</li>
            <li>· Finish → quote unlocks</li>
          </ul>
        </div>

        <div className="flex min-h-0 flex-col gap-1.5 rounded-lg border border-jade/30 bg-white p-2.5">
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
              <p className="font-display text-2xl font-semibold text-jade">
                {PERSONA.writingReview}
              </p>
              <p className="text-[9px] font-semibold uppercase text-ink-muted">
                writing / 100
              </p>
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
            <p className="mt-1 text-xs leading-snug text-ink">
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

          <div className="grid grid-cols-2 gap-1.5">
            <div className="rounded-md border border-seal/20 bg-seal/5 px-2 py-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-seal">
                Grammar
              </p>
              <ul className="mt-1 space-y-1 text-[10px] leading-snug text-ink-muted">
                <li>
                  <span className="font-medium text-ink">更健康了</span> marks
                  change-of-state better than 健康的.
                </li>
                <li>
                  Link reason + feeling with{" "}
                  <span className="font-medium text-ink">因为…所以…</span>
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

          <div className="rounded-md border border-jade/25 bg-jade/5 px-2 py-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-jade">
              Rewrite to try
            </p>
            <p className="mt-1 text-[11px] leading-snug text-ink">
              因为打篮球既有意思又能锻炼身体，
              <span className="rounded bg-jade/15 px-0.5 font-medium text-jade">所以</span>
              我每个周末都和朋友一起打。
            </p>
          </div>

          <div className="rounded-md border border-mist bg-paper-dark/40 px-2 py-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
              Examiner note
            </p>
            <p className="mt-1 text-[10px] leading-snug text-ink-muted">
              Task score (<span className="font-medium text-ink">68</span>) is the soft
              spot — answer both “what” and “why” in one 因为…所以… chain. Same DeepSeek
              examiner continues in the pack after this free sample.
            </p>
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
    case "report-plan":
      return <ReportPlanPreview />;
    case "sample":
      return <SampleTastePreview />;
  }
}

export default function HowItWorksShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);

  const goTo = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const goPrev = useCallback(() => {
    setActiveIndex((i) => Math.max(0, i - 1));
  }, []);

  const goNext = useCallback(() => {
    setActiveIndex((i) => Math.min(STEPS.length - 1, i + 1));
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
          Diagnose, see your report with an exam-dated outline and quote, then try a real
          multi-skill sample — including one AI writing review.
        </p>

        {/* Mobile: one step at a time */}
        <div className="mt-10 lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={goPrev}
              disabled={activeIndex === 0}
              className="rounded-lg border border-mist bg-white px-3 py-2 text-sm font-medium text-ink disabled:opacity-40"
            >
              Prev
            </button>
            <p className="text-center text-xs font-semibold text-ink-muted">
              Step {activeStep.step} of {STEPS.length} · {activeStep.title}
            </p>
            <button
              type="button"
              onClick={goNext}
              disabled={activeIndex === STEPS.length - 1}
              className="rounded-lg border border-mist bg-white px-3 py-2 text-sm font-medium text-ink disabled:opacity-40"
            >
              Next
            </button>
          </div>
          <p className="mt-3 text-sm text-ink-muted">{activeStep.body}</p>
          <div
            id="before-you-pay-preview-mobile"
            className="mt-4 h-[28rem] overflow-hidden"
            aria-live="polite"
          >
            <div className="h-full min-h-0">
              <StepPreview stepId={activeStep.id} />
            </div>
          </div>
        </div>

        {/* Desktop: equal-height rail + preview */}
        <div className={DESKTOP_FRAME}>
          <ol
            className="flex h-full min-h-0 flex-col gap-2"
            aria-label="Before you pay steps"
          >
            {STEPS.map((step, index) => {
              const isActive = index === activeIndex;
              return (
                <li key={step.id} className="min-h-0 flex-1">
                  <button
                    type="button"
                    onClick={() => goTo(index)}
                    className={`flex h-full w-full flex-col justify-center rounded-xl border px-3 py-2.5 text-left transition-all duration-200 ${
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
                        className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-display text-xs font-semibold ${
                          isActive ? "bg-jade text-white" : "bg-seal/10 text-seal"
                        }`}
                      >
                        {step.step}
                      </span>
                      <h3 className="min-w-0 font-display text-sm font-semibold leading-snug text-ink">
                        {step.title}
                      </h3>
                    </div>
                    <p className="mt-1.5 text-xs leading-snug text-ink-muted">{step.body}</p>
                  </button>
                </li>
              );
            })}
          </ol>

          <div
            id="before-you-pay-preview"
            className="min-h-0 min-w-0 lg:h-full lg:overflow-hidden"
            aria-live="polite"
            aria-label={`Step ${activeStep.step}: ${activeStep.title}`}
          >
            <div className="h-full min-h-0">
              <StepPreview stepId={activeStep.id} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
