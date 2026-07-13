"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const STEP_MS = 6500;

const STEPS = [
  {
    id: "mock",
    step: "1",
    title: "Take a mock exam",
    short: "Mock exam",
    description:
      "Full HSK 3 format — listening, reading, and writing under realistic conditions.",
  },
  {
    id: "report",
    step: "2",
    title: "Get your score & skill breakdown",
    short: "Score & skills",
    description:
      "Instant score plus structured weakness metrics from your mock exam.",
  },
  {
    id: "summary",
    step: "3",
    title: "Read your AI summary",
    short: "AI summary",
    description:
      "A natural-language coach report explains what your score means and what to fix first.",
  },
  {
    id: "plan",
    step: "4",
    title: "See your journey roadmap",
    short: "Roadmap",
    description:
      "Enter your target exam date. The coach maps stages to your calendar — each week has a theme until exam day.",
  },
  {
    id: "practice",
    step: "5",
    title: "Do this week's tasks",
    short: "This week",
    description:
      "On Dashboard, start the top-ranked task. Plan-driven practice targets your gaps — pass the bar to clear the week.",
  },
  {
    id: "track",
    step: "6",
    title: "Track and re-test",
    short: "Progress",
    description:
      "See readiness trends on Dashboard. Take another mock to refresh your report and adjust the journey.",
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
    <div className="overflow-hidden rounded-2xl border border-mist bg-white shadow-card">
      <div className="flex items-center justify-between gap-2 border-b border-mist bg-paper-dark/60 px-4 py-2.5">
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
      <div className="p-5 sm:p-8">{children}</div>
    </div>
  );
}

function FadeIn({
  active,
  delay = 0,
  className = "",
  children,
}: {
  active: boolean;
  delay?: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`transition-all duration-500 ${
        active ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      } ${className}`}
      style={{ transitionDelay: active ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}

function MockExamPreview({ active }: { active: boolean }) {
  return (
    <PreviewChrome title="HSK 3 Mock Exam · Live session" badge="Preview">
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {["Listening", "Reading", "Writing"].map((section, index) => (
              <span
                key={section}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                  index === 0
                    ? "bg-jade text-white"
                    : "border border-mist bg-paper-dark text-ink-muted"
                }`}
              >
                {section}
              </span>
            ))}
            <span className="ml-auto rounded-lg border border-seal/20 bg-seal/5 px-3 py-1 text-xs font-semibold text-seal">
              24:18 left
            </span>
          </div>

          <FadeIn active={active} delay={100} className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-jade">
              Listening · Question 3 of 8
            </p>
            <p className="mt-2 text-xs text-ink-muted">
              Audio prompt (example): 你明天几点去学校？
            </p>
            <p className="mt-4 font-display text-xl font-semibold text-ink sm:text-2xl">
              你明天几点去学校？
            </p>
          </FadeIn>

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {["八点", "明天", "学校", "几点"].map((choice, index) => (
              <div
                key={choice}
                className={`rounded-xl border px-4 py-3 text-sm transition-all duration-500 ${
                  active && index === 0
                    ? "border-jade bg-jade/10 font-medium text-jade shadow-sm"
                    : "border-mist text-ink-muted"
                }`}
                style={{ transitionDelay: active ? `${200 + index * 80}ms` : "0ms" }}
              >
                <span className="mr-2 font-semibold text-ink-muted">
                  {String.fromCharCode(65 + index)}.
                </span>
                {choice}
              </div>
            ))}
          </div>
        </div>

        <FadeIn
          active={active}
          delay={400}
          className="rounded-xl border border-mist bg-paper-dark p-4"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Exam progress
          </p>
          <div className="mt-4 space-y-3">
            {[
              { label: "Listening", done: 3, total: 8 },
              { label: "Reading", done: 0, total: 8 },
              { label: "Writing", done: 0, total: 1 },
            ].map((row) => (
              <div key={row.label}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-medium text-ink">{row.label}</span>
                  <span className="text-ink-muted">
                    {row.done}/{row.total}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-jade transition-all duration-1000"
                    style={{
                      width: active ? `${(row.done / row.total) * 100}%` : "0%",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-5 text-xs leading-relaxed text-ink-muted">
            Same timing and section order as the official HSK 3.0 exam format.
          </p>
        </FadeIn>
      </div>
    </PreviewChrome>
  );
}

function ReportPreview({ active }: { active: boolean }) {
  const score = active ? 72 : 0;
  const dash = (score / 100) * 264;
  const skills = [
    { label: "Listening", value: 58, tag: "Focus area", color: "bg-seal", text: "text-seal" },
    { label: "Reading", value: 78, tag: "Solid", color: "bg-jade", text: "text-jade" },
    { label: "Vocabulary", value: 85, tag: "Strong", color: "bg-jade", text: "text-jade" },
    { label: "Grammar", value: 70, tag: "OK", color: "bg-jade/70", text: "text-jade" },
  ];

  return (
    <PreviewChrome title="Mock Exam Result" badge="Preview">
      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <div className="text-center">
          <div className="relative mx-auto flex h-40 w-40 items-center justify-center">
            <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#E8E4DF" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="#2D6A6A"
                strokeWidth="8"
                strokeDasharray={`${dash} 264`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div>
              <p className="font-display text-4xl font-semibold text-ink">{score}%</p>
              <p className="text-xs text-ink-muted">HSK 3</p>
            </div>
          </div>
          <FadeIn active={active} delay={200} className="mt-3">
            <p className="text-sm text-ink-muted">
              <span className="font-semibold text-ink">58</span>/80 MCQ correct
            </p>
            <p className="mt-1 text-xs text-ink-muted">Writing submitted · AI score pending</p>
          </FadeIn>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Skill breakdown
          </p>
          <div className="mt-4 space-y-4">
            {skills.map((item, index) => (
              <div key={item.label}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="font-medium text-ink">{item.label}</span>
                  <span className={`text-xs font-semibold ${item.text}`}>{item.tag}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-paper-dark">
                  <div
                    className={`h-full rounded-full ${item.color} transition-all duration-1000 ease-out`}
                    style={{
                      width: active ? `${item.value}%` : "0%",
                      transitionDelay: active ? `${250 + index * 150}ms` : "0ms",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <FadeIn
            active={active}
            delay={700}
            className="mt-5 rounded-xl border border-seal/20 bg-seal/5 px-4 py-3 text-sm text-ink-muted"
          >
            Top gap: <span className="font-semibold text-seal">Listening</span> — time
            expressions and transport phrases need work before your next attempt.
          </FadeIn>
        </div>
      </div>
    </PreviewChrome>
  );
}

function SummaryPreview({ active }: { active: boolean }) {
  return (
    <PreviewChrome title="AI Learning Coach · Assessment report" badge="Preview">
      <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
        <div>
          <FadeIn active={active} className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-jade/10 px-3 py-1 text-xs font-semibold text-jade">
              Generated by DeepSeek coach
            </span>
            <span className="text-xs text-ink-muted">After HSK 3 mock · Example learner</span>
          </FadeIn>

          <FadeIn active={active} delay={120} className="mt-5">
            <h3 className="font-display text-2xl font-semibold text-ink">
              You&apos;re close — listening is the bottleneck
            </h3>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-ink-muted">
              <p>
                Your mock score of <span className="font-semibold text-ink">72%</span> shows
                solid vocabulary and reading foundations. You answered most cloze and short
                reading items correctly, which means your HSK 3 word bank is working.
              </p>
              <p>
                The main gap is{" "}
                <span className="font-semibold text-seal">listening comprehension</span>,
                especially time expressions (几点、明天、周末) and transport phrases (车票、
                地铁、机场). Two of your three listening misses clustered around schedule and
                travel contexts.
              </p>
              <p>
                If you spend the next week on targeted listening drills plus a short daily
                review of mistake-bank items, a mid-70s to low-80s score is a realistic next
                target.
              </p>
            </div>
          </FadeIn>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <FadeIn
              active={active}
              delay={350}
              className="rounded-xl border border-jade/25 bg-jade/5 p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-jade">Strengths</p>
              <ul className="mt-3 space-y-2 text-sm text-ink-muted">
                <li>
                  <span className="font-medium text-ink">Vocabulary</span> — 85% accuracy on
                  cloze items
                </li>
                <li>
                  <span className="font-medium text-ink">Reading</span> — strong short-passage
                  comprehension
                </li>
              </ul>
            </FadeIn>
            <FadeIn
              active={active}
              delay={450}
              className="rounded-xl border border-seal/25 bg-seal/5 p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-seal">
                Priority gaps
              </p>
              <ul className="mt-3 space-y-2 text-sm text-ink-muted">
                <li>
                  <span className="font-medium text-seal">Listening · High</span> — 3 incorrect
                  on time / travel audio
                </li>
                <li>
                  <span className="font-medium text-ink">Grammar · Medium</span> — particle
                  placement in writing
                </li>
              </ul>
            </FadeIn>
          </div>
        </div>

        <FadeIn
          active={active}
          delay={250}
          className="flex flex-col justify-between rounded-xl border border-mist bg-paper-dark p-5"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Exam readiness
            </p>
            <p className="mt-2 font-display text-5xl font-semibold text-jade">68%</p>
            <p className="mt-2 text-xs leading-relaxed text-ink-muted">
              Estimated readiness for your target exam date if you follow this week&apos;s
              tasks.
            </p>
          </div>
          <div className="mt-6 border-t border-mist pt-4">
            <p className="text-xs font-semibold text-ink">Coach recommendation</p>
            <p className="mt-2 text-xs leading-relaxed text-ink-muted">
              Start with 15 listening questions today, then review your mistake bank tomorrow.
            </p>
          </div>
        </FadeIn>
      </div>
    </PreviewChrome>
  );
}

function PlanPreview({ active }: { active: boolean }) {
  const journeyStages = [
    { label: "Diagnose", done: true },
    { label: "Foundation", current: true },
    { label: "Skills", done: false },
    { label: "Sprint", done: false },
  ];

  const outlineWeeks = [
    { week: 1, theme: "Vocabulary focus", stage: "Foundation", status: "Available" },
    { week: 2, theme: "Grammar focus", stage: "Foundation", status: "Locked" },
    { week: 3, theme: "Listening focus", stage: "Skills", status: "Locked" },
    { week: 4, theme: "Reading & writing", stage: "Skills", status: "Locked" },
    { week: 5, theme: "Mock review", stage: "Sprint", status: "Locked" },
  ];

  return (
    <PreviewChrome title="Journey Roadmap · Exam Sep 12, 2026" badge="Preview">
      <FadeIn active={active} className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-jade">
            Target exam date
          </p>
          <h3 className="mt-1 font-display text-xl font-semibold text-ink">
            September 12, 2026
          </h3>
          <p className="mt-1 text-sm text-ink-muted">
            42 days · calibrated from your HSK 3 mock (72%)
          </p>
        </div>
        <div className="rounded-xl border border-mist bg-paper-dark px-4 py-3 text-right">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
            You are here
          </p>
          <p className="mt-1 font-display text-lg font-semibold text-jade">Foundation</p>
        </div>
      </FadeIn>

      <FadeIn active={active} delay={120} className="mt-6 rounded-xl border border-mist bg-paper-dark/60 px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-muted">
          Stage calendar
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {journeyStages.map((stage) => (
            <span
              key={stage.label}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
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
          <span className="ml-auto text-xs text-ink-muted">42 days to exam</span>
        </div>
      </FadeIn>

      <FadeIn active={active} delay={200} className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Full journey outline — theme per week
        </p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {outlineWeeks.map((row, index) => (
            <li
              key={row.week}
              className={`flex items-start justify-between gap-3 rounded-xl border px-3 py-2.5 transition-all duration-500 ${
                index === 0 ? "border-jade/30 bg-jade/5" : "border-mist bg-white"
              } ${active ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
              style={{ transitionDelay: active ? `${220 + index * 50}ms` : "0ms" }}
            >
              <div>
                <p className="text-sm font-semibold text-ink">
                  Week {row.week} · {row.theme}
                </p>
                <p className="mt-0.5 text-[11px] text-ink-muted">{row.stage}</p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                  row.status === "Available"
                    ? "bg-jade/15 text-jade"
                    : "bg-paper-dark text-ink-muted"
                }`}
              >
                {row.status}
              </span>
            </li>
          ))}
        </ul>
      </FadeIn>

      <FadeIn
        active={active}
        delay={480}
        className="mt-6 rounded-xl border border-mist bg-paper-dark px-4 py-3"
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-jade">Map only</p>
        <p className="mt-1 text-sm leading-relaxed text-ink-muted">
          The roadmap shows <span className="font-medium text-ink">when</span> and{" "}
          <span className="font-medium text-ink">what themes</span> — not the drills themselves.
          Exam date sets the calendar; mock gaps set the weights. You train on Dashboard in the
          next step.
        </p>
      </FadeIn>
    </PreviewChrome>
  );
}

function PracticePreview({ active }: { active: boolean }) {
  const weekTasks = [
    { title: "Listening drills", rank: 1, active: true },
    { title: "Vocabulary review", rank: 2, active: false },
    { title: "Grammar practice", rank: 3, active: false },
  ];

  return (
    <PreviewChrome title="Dashboard → Practice · Week 1 task" badge="Preview">
      <FadeIn active={active} className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
        <span className="rounded-full bg-jade/15 px-2.5 py-1 text-jade">1 · Dashboard</span>
        <span aria-hidden="true">→</span>
        <span className="rounded-full bg-jade/15 px-2.5 py-1 text-jade">2 · Practice</span>
        <span aria-hidden="true">→</span>
        <span className="rounded-full border border-mist px-2.5 py-1">3 · Mastery gate</span>
      </FadeIn>

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,240px)_1fr]">
        <FadeIn active={active} delay={100} className="rounded-xl border border-jade/40 bg-jade/5 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-jade">
            Dashboard · This week
          </p>
          <p className="mt-2 text-sm font-semibold text-ink">Problem: Listening</p>
          <p className="mt-1 text-[11px] text-ink-muted">Suggested order — start at the top</p>
          <ul className="mt-3 space-y-2">
            {weekTasks.map((task) => (
              <li
                key={task.title}
                className={`rounded-lg border px-2.5 py-2 text-xs ${
                  task.active
                    ? "border-jade bg-white font-semibold text-ink shadow-sm"
                    : "border-mist/80 bg-white/60 text-ink-muted"
                }`}
              >
                <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-jade/10 text-[10px] font-semibold text-jade">
                  {task.rank}
                </span>
                {task.title}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[10px] leading-relaxed text-ink-muted">
            Tap task #1 → opens plan-driven practice
          </p>
        </FadeIn>

        <div>
          <FadeIn active={active} delay={180}>
            <p className="text-xs font-semibold uppercase tracking-wide text-jade">
              Plan task · Listening
            </p>
            <p className="mt-3 font-display text-xl font-semibold text-ink sm:text-2xl">
              他想买一张去上海的____。
            </p>
            <p className="mt-2 text-xs text-ink-muted">
              AI question tagged to your top gap — not a random drill.
            </p>
          </FadeIn>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {["车票", "水果", "电脑", "书包"].map((choice, index) => (
              <div
                key={choice}
                className={`rounded-xl border px-4 py-3 text-sm transition-all duration-500 ${
                  active && index === 0
                    ? "border-jade bg-jade/10 font-medium text-jade"
                    : "border-mist text-ink-muted"
                }`}
                style={{ transitionDelay: active ? `${240 + index * 60}ms` : "0ms" }}
              >
                {choice}
              </div>
            ))}
          </div>

          <FadeIn
            active={active}
            delay={520}
            className="mt-5 rounded-xl border border-jade/30 bg-jade/5 px-4 py-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-jade">
                  Mastery gate
                </p>
                <p className="mt-1 font-display text-2xl font-semibold text-ink">
                  8 <span className="text-base font-normal text-ink-muted">/ 10</span>
                </p>
                <p className="mt-1 text-xs text-ink-muted">Passed · locked into Week 1</p>
              </div>
              <span className="rounded-lg bg-jade px-4 py-2 text-sm font-semibold text-white">
                Continue week
              </span>
            </div>
          </FadeIn>
        </div>
      </div>
    </PreviewChrome>
  );
}

function DashboardPreview({ active }: { active: boolean }) {
  const stats = [
    { label: "Readiness", value: "68%", sub: "Up from 61% last mock" },
    { label: "Days to exam", value: "42", sub: "Sep 12, 2026 target" },
    { label: "Week 1 tasks", value: "2/3", sub: "passed this week" },
    { label: "Listening gap", value: "−12%", sub: "wrong vs last mock" },
  ];

  return (
    <PreviewChrome title="Dashboard · Progress & re-test" badge="Preview">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <FadeIn active={active}>
            <p className="text-xs font-semibold uppercase tracking-wide text-jade">
              Progress glance
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              After a week of plan-driven practice, listening accuracy is trending up. Ready
              for a follow-up mock to refresh your coach report.
            </p>
          </FadeIn>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`rounded-xl border border-mist bg-paper-dark px-4 py-3 transition-all duration-500 ${
                  active ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                }`}
                style={{ transitionDelay: active ? `${120 + index * 80}ms` : "0ms" }}
              >
                <p className="text-[11px] font-medium text-ink-muted">{stat.label}</p>
                <p className="mt-1 font-display text-2xl font-semibold text-ink">{stat.value}</p>
                <p className="text-[11px] text-ink-muted">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>

        <FadeIn
          active={active}
          delay={250}
          className="flex flex-col rounded-xl border border-mist bg-paper-dark p-5"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Close the loop
          </p>
          <ul className="mt-4 space-y-3 text-sm text-ink-muted">
            <li className="flex gap-2">
              <span className="text-jade" aria-hidden="true">
                ✓
              </span>
              Week 1 tasks cleared — Week 2 unlocked on roadmap
            </li>
            <li className="flex gap-2">
              <span className="text-jade" aria-hidden="true">
                ✓
              </span>
              Listening accuracy +9% since last report
            </li>
            <li className="flex gap-2">
              <span className="text-ink-muted" aria-hidden="true">
                →
              </span>
              Take another mock to re-weight the journey
            </li>
          </ul>
          <div className="mt-auto pt-6">
            <span className="inline-block rounded-lg bg-jade px-4 py-2.5 text-sm font-semibold text-white">
              Take follow-up mock
            </span>
            <p className="mt-3 text-[11px] leading-relaxed text-ink-muted">
              New mock → updated report → roadmap adjusts. Then back to This week on
              Dashboard.
            </p>
          </div>
        </FadeIn>
      </div>
    </PreviewChrome>
  );
}

function StepPreview({ stepId, active }: { stepId: StepId; active: boolean }) {
  switch (stepId) {
    case "mock":
      return <MockExamPreview active={active} />;
    case "report":
      return <ReportPreview active={active} />;
    case "summary":
      return <SummaryPreview active={active} />;
    case "plan":
      return <PlanPreview active={active} />;
    case "practice":
      return <PracticePreview active={active} />;
    case "track":
      return <DashboardPreview active={active} />;
  }
}

export default function HowItWorksShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const goTo = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  useEffect(() => {
    if (paused || reducedMotion) {
      return;
    }

    timerRef.current = setInterval(() => {
      setActiveIndex((current) => (current + 1) % STEPS.length);
    }, STEP_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, reducedMotion, activeIndex]);

  const activeStep = STEPS[activeIndex];

  return (
    <section id="how-it-works" className="scroll-mt-[5.5rem] border-y border-mist bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold text-ink">How it works</h2>
          <p className="mt-3 text-sm text-ink-muted">
            Assess → roadmap to exam day → do this week&apos;s tasks → track and re-test.
            All previews use example data, not your account.
          </p>
          <div className="mx-auto mt-4 h-px w-24 bg-brush-rule" />
        </div>

        <div
          className="mt-12"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
        >
          <ol
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
            aria-label="How it works steps"
          >
            {STEPS.map((step, index) => {
              const isActive = index === activeIndex;
              return (
                <li key={step.id}>
                  <button
                    type="button"
                    onClick={() => goTo(index)}
                    className={`flex h-full w-full flex-col rounded-xl border p-3.5 text-left transition-all duration-300 ${
                      isActive
                        ? "border-jade/40 bg-jade/5 shadow-card"
                        : "border-mist bg-white hover:border-jade/20 hover:bg-paper-dark/50"
                    }`}
                    aria-current={isActive ? "step" : undefined}
                  >
                    <span
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-full font-display text-sm font-semibold transition-colors ${
                        isActive ? "bg-jade text-white" : "bg-seal/10 text-seal"
                      }`}
                    >
                      {step.step}
                    </span>
                    <h3 className="mt-3 font-display text-sm font-semibold leading-snug text-ink sm:text-base">
                      {step.short}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">
                      {step.description}
                    </p>
                    {isActive && !reducedMotion ? (
                      <div className="mt-auto pt-3">
                        <div className="h-1 overflow-hidden rounded-full bg-mist">
                          <div
                            key={`${step.id}-${activeIndex}`}
                            className="h-full rounded-full bg-jade motion-safe:animate-[showcase-progress_6.5s_linear_forwards]"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="mt-auto pt-3">
                        <div className="h-1 rounded-full bg-transparent" />
                      </div>
                    )}
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="relative mt-8 min-h-[420px]">
            {STEPS.map((step, index) => (
              <div
                key={step.id}
                className={`transition-all duration-500 ${
                  index === activeIndex
                    ? "relative opacity-100"
                    : "pointer-events-none absolute inset-0 opacity-0"
                }`}
                aria-hidden={index !== activeIndex}
              >
                <StepPreview stepId={step.id} active={index === activeIndex} />
              </div>
            ))}
          </div>

          <p className="mt-4 text-center text-sm text-ink-muted">
            <span className="font-medium text-ink">
              Step {activeStep.step}: {activeStep.title}
            </span>
            <span className="mx-2 text-mist">·</span>
            {paused
              ? "Paused — move cursor away to resume"
              : reducedMotion
                ? "Select a step to explore each preview"
                : "Auto-playing the full loop"}
          </p>
        </div>
      </div>
    </section>
  );
}
