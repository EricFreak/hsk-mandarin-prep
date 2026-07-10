"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const STEP_MS = 5200;

const STEPS = [
  {
    id: "mock",
    step: "1",
    title: "Take a mock exam",
    description:
      "Full HSK 3 format — listening, reading, and writing under realistic conditions.",
  },
  {
    id: "report",
    step: "2",
    title: "Get your score & skill breakdown",
    description:
      "Instant score plus structured weakness metrics from your mock exam.",
  },
  {
    id: "summary",
    step: "3",
    title: "Read your AI summary",
    description:
      "A natural-language coach report explains what your score means and what to fix first.",
  },
  {
    id: "plan",
    step: "4",
    title: "Follow your study plan",
    description:
      "Get a personalized 7-day plan with daily tasks linked to practice and review.",
  },
  {
    id: "practice",
    step: "5",
    title: "Practice smarter",
    description:
      "AI-generated questions target your weak areas instead of random drills.",
  },
  {
    id: "track",
    step: "6",
    title: "Track progress",
    description:
      "Your dashboard updates after every session so you always know where you stand.",
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
    <div className="overflow-hidden rounded-xl border border-mist bg-white shadow-card">
      <div className="flex items-center justify-between gap-2 border-b border-mist bg-paper-dark/60 px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-seal/40" />
          <span className="h-2 w-2 rounded-full bg-jade/40" />
          <span className="h-2 w-2 rounded-full bg-mist" />
          <span className="ml-2 truncate text-xs font-medium text-ink-muted">{title}</span>
        </div>
        <span className="shrink-0 rounded-full bg-jade/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-jade">
          {badge}
        </span>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  );
}

function MockExamPreview({ active }: { active: boolean }) {
  return (
    <PreviewChrome title="HSK 3 Mock Exam" badge="Preview">
      <p className="text-xs font-semibold uppercase tracking-wide text-jade">Listening</p>
      <p
        className={`mt-2 text-sm font-medium text-ink transition-all duration-500 ${
          active ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        你明天几点去学校？
      </p>
      <div className="mt-4 space-y-2">
        {["八点", "明天", "学校", "几点"].map((choice, index) => (
          <div
            key={choice}
            className={`rounded-lg border px-3 py-2 text-xs transition-all duration-500 ${
              active && index === 0
                ? "border-jade bg-jade/10 font-medium text-jade"
                : "border-mist text-ink-muted"
            }`}
            style={{ transitionDelay: active ? `${200 + index * 80}ms` : "0ms" }}
          >
            {String.fromCharCode(65 + index)}. {choice}
          </div>
        ))}
      </div>
      <div
        className={`mt-4 h-1.5 overflow-hidden rounded-full bg-paper-dark transition-opacity duration-500 ${
          active ? "opacity-100" : "opacity-40"
        }`}
      >
        <div
          className="h-full rounded-full bg-seal transition-all duration-1000 ease-out"
          style={{ width: active ? "35%" : "0%" }}
        />
      </div>
      <p className="mt-2 text-center text-[10px] text-ink-muted">Question 3 of 8</p>
    </PreviewChrome>
  );
}

function ReportPreview({ active }: { active: boolean }) {
  const score = active ? 72 : 0;
  const dash = (score / 100) * 264;

  return (
    <PreviewChrome title="Mock Exam Result" badge="Preview">
      <div className="relative mx-auto flex h-32 w-32 items-center justify-center">
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
        <p className="font-display text-3xl font-semibold text-ink">{score}%</p>
      </div>
      <p
        className={`mt-2 text-center text-sm text-ink-muted transition-opacity duration-500 ${
          active ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className="font-semibold text-ink">58</span>/80 MCQ correct
      </p>
      <div className="mt-5 border-t border-mist pt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Weakness report
        </p>
        <div className="mt-3 space-y-3">
          {[
            { label: "Listening", value: 60, tag: "Focus area", color: "bg-seal" },
            { label: "Vocabulary", value: 85, tag: "Strong", color: "bg-jade" },
          ].map((item, index) => (
            <div key={item.label}>
              <div className="mb-1 flex justify-between text-xs">
                <span className="font-medium text-ink">{item.label}</span>
                <span className={index === 0 ? "font-semibold text-seal" : "font-semibold text-jade"}>
                  {item.tag}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-paper-dark">
                <div
                  className={`h-full rounded-full ${item.color} transition-all duration-1000 ease-out`}
                  style={{
                    width: active ? `${item.value}%` : "0%",
                    transitionDelay: active ? `${300 + index * 200}ms` : "0ms",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </PreviewChrome>
  );
}

function SummaryPreview({ active }: { active: boolean }) {
  return (
    <PreviewChrome title="AI Coach Summary" badge="Preview">
      <p
        className={`text-sm leading-relaxed text-ink-muted transition-opacity duration-500 ${
          active ? "opacity-100" : "opacity-0"
        }`}
      >
        Your mock score of <span className="font-semibold text-ink">72%</span> shows solid
        vocabulary, but <span className="font-semibold text-seal">listening</span> is your
        main gap. Focus on time expressions and transport phrases this week.
      </p>
      <div
        className={`mt-4 rounded-lg border border-mist bg-paper-dark px-3 py-3 transition-all duration-500 ${
          active ? "opacity-100" : "opacity-0"
        }`}
        style={{ transitionDelay: active ? "300ms" : "0ms" }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
          Readiness estimate
        </p>
        <p className="mt-1 font-display text-2xl font-semibold text-jade">68%</p>
      </div>
    </PreviewChrome>
  );
}

function PlanPreview({ active }: { active: boolean }) {
  const tasks = [
    "Day 1 — Listening practice (15 questions)",
    "Day 2 — Review mistake bank",
    "Day 3 — Vocabulary flashcards",
  ];

  return (
    <PreviewChrome title="Weekly Study Plan" badge="Preview">
      <ul className="space-y-2">
        {tasks.map((task, index) => (
          <li
            key={task}
            className={`rounded-lg border border-mist bg-paper-dark px-3 py-2 text-xs text-ink transition-all duration-500 ${
              active ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"
            }`}
            style={{ transitionDelay: active ? `${index * 150}ms` : "0ms" }}
          >
            {task}
          </li>
        ))}
      </ul>
    </PreviewChrome>
  );
}

function PracticePreview({ active }: { active: boolean }) {
  return (
    <PreviewChrome title="AI Practice" badge="Preview">
      <p className="text-xs text-ink-muted">
        Targeting:{" "}
        <span className="font-semibold text-seal">Listening</span> (from your plan)
      </p>
      <p
        className={`mt-3 text-sm font-medium text-ink transition-all duration-500 ${
          active ? "opacity-100" : "opacity-0"
        }`}
      >
        他想买一张去上海的____。
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {["车票", "水果", "电脑", "书包"].map((choice, index) => (
          <div
            key={choice}
            className={`rounded-lg border px-3 py-2 text-xs transition-all duration-500 ${
              active && index === 0
                ? "border-jade bg-jade/10 text-jade"
                : "border-mist text-ink-muted"
            }`}
            style={{ transitionDelay: active ? `${150 + index * 60}ms` : "0ms" }}
          >
            {choice}
          </div>
        ))}
      </div>
      <p
        className={`mt-4 rounded-lg bg-jade/5 px-3 py-2 text-xs text-jade transition-all duration-700 ${
          active ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
        style={{ transitionDelay: active ? "600ms" : "0ms" }}
      >
        ✓ Correct — 车票 fits the travel context.
      </p>
    </PreviewChrome>
  );
}

function DashboardPreview({ active }: { active: boolean }) {
  const stats = [
    { label: "Latest mock", value: "72%", sub: "HSK 3" },
    { label: "7-day practice", value: "48", sub: "questions" },
    { label: "Accuracy", value: "81%", sub: "last 7 days" },
  ];

  return (
    <PreviewChrome title="Dashboard" badge="Preview">
      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={`rounded-lg border border-mist bg-paper-dark px-3 py-3 transition-all duration-500 ${
              active ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
            }`}
            style={{ transitionDelay: active ? `${index * 120}ms` : "0ms" }}
          >
            <p className="text-[10px] font-medium text-ink-muted">{stat.label}</p>
            <p className="mt-1 font-display text-xl font-semibold text-ink">{stat.value}</p>
            <p className="text-[10px] text-ink-muted">{stat.sub}</p>
          </div>
        ))}
      </div>
      <div
        className={`mt-4 rounded-lg border border-mist bg-paper-dark px-3 py-3 transition-all duration-500 ${
          active ? "opacity-100" : "opacity-0"
        }`}
        style={{ transitionDelay: active ? "400ms" : "0ms" }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
          Weakness summary
        </p>
        <p className="mt-2 text-xs text-ink">
          Listening — <span className="text-seal">3 incorrect</span>
        </p>
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
    <section id="how-it-works" className="border-y border-mist bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold text-ink">How it works</h2>
          <p className="mt-3 text-sm text-ink-muted">
            Watch the full prep loop — from mock exam to targeted practice. All previews use
            example data, not your account.
          </p>
          <div className="mx-auto mt-4 h-px w-24 bg-brush-rule" />
        </div>

        <div
          className="mt-12 grid items-start gap-10 lg:grid-cols-2 lg:gap-14"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
        >
          <ol className="space-y-3" aria-label="How it works steps">
            {STEPS.map((step, index) => {
              const isActive = index === activeIndex;
              return (
                <li key={step.id}>
                  <button
                    type="button"
                    onClick={() => goTo(index)}
                    className={`w-full rounded-xl border p-4 text-left transition-all duration-300 ${
                      isActive
                        ? "border-jade/40 bg-jade/5 shadow-card"
                        : "border-mist bg-white hover:border-jade/20 hover:bg-paper-dark/50"
                    }`}
                    aria-current={isActive ? "step" : undefined}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-sm font-semibold transition-colors ${
                          isActive ? "bg-jade text-white" : "bg-seal/10 text-seal"
                        }`}
                      >
                        {step.step}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-display text-lg font-semibold text-ink">
                          {step.title}
                        </h3>
                        <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                          {step.description}
                        </p>
                        {isActive && !reducedMotion ? (
                          <div className="mt-3 h-1 overflow-hidden rounded-full bg-mist">
                            <div
                              key={`${step.id}-${activeIndex}`}
                              className="h-full rounded-full bg-jade motion-safe:animate-[showcase-progress_5.2s_linear_forwards]"
                            />
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="relative lg:sticky lg:top-24">
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
                <StepPreview
                  stepId={step.id}
                  active={index === activeIndex}
                />
              </div>
            ))}
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-ink-muted">
          {paused
            ? "Paused — move cursor away to resume"
            : reducedMotion
              ? "Select a step to explore each preview"
              : `Showing step ${activeStep.step} of ${STEPS.length}`}
        </p>
      </div>
    </section>
  );
}
