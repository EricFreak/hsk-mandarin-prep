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
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-mist bg-paper-dark/60 px-4 py-2.5">
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
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-4 sm:p-5">{children}</div>
    </div>
  );
}

function MockExamPreview() {
  return (
    <PreviewChrome title="HSK 3 Diagnosis · Listening & reading" badge="Free">
      <div className="grid h-full min-h-0 gap-4 lg:grid-cols-[1fr_11rem]">
        <div className="flex min-h-0 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-jade px-2.5 py-0.5 text-[11px] font-semibold text-white">
              Listening
            </span>
            <span className="rounded-full border border-mist px-2.5 py-0.5 text-[11px] font-semibold text-ink-muted">
              Reading
            </span>
            <span className="ml-auto text-[11px] font-semibold text-seal">24:18 left</span>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-jade">
              Question 3 of 8
            </p>
            <p className="mt-1.5 font-display text-lg font-semibold text-ink">
              你明天几点去学校？
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {["八点", "明天", "学校", "几点"].map((choice, index) => (
              <div
                key={choice}
                className={`rounded-lg border px-3 py-2 text-sm ${
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
          <p className="mt-auto text-[11px] leading-relaxed text-ink-muted">
            Free diagnosis · doesn&apos;t burn mock quota · Listening → Reading → Writing
          </p>
        </div>
        <div className="flex flex-col justify-center gap-3 rounded-xl border border-mist bg-paper-dark/50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
            Progress
          </p>
          {[
            { label: "Listening", done: 3, total: 8 },
            { label: "Reading", done: 0, total: 8 },
            { label: "Writing", done: 0, total: 1 },
          ].map((row) => (
            <div key={row.label}>
              <div className="mb-1 flex justify-between text-[11px]">
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
    </PreviewChrome>
  );
}

function SummaryPreview() {
  return (
    <PreviewChrome title="AI Learning Coach · Assessment report" badge="Preview">
      <div className="grid h-full min-h-0 gap-4 lg:grid-cols-[1fr_10.5rem]">
        <div className="flex min-h-0 flex-col gap-3">
          <p className="text-[11px] text-ink-muted">
            DeepSeek coach · after Level 3 diagnosis
          </p>
          <h3 className="font-display text-xl font-semibold text-ink">
            You&apos;re close — listening is the bottleneck
          </h3>
          <p className="text-sm leading-relaxed text-ink-muted">
            Score <span className="font-semibold text-ink">72%</span>. Vocab and reading are
            solid. Gap:{" "}
            <span className="font-semibold text-seal">listening</span> on time and travel
            phrases (几点、周末、车票).
          </p>
          <div className="mt-auto grid gap-2 sm:grid-cols-2">
            <div className="rounded-lg border border-jade/25 bg-jade/5 px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-jade">
                Strengths
              </p>
              <p className="mt-1 text-xs text-ink-muted">Vocab 85% · Reading strong</p>
            </div>
            <div className="rounded-lg border border-seal/25 bg-seal/5 px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-seal">
                Priority gaps
              </p>
              <p className="mt-1 text-xs text-ink-muted">Listening high · Grammar medium</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-center rounded-xl border border-mist bg-paper-dark/50 p-4 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
            Readiness
          </p>
          <p className="mt-1 font-display text-4xl font-semibold text-jade">68%</p>
          <p className="mt-2 text-[11px] leading-relaxed text-ink-muted">
            If you follow this week&apos;s tasks
          </p>
        </div>
      </div>
    </PreviewChrome>
  );
}

function PlanPreview() {
  const outlineWeeks = [
    { week: 1, theme: "Vocab + grammar", status: "Sample" },
    { week: 2, theme: "Grammar patterns", status: "Locked" },
    { week: 3, theme: "Listening · time/travel", status: "Locked" },
    { week: 4, theme: "Reading + writing", status: "Locked" },
  ];

  return (
    <PreviewChrome title="Journey Roadmap · Exam Sep 12, 2026" badge="Preview">
      <div className="flex h-full min-h-0 flex-col gap-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-jade">
              Target exam
            </p>
            <p className="font-display text-lg font-semibold text-ink">September 12, 2026</p>
          </div>
          <p className="text-xs text-ink-muted">42 days · from your diagnosis</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["Diagnose ✓", "Foundation", "Skills", "Sprint"].map((label, i) => (
            <span
              key={label}
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                i === 1
                  ? "bg-jade text-white"
                  : i === 0
                    ? "bg-jade/15 text-jade"
                    : "border border-mist text-ink-muted"
              }`}
            >
              {label}
            </span>
          ))}
        </div>
        <ul className="grid min-h-0 flex-1 grid-cols-2 gap-2 content-start">
          {outlineWeeks.map((row) => (
            <li
              key={row.week}
              className={`rounded-lg border px-3 py-2 ${
                row.week === 1 ? "border-jade/30 bg-jade/5" : "border-mist bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-ink">
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
            </li>
          ))}
        </ul>
        <p className="border-t border-mist pt-2 text-[11px] text-ink-muted">
          One quote after diagnosis · same unit rate · pick coach / custom / sprint later
        </p>
      </div>
    </PreviewChrome>
  );
}

function SampleTastePreview() {
  return (
    <PreviewChrome title="Sample taste · Writing AI review included" badge="Free once">
      <div className="flex h-full min-h-0 flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-jade">
              DeepSeek writing review
            </p>
            <p className="mt-0.5 text-xs text-ink-muted">
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
        <div className="rounded-lg border border-mist bg-paper-dark/40 px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
            Your draft
          </p>
          <p className="mt-1 text-sm leading-snug text-ink">
            我喜欢打篮球。因为篮球很有意思…身体也
            <span className="bg-seal/15 text-seal line-through decoration-seal/60">健康的</span>
            <span className="ml-1 rounded bg-jade/15 px-1 font-medium text-jade">更健康了</span>。
          </p>
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-2 gap-2 content-start">
          <div className="rounded-lg border border-seal/20 bg-seal/5 px-2.5 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-seal">
              Grammar
            </p>
            <p className="mt-1 text-[11px] leading-snug text-ink-muted">
              Use <span className="font-medium text-ink">更健康了</span> for change-of-state.
            </p>
          </div>
          <div className="rounded-lg border border-jade/25 bg-jade/5 px-2.5 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-jade">
              Try next
            </p>
            <p className="mt-1 text-[11px] leading-snug text-ink-muted">
              锻炼身体 · 因为…所以…
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
      <div className="flex h-full min-h-0 flex-col gap-3">
        <p className="text-xs text-ink-muted">
          Paid tasks show real gap content — readable now, Start locked until you buy.
        </p>
        <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl border border-mist bg-white">
          <div className="absolute right-2.5 top-2.5 z-10 rounded-full bg-ink/80 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">
            Locked · Week 3
          </div>
          <div className="border-b border-mist bg-seal/5 px-3 py-2.5 pr-24">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-seal">
              From your misses
            </p>
            <p className="mt-0.5 font-display text-base font-semibold text-ink">
              Listening · Numbers &amp; time
            </p>
          </div>
          <ul className="divide-y divide-mist/80 px-3">
            {[
              { q: "Q1", line: "男的明天几点开会？", tag: "几点" },
              { q: "Q2", line: "他们周末去哪儿？", tag: "周末" },
              { q: "Q3", line: "车票多少钱？", tag: "车票" },
            ].map((row) => (
              <li key={row.q} className="flex items-center justify-between gap-2 py-2">
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
          <div className="border-t border-dashed border-mist bg-paper-dark/40 px-3 py-2 text-center text-[11px] font-medium text-ink-muted">
            Unlock with your pack · opens quote
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

        <div className="mt-10 grid gap-8 lg:h-[32rem] lg:grid-cols-[minmax(0,18rem)_1fr] lg:items-stretch lg:gap-10">
          <ol
            className="flex gap-2 overflow-x-auto pb-1 lg:h-full lg:flex-col lg:gap-2 lg:overflow-visible lg:pb-0"
            aria-label="Before you pay steps"
          >
            {STEPS.map((step, index) => {
              const isActive = index === activeIndex;
              return (
                <li key={step.id} className="min-w-[10.5rem] shrink-0 lg:min-h-0 lg:min-w-0 lg:flex-1">
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
            className="min-h-[22rem] min-w-0 lg:h-full lg:min-h-0"
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
