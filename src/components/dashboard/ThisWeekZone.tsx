"use client";

import Link from "next/link";
import UpgradeCTA from "@/components/paywall/UpgradeCTA";
import type { CoachDashboardPayload } from "@/lib/coach/fetch-coach";
import type { CoachPlanTaskRow } from "@/lib/coach/types";
import { taskTypeLabel } from "@/lib/coach/week-tasks";

function capitalizeSkill(skill: string): string {
  return skill.charAt(0).toUpperCase() + skill.slice(1);
}

function taskHref(task: CoachPlanTaskRow): string {
  if (task.task_type === "practice" && task.skill) {
    return `/practice?skill=${encodeURIComponent(task.skill)}&planTaskId=${task.id}`;
  }
  if (task.task_type === "review_mistakes") return "/mistakes";
  if (task.task_type === "flashcards") return "/flashcards";
  if (task.task_type === "mock_section") return "/mock-exam";
  return "/practice";
}

function taskMeta(task: CoachPlanTaskRow): string {
  const parts = [taskTypeLabel(task.task_type)];
  if (task.skill) parts.push(capitalizeSkill(task.skill));
  return parts.join(" · ");
}

/** Map DB status until MasteryGate ships Retry / Challenge. */
function statusChip(task: CoachPlanTaskRow): "Passed" | "Available" {
  return task.status === "done" ? "Passed" : "Available";
}

type Props = {
  data: CoachDashboardPayload | undefined;
  error: Error | undefined;
  isValidating: boolean;
  onRefreshCoach?: () => void;
};

export default function ThisWeekZone({
  data,
  error,
  isValidating,
  onRefreshCoach,
}: Props) {
  if (error && !data) {
    return (
      <div className="surface-card p-6">
        <p className="text-sm text-seal">Could not load your weekly plan.</p>
      </div>
    );
  }

  if (!data || data.status === "none") {
    return (
      <div className="surface-card border-jade/20 bg-jade/5 p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-jade">This week</p>
        <h2 className="mt-2 font-display text-lg font-semibold text-ink">Get your study plan</h2>
        <p className="mt-2 text-sm text-ink-muted">
          Take a mock exam so your coach can set this week&apos;s problem and tasks.
        </p>
        <Link href="/mock-exam" className="btn-primary mt-4 inline-flex">
          Take mock exam
        </Link>
      </div>
    );
  }

  if (data.status === "pending") {
    return (
      <div className="surface-card border-jade/20 bg-jade/5 p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-jade">This week</p>
        <h2 className="mt-2 font-display text-lg font-semibold text-ink">Building your plan…</h2>
        <p className="mt-2 text-sm text-ink-muted">
          {isValidating
            ? "Generating your coach report and study plan…"
            : "Your coach report is being prepared. Check back in a minute."}
        </p>
      </div>
    );
  }

  const topGap = data.report?.gaps[0] ?? null;
  const topGapSkill = topGap?.skill ?? data.studyPlan?.focus_skills[0] ?? null;
  const alsoSkills = (data.studyPlan?.focus_skills ?? []).filter(
    (skill) => skill !== topGapSkill,
  );
  const tasks = data.tasks;
  const passedCount = tasks.filter((task) => task.status === "done").length;
  const firstActionableIndex = tasks.findIndex((task) => task.status !== "done");
  const allPassed = tasks.length > 0 && firstActionableIndex === -1;

  if (data.executionLocked) {
    return (
      <div className="surface-card border-jade/25 bg-jade/5 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-jade">
            This week · Week {data.currentWeekIndex}
          </p>
          <Link href="/dashboard/journey" className="text-sm text-link">
            Full journey →
          </Link>
        </div>
        <h2 className="mt-3 font-display text-lg font-semibold text-ink">
          Week {data.currentWeekIndex} is locked
        </h2>
        <p className="mt-2 text-sm text-ink-muted">
          {data.plan === "free"
            ? "Free includes full Week 1 execution. Upgrade to Pro to unlock Week 2 and beyond."
            : "Complete your current week with mastery before this week unlocks."}
        </p>
        {data.plan === "free" ? (
          <div className="mt-4">
            <UpgradeCTA
              title="Unlock Week 2 and your full journey"
              description="Pro unlocks sequential weeks, full plan execution, and complete progress trends."
              className="text-left"
            />
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="surface-card border-jade/25 bg-jade/5 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-jade">
          This week · Week {data.weekIndex}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/dashboard/journey" className="text-sm text-link">
            Full journey →
          </Link>
          {data.plan === "pro" && onRefreshCoach ? (
            <button type="button" className="text-sm text-link" onClick={onRefreshCoach}>
              Refresh coach
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
          This week&apos;s problem
        </p>
        {topGap ? (
          <h2 className="mt-1 font-display text-lg font-semibold text-ink">
            {capitalizeSkill(topGap.skill)}
            {topGap.evidence ? (
              <span className="font-sans text-base font-normal text-ink-muted">
                {" — "}
                {topGap.evidence}
              </span>
            ) : null}
          </h2>
        ) : topGapSkill ? (
          <h2 className="mt-1 font-display text-lg font-semibold text-ink">
            {capitalizeSkill(topGapSkill)}
          </h2>
        ) : (
          <h2 className="mt-1 font-display text-lg font-semibold text-ink">Your study plan</h2>
        )}
        {alsoSkills.length > 0 ? (
          <p className="mt-2 text-sm text-ink-muted">
            Also training: {alsoSkills.map(capitalizeSkill).join(" · ")}
          </p>
        ) : null}
      </div>

      {allPassed ? (
        <p className="mt-4 text-sm text-ink-muted">
          All visible tasks are passed.{" "}
          <Link href="/mock-exam" className="text-link">
            Take another mock
          </Link>{" "}
          to refresh your week.
        </p>
      ) : (
        <>
          <p className="mt-4 text-sm text-ink-muted">
            Suggested order — start at the top. Any task is fine.
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            {passedCount} of {tasks.length} passed
            {data.hiddenTaskCount > 0 ? ` · +${data.hiddenTaskCount} more on Pro` : null}
          </p>
        </>
      )}

      <ol className="mt-4 space-y-2">
        {tasks.map((task, index) => {
          const chip = statusChip(task);
          const isPrimary = index === firstActionableIndex;
          const href = taskHref(task);
          const rank = index + 1;

          return (
            <li
              key={task.id}
              className={
                isPrimary
                  ? "flex flex-wrap items-center justify-between gap-3 rounded-lg border-2 border-jade/40 bg-paper px-4 py-3"
                  : "flex flex-wrap items-center justify-between gap-3 rounded-lg border border-mist bg-paper/80 px-4 py-3"
              }
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-ink-muted">{rank}</span>
                  <p
                    className={
                      isPrimary
                        ? "text-base font-semibold text-ink"
                        : "text-sm font-medium text-ink"
                    }
                  >
                    {task.title}
                  </p>
                  <span
                    className={
                      chip === "Passed"
                        ? "rounded-full border border-jade/30 bg-jade/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-jade"
                        : "rounded-full border border-mist px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-muted"
                    }
                  >
                    {chip}
                  </span>
                </div>
                <p className="mt-1 text-xs text-ink-muted">{taskMeta(task)}</p>
              </div>
              <div className="flex items-center gap-2">
                {chip === "Passed" ? null : isPrimary ? (
                  <Link href={href} className="btn-primary text-sm">
                    Start
                  </Link>
                ) : (
                  <Link href={href} className="btn-secondary text-sm">
                    Open
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {data.shouldShowQuoteCta ? (
        <div className="mt-4 rounded-lg border-2 border-jade/40 bg-jade/5 p-4">
          <p className="text-sm font-semibold text-ink">
            Sample day complete — continue your full journey
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            Get a plan quote to unlock the rest of your weeks and full plan execution.
          </p>
          <Link href="/plan/quote" className="btn-primary mt-3 inline-flex">
            Get plan quote
          </Link>
        </div>
      ) : null}

      {data.hiddenTaskCount > 0 ? (
        <div className="mt-4">
          <UpgradeCTA
            title="Unlock your full week plan"
            description="Pro unlocks the rest of this week’s tasks, all plan-driven practice, and full progress trends."
            className="text-left"
          />
        </div>
      ) : null}

      <div className="mt-4">
        <Link
          href="/dashboard/plans"
          className="text-sm text-ink-muted underline-offset-2 hover:text-ink hover:underline"
        >
          Earlier plans →
        </Link>
      </div>
    </div>
  );
}
