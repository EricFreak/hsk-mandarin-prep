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
      {/* Height follows content — never stretch children to fill a taller sibling slide. */}
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
    <PreviewChrome title="HSK 3 Diagnosis · Listening & reading" badge="Free">
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="flex flex-col gap-5">
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

          <FadeIn active={active} delay={100}>
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

          <div className="grid gap-2 sm:grid-cols-2">
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

          <FadeIn
            active={active}
            delay={420}
            className="grid gap-2 sm:grid-cols-2"
          >
            <div className="rounded-xl border border-mist bg-white px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
                Up next · Reading
              </p>
              <p className="mt-1 text-sm text-ink">他常常坐地铁去公司，因为___很方便。</p>
              <p className="mt-1 text-[11px] text-ink-muted">Cloze · pick one of 4</p>
            </div>
            <div className="rounded-xl border border-mist bg-white px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
                Up next · Writing
              </p>
              <p className="mt-1 text-sm text-ink">介绍你喜欢的运动（约 80 字）</p>
              <p className="mt-1 text-[11px] text-ink-muted">Submit now · AI review in sample</p>
            </div>
          </FadeIn>

          <FadeIn
            active={active}
            delay={520}
            className="rounded-xl border border-mist bg-paper-dark/60 px-4 py-3"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
              Session notes
            </p>
            <ul className="mt-2 space-y-1.5 text-xs text-ink-muted">
              <li>· Listening audio plays once — same as the official format</li>
              <li>· Sections unlock in order: Listening → Reading → Writing</li>
              <li>· Doesn&apos;t count against any mock-exam quota — diagnosis is free</li>
            </ul>
          </FadeIn>
        </div>

        <div className="flex flex-col gap-4">
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
          </FadeIn>

          <FadeIn
            active={active}
            delay={550}
            className="rounded-xl border border-mist bg-white p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              What diagnosis unlocks
            </p>
            <ul className="mt-3 space-y-2.5 text-xs leading-relaxed text-ink-muted">
              <li>
                <span className="font-medium text-ink">Skill heatmap</span> — listening 58 ·
                reading 78 · vocab 85
              </li>
              <li>
                <span className="font-medium text-ink">Full coach report</span> — DeepSeek,
                not truncated
              </li>
              <li>
                <span className="font-medium text-ink">Sample writing AI</span> — one free
                red-line review after the taste
              </li>
            </ul>
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
        <div className="flex flex-col gap-5">
          <FadeIn active={active} className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-jade/10 px-3 py-1 text-xs font-semibold text-jade">
              Generated by DeepSeek coach
            </span>
            <span className="text-xs text-ink-muted">After HSK 3 mock · Example learner</span>
          </FadeIn>

          <FadeIn active={active} delay={120}>
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

          <div className="grid gap-4 sm:grid-cols-2">
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

          <FadeIn active={active} delay={550}>
            <div className="rounded-xl border border-mist bg-paper-dark/60 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
                Your mistake bank · started automatically
              </p>
              <ul className="mt-2 grid gap-x-4 gap-y-1.5 text-xs text-ink-muted sm:grid-cols-3">
                <li>
                  <span className="font-medium text-ink">Q3</span> 几点 — time misheard
                </li>
                <li>
                  <span className="font-medium text-ink">Q5</span> 车票 — travel phrase
                </li>
                <li>
                  <span className="font-medium text-ink">Q7</span> 周末 — schedule context
                </li>
              </ul>
              <p className="mt-2 text-[11px] text-ink-muted">
                These exact misses seed your plan — Week 3 drills below target them by name.
              </p>
            </div>
          </FadeIn>
        </div>

        <FadeIn
          active={active}
          delay={250}
          className="rounded-xl border border-mist bg-paper-dark p-5"
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
          <div className="mt-5 space-y-4 border-t border-mist pt-4">
            <div>
              <p className="text-xs font-semibold text-ink">Coach recommendation</p>
              <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                Start with 15 listening questions today, then review your mistake bank tomorrow.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-ink">Next</p>
              <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                Outline + one-time quote · then a multi-skill sample
              </p>
            </div>
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
    { week: 1, theme: "Vocab + grammar base", detail: "40 drills · 1 writing", status: "Sample" },
    { week: 2, theme: "Grammar patterns", detail: "因为…所以… · particles", status: "Locked" },
    { week: 3, theme: "Listening · time/travel", detail: "24 miss-type items", status: "Locked" },
    { week: 4, theme: "Reading + writing", detail: "passages · AI review", status: "Locked" },
    { week: 5, theme: "Mini mocks", detail: "2 sections · score check", status: "Locked" },
  ];

  return (
    <PreviewChrome title="Journey Roadmap · Exam Sep 12, 2026" badge="Preview">
      <div className="flex flex-col gap-5">
        <FadeIn active={active}>
          <p className="text-xs font-semibold uppercase tracking-wide text-jade">
            Target exam date
          </p>
          <h3 className="mt-1 font-display text-xl font-semibold text-ink">
            September 12, 2026
          </h3>
          <p className="mt-1 text-sm text-ink-muted">
            42 days · calibrated from your HSK 3 mock (72%) · same rate, three shapes to
            choose
          </p>
        </FadeIn>

        <FadeIn
          active={active}
          delay={120}
          className="rounded-xl border border-mist bg-paper-dark/60 px-4 py-3"
        >
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

        <FadeIn active={active} delay={200}>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Full journey outline — theme per week
          </p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {outlineWeeks.map((row, index) => (
              <li
                key={row.week}
                className={`flex items-start justify-between gap-3 rounded-xl border px-3 py-2 transition-all duration-500 ${
                  index === 0 ? "border-jade/30 bg-jade/5" : "border-mist bg-white"
                } ${active ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
                style={{ transitionDelay: active ? `${220 + index * 50}ms` : "0ms" }}
              >
                <div>
                  <p className="text-sm font-semibold text-ink">
                    Week {row.week} · {row.theme}
                  </p>
                  <p className="mt-0.5 text-[11px] text-ink-muted">{row.detail}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                    row.status === "Sample"
                      ? "bg-jade/15 text-jade"
                      : "bg-paper-dark text-ink-muted"
                  }`}
                >
                  {row.status}
                </span>
              </li>
            ))}
            <li className="flex items-center rounded-xl border border-dashed border-mist bg-paper-dark/40 px-3 py-2 text-[11px] leading-relaxed text-ink-muted">
              Weeks 6–8 continue the locked plan after you pick a shape below.
            </li>
          </ul>
        </FadeIn>

        <FadeIn active={active} delay={480}>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            One quote, three shapes — same rate, you pick the shape
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-mist bg-white px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
                Coach pack · system-led
              </p>
              <p className="mt-1 font-display text-lg font-semibold text-ink">
                $13 / $26 / $39
              </p>
              <p className="mt-0.5 text-[11px] text-ink-muted">4 / 8 / 12 weeks · pay once</p>
              <ul className="mt-2 space-y-1 text-[11px] leading-relaxed text-ink-muted">
                <li>
                  Example · 8 weeks: <span className="font-medium text-ink">$26</span>
                </li>
                <li>96 drills · 8 AI writing · 4 mini mocks</li>
                <li>System builds the weeks. You follow.</li>
              </ul>
            </div>
            <div className="rounded-xl border border-mist bg-white px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
                Exam custom · you-led
              </p>
              <p className="mt-1 font-display text-lg font-semibold text-ink">
                Mix → live quote
              </p>
              <p className="mt-0.5 text-[11px] text-ink-muted">Workload priced · one quote</p>
              <ul className="mt-2 space-y-1 text-[11px] leading-relaxed text-ink-muted">
                <li>
                  Example for this gap:{" "}
                  <span className="font-medium text-ink">listening-heavy → ~$22</span>
                </li>
                <li>Cut essays, price drops · add mocks, price rises</li>
                <li>We check it still fits before Sep 12</li>
              </ul>
            </div>
            <div className="rounded-xl border border-mist bg-white px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
                Emergency sprint · ≤ 6 days
              </p>
              <p className="mt-1 font-display text-lg font-semibold text-ink">
                First one free
              </p>
              <p className="mt-0.5 text-[11px] text-ink-muted">Once per account · before pay</p>
              <ul className="mt-2 space-y-1 text-[11px] leading-relaxed text-ink-muted">
                <li>
                  This account: <span className="font-medium text-jade">$0 first sprint</span>
                </li>
                <li>After that: same rate (~$13 for a 6-day push)</li>
                <li>No urgency premium — short window, full push</li>
              </ul>
            </div>
          </div>
        </FadeIn>
      </div>
    </PreviewChrome>
  );
}

function SampleTastePreview({ active }: { active: boolean }) {
  const tasteStrip = [
    { skill: "Vocab", detail: "12 words", done: true },
    { skill: "Listen", detail: "4 clips", done: true },
    { skill: "Grammar", detail: "3 checks", done: true },
    { skill: "Writing", detail: "AI review", done: true, highlight: true },
  ];

  return (
    <PreviewChrome title="Sample taste · Writing AI review included" badge="Free once">
      <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
            Cross-skill taster
          </p>
          {tasteStrip.map((item, index) => (
            <FadeIn
              key={item.skill}
              active={active}
              delay={80 + index * 60}
              className={`rounded-xl border px-3 py-2.5 ${
                item.highlight
                  ? "border-jade bg-jade/10"
                  : item.done
                    ? "border-jade/25 bg-jade/5"
                    : "border-mist bg-white"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-ink">{item.skill}</p>
                <span className="text-[10px] font-semibold text-jade">✓</span>
              </div>
              <p className="mt-0.5 text-[11px] text-ink-muted">{item.detail}</p>
            </FadeIn>
          ))}

          <FadeIn
            active={active}
            delay={360}
            className="mt-2 rounded-xl border border-mist bg-paper-dark/60 px-3 py-2.5"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
              This taster
            </p>
            <ul className="mt-1.5 space-y-1 text-[11px] leading-relaxed text-ink-muted">
              <li>· ~35 min, one sitting</li>
              <li>· Pulled from your real plan</li>
              <li>· No card needed</li>
              <li>· Finish → quote unlocks</li>
            </ul>
          </FadeIn>
        </div>

        <FadeIn
          active={active}
          delay={180}
          className="rounded-xl border border-jade/30 bg-white p-4 sm:p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-jade">
                DeepSeek writing review · free sample
              </p>
              <p className="mt-1 text-sm text-ink-muted">
                Prompt: 介绍你喜欢的运动，并说明原因（约 80 字）
              </p>
            </div>
            <div className="text-right">
              <p className="font-display text-3xl font-semibold text-jade">72</p>
              <p className="text-[10px] font-semibold uppercase text-ink-muted">/ 100</p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-4 gap-2">
            {[
              { label: "Grammar", score: 70 },
              { label: "Vocab", score: 78 },
              { label: "Task", score: 68 },
              { label: "Flow", score: 74 },
            ].map((row) => (
              <div
                key={row.label}
                className="rounded-lg border border-mist bg-paper-dark/40 px-2 py-1.5 text-center"
              >
                <p className="font-display text-sm font-semibold text-ink">{row.score}</p>
                <p className="text-[10px] text-ink-muted">{row.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-lg border border-mist bg-paper-dark/50 px-3 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
              Your draft
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink">
              我喜欢打篮球。因为篮球很有意思，我每个周末和朋友一起打。运动以后我觉得很开心，
              身体也<span className="bg-seal/15 text-seal line-through decoration-seal/60">健康的</span>
              <span className="ml-1 rounded bg-jade/15 px-1 font-medium text-jade">更健康了</span>。
            </p>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-seal/20 bg-seal/5 px-3 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-seal">
                Grammar
              </p>
              <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-ink-muted">
                <li>
                  <span className="font-medium text-ink">了</span> after result: 更健康了
                  marks change-of-state better than 健康的.
                </li>
                <li>
                  Add <span className="font-medium text-ink">因为…所以…</span> to link reason
                  and feeling in one sentence.
                </li>
              </ul>
            </div>
            <div className="rounded-lg border border-jade/25 bg-jade/5 px-3 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-jade">
                Vocabulary · Next
              </p>
              <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-ink-muted">
                <li>
                  Strong: 周末、朋友、开心 — on-level HSK 3.
                </li>
                <li>
                  Try: <span className="font-medium text-ink">锻炼身体</span> /{" "}
                  <span className="font-medium text-ink">团队合作</span> for richer sport talk.
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-jade/25 bg-white px-3 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-jade">
              Rewrite to try — model sentence
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink">
              因为打篮球既有意思又能锻炼身体，<span className="rounded bg-jade/15 px-1 font-medium text-jade">所以</span>我每个周末都和朋友一起打。
            </p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-ink-muted">
              Combines your reason + habit into one 因为…所以… sentence and upgrades 有意思 →
              既有意思又能锻炼身体.
            </p>
          </div>

          <p className="mt-4 border-t border-mist pt-3 text-xs leading-relaxed text-ink-muted">
            One full AI review in the free sample. More writing reviews come with your
            package — same DeepSeek examiner, same red-line detail.
          </p>
        </FadeIn>
      </div>
    </PreviewChrome>
  );
}

function LockedPreviewsPreview({ active }: { active: boolean }) {
  return (
    <PreviewChrome title="Locked previews · your diagnosis, still visible" badge="Look only">
      <div className="flex flex-col gap-4">
        <FadeIn active={active}>
          <p className="text-sm text-ink-muted">
            Paid tasks show real content from your gaps — you can read what you&apos;d
            unlock, but Start stays locked until you buy.
          </p>
        </FadeIn>

        <FadeIn
          active={active}
          delay={120}
          className="relative overflow-hidden rounded-xl border border-mist bg-white"
        >
          <div className="absolute right-3 top-3 z-10 rounded-full bg-ink/80 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
            Locked · Week 3
          </div>
          <div className="border-b border-mist bg-seal/5 px-4 py-3 pr-28">
            <p className="text-xs font-semibold uppercase tracking-wide text-seal">
              Built from your misses
            </p>
            <p className="mt-1 font-display text-lg font-semibold text-ink">
              Listening · Numbers &amp; time
            </p>
            <p className="mt-1 text-xs text-ink-muted">
              24 items · same error cluster as your diagnosis (几点 / 明天 / 周末)
            </p>
          </div>
          <ul className="divide-y divide-mist/80 px-4">
            {[
              {
                q: "Q1 · Audio",
                line: "男的明天几点开会？",
                tag: "Time · 几点",
              },
              {
                q: "Q2 · Audio",
                line: "他们周末去哪儿？",
                tag: "Schedule · 周末",
              },
              {
                q: "Q3 · Audio",
                line: "车票多少钱？",
                tag: "Travel · 车票",
              },
            ].map((row) => (
              <li key={row.q} className="flex items-start justify-between gap-3 py-2.5">
                <div>
                  <p className="text-[11px] font-semibold text-ink-muted">{row.q}</p>
                  <p className="mt-0.5 text-sm text-ink">{row.line}</p>
                </div>
                <span className="shrink-0 rounded-full bg-paper-dark px-2 py-0.5 text-[10px] font-medium text-ink-muted">
                  {row.tag}
                </span>
              </li>
            ))}
          </ul>
          <div className="border-t border-dashed border-mist bg-paper-dark/40 px-4 py-2.5 text-center text-xs font-medium text-ink-muted">
            Included in your 8-week pack · tap to open quote
          </div>
        </FadeIn>

        <div className="grid gap-4 sm:grid-cols-2">
          <FadeIn
            active={active}
            delay={220}
            className="relative rounded-xl border border-mist bg-white p-4"
          >
            <div className="absolute right-3 top-3 rounded-full bg-ink/80 px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
              Locked
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-jade">
              Week 5 · Writing + AI
            </p>
            <p className="mt-1 pr-14 text-sm font-semibold text-ink">
              Essay: 我的假期计划
            </p>
            <div className="mt-3 space-y-2 text-xs leading-relaxed text-ink-muted">
              <p>
                <span className="font-medium text-seal">Grammar flag:</span> 了 / 过 tense mix
                on travel sentences
              </p>
              <p>
                <span className="font-medium text-jade">Vocab stretch:</span> 打算、安排、特别
              </p>
              <p className="rounded-lg bg-paper-dark/60 px-2.5 py-2">
                Preview only — full red-line review unlocks with the pack (7 more after your
                free sample).
              </p>
            </div>
          </FadeIn>

          <FadeIn
            active={active}
            delay={300}
            className="relative rounded-xl border border-mist bg-white p-4"
          >
            <div className="absolute right-3 top-3 rounded-full bg-ink/80 px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
              Locked
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-jade">
              Week 4 · This week&apos;s map
            </p>
            <p className="mt-1 pr-14 text-sm font-semibold text-ink">Reading + writing mix</p>
            <ul className="mt-3 space-y-2 text-xs text-ink-muted">
              {[
                "Mon · 2 short passages (商店 / 天气)",
                "Tue · Grammar: 因为…所以… drills ×10",
                "Thu · Writing draft + AI review",
                "Sat · Mini mock · reading section",
              ].map((line) => (
                <li key={line} className="flex gap-2">
                  <span className="text-jade" aria-hidden>
                    ·
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </FadeIn>
        </div>
      </div>
    </PreviewChrome>
  );
}

function StepPreview({ stepId, active }: { stepId: StepId; active: boolean }) {
  switch (stepId) {
    case "diagnosis":
      return <MockExamPreview active={active} />;
    case "report":
      return <SummaryPreview active={active} />;
    case "outline":
      return <PlanPreview active={active} />;
    case "sample":
      return <SampleTastePreview active={active} />;
    case "locked":
      return <LockedPreviewsPreview active={active} />;
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

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,18rem)_1fr] lg:gap-10">
          <ol className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0" aria-label="Before you pay steps">
            {STEPS.map((step, index) => {
              const isActive = index === activeIndex;
              return (
                <li key={step.id} className="min-w-[10.5rem] shrink-0 lg:min-w-0">
                  <button
                    type="button"
                    onClick={() => goTo(index)}
                    className={`flex h-full w-full flex-col rounded-xl border px-3 py-3 text-left transition-all duration-200 ${
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
            className="min-w-0"
            aria-live="polite"
            aria-label={`Step ${activeStep.step}: ${activeStep.title}`}
          >
            <StepPreview stepId={activeStep.id} active />
          </div>
        </div>
      </div>
    </section>
  );
}
