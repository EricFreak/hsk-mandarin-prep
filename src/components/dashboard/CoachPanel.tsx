"use client";

import Link from "next/link";
import UpgradeCTA from "@/components/paywall/UpgradeCTA";
import type { CoachDashboardPayload } from "@/lib/coach/fetch-coach";
import useSWR from "swr";

const fetcher = (url: string) =>
  fetch(url).then((response) => {
    if (!response.ok) {
      throw new Error("Failed to load coach data");
    }
    return response.json() as Promise<CoachDashboardPayload>;
  });

function capitalizeSkill(skill: string): string {
  return skill.charAt(0).toUpperCase() + skill.slice(1);
}

function taskHref(task: CoachDashboardPayload["todayTask"]): string {
  if (!task) return "/practice";
  if (task.task_type === "practice" && task.skill) {
    return `/practice?skill=${encodeURIComponent(task.skill)}&planTaskId=${task.id}`;
  }
  if (task.task_type === "review_mistakes") return "/mistakes";
  if (task.task_type === "flashcards") return "/flashcards";
  return "/practice";
}

export default function CoachPanel() {
  const { data, error, isValidating, mutate } = useSWR("/api/coach/dashboard", fetcher, {
    refreshInterval: (latest) => (latest?.status === "pending" ? 4000 : 0),
    revalidateOnFocus: true,
  });

  async function markTaskDone(taskId: string) {
    await fetch(`/api/coach/plan/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "done" }),
    });
    void mutate();
  }

  if (error && !data) {
    return null;
  }

  if (!data || data.status === "none") {
    return (
      <div className="surface-card p-6">
        <h2 className="font-display text-lg font-semibold text-ink">AI Learning Coach</h2>
        <p className="mt-2 text-sm text-ink-muted">
          Complete a mock exam to unlock your personalized AI summary and weekly study plan.
        </p>
        <Link href="/mock-exam" className="btn-primary mt-4 inline-flex">
          Take mock exam
        </Link>
      </div>
    );
  }

  if (data.status === "pending") {
    return (
      <div className="surface-card p-6">
        <h2 className="font-display text-lg font-semibold text-ink">AI Learning Coach</h2>
        <p className="mt-2 text-sm text-ink-muted">
          {isValidating
            ? "Generating your coach report and study plan…"
            : "Your coach report is being prepared."}
        </p>
      </div>
    );
  }

  const report = data.report;
  const todayTask = data.todayTask;

  return (
    <div className="space-y-6">
      <div className="surface-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">AI Summary</h2>
            {report?.readiness_score != null ? (
              <p className="mt-1 text-sm text-ink-muted">
                Exam readiness estimate:{" "}
                <span className="font-semibold text-jade">{report.readiness_score}%</span>
              </p>
            ) : null}
          </div>
          {data.plan === "pro" ? (
            <button
              type="button"
              className="text-sm text-link"
              onClick={() => {
                void fetch("/api/coach/report", { method: "POST" }).then(() => mutate());
              }}
            >
              Refresh coach
            </button>
          ) : null}
        </div>

        {report ? (
          <div className="prose prose-sm mt-4 max-w-none text-ink">
            {report.summary_markdown.split("\n\n").map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className="mt-3 text-sm leading-relaxed text-ink-muted">
                {paragraph}
              </p>
            ))}
          </div>
        ) : null}

        {report && report.gaps.length > 0 ? (
          <div className="mt-5 border-t border-mist pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Top gaps
            </p>
            <ul className="mt-3 space-y-2">
              {report.gaps.map((gap) => (
                <li
                  key={gap.skill}
                  className="rounded-lg border border-mist bg-paper-dark px-4 py-3 text-sm"
                >
                  <span className="font-medium text-ink">{capitalizeSkill(gap.skill)}</span>
                  <span className="text-ink-muted"> — {gap.evidence}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {data.plan === "free" && report ? (
          <div className="mt-4">
            <UpgradeCTA
              title="Unlock full coach report"
              description="Upgrade to Pro for the complete AI summary, all skill gaps, and your full 7-day study plan."
              className="text-left"
            />
          </div>
        ) : null}
      </div>

      <div className="surface-card p-6">
        <h2 className="font-display text-lg font-semibold text-ink">Your plan this week</h2>
        {todayTask ? (
          <div className="mt-4 rounded-lg border border-jade/30 bg-jade/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-jade">Today&apos;s focus</p>
            <p className="mt-2 text-sm font-medium text-ink">{todayTask.title}</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <Link href={taskHref(todayTask)} className="btn-primary text-sm">
                Start today&apos;s task
              </Link>
              <button
                type="button"
                className="btn-secondary text-sm"
                onClick={() => void markTaskDone(todayTask.id)}
              >
                Mark done
              </button>
            </div>
          </div>
        ) : null}

        <ul className="mt-4 space-y-2">
          {data.tasks.map((task) => (
            <li
              key={task.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-mist bg-paper-dark px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-ink">{task.title}</p>
                <p className="text-xs text-ink-muted">
                  Day {task.day_offset + 1} · {task.task_type.replace("_", " ")}
                  {task.skill ? ` · ${capitalizeSkill(task.skill)}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {task.status === "done" ? (
                  <span className="text-xs font-semibold text-jade">Done</span>
                ) : task.task_type === "practice" && task.skill ? (
                  <Link
                    href={`/practice?skill=${encodeURIComponent(task.skill)}&planTaskId=${task.id}`}
                    className="text-sm text-link"
                  >
                    Start
                  </Link>
                ) : null}
              </div>
            </li>
          ))}
        </ul>

        {data.hiddenTaskCount > 0 ? (
          <p className="mt-4 text-sm text-ink-muted">
            +{data.hiddenTaskCount} more tasks on Pro
          </p>
        ) : null}
      </div>

      <div className="surface-card p-6">
        <h2 className="font-display text-lg font-semibold text-ink">Need human help?</h2>
        <p className="mt-2 text-sm text-ink-muted">
          Want 1-on-1 tutoring? Message us on WeChat for personalized coaching.
        </p>
        {data.tutoringWechatId ? (
          <p className="mt-3 text-sm font-medium text-ink">WeChat: {data.tutoringWechatId}</p>
        ) : (
          <p className="mt-3 text-sm text-ink-muted">WeChat contact coming soon.</p>
        )}
      </div>
    </div>
  );
}
