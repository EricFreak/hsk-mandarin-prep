"use client";

import { useState } from "react";
import Link from "next/link";
import type { CoachPlansPayload } from "@/lib/coach/fetch-coach";
import useSWR from "swr";

const fetcher = (url: string) =>
  fetch(url).then((response) => {
    if (!response.ok) throw new Error("Failed to load plans");
    return response.json() as Promise<CoachPlansPayload>;
  });

function capitalizeSkill(skill: string): string {
  return skill.charAt(0).toUpperCase() + skill.slice(1);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function PastPlansView() {
  const { data, error } = useSWR("/api/coach/plans", fetcher);
  const [openId, setOpenId] = useState<string | null>(null);

  if (error) {
    return <p className="text-sm text-seal">Could not load past plans.</p>;
  }

  if (!data) {
    return <p className="text-sm text-ink-muted">Loading plans…</p>;
  }

  if (data.plans.length === 0) {
    return (
      <div className="surface-card p-6">
        <p className="text-sm text-ink-muted">
          No study plans yet. Finish a mock exam so the coach can build your first week.
        </p>
        <Link href="/mock-exam" className="btn-primary mt-4 inline-flex">
          Take mock exam
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {data.plans.map((plan) => {
        const open = openId === plan.id;
        return (
          <li key={plan.id} className="surface-card p-5">
            <button
              type="button"
              className="flex w-full flex-wrap items-start justify-between gap-3 text-left"
              onClick={() => setOpenId(open ? null : plan.id)}
            >
              <div>
                <p className="font-display text-base font-semibold text-ink">
                  Week of {formatDate(plan.week_start)}
                </p>
                <p className="mt-1 text-sm text-ink-muted">
                  {plan.focus_skills.map(capitalizeSkill).join(" · ") || "No focus skills"}
                  {" · "}
                  {plan.taskDone}/{plan.taskTotal} tasks done
                </p>
              </div>
              <span className="rounded-full border border-mist px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                {plan.status}
              </span>
            </button>
            {open ? (
              <ul className="mt-4 space-y-2 border-t border-mist pt-4">
                {plan.tasks.map((task) => (
                  <li key={task.id} className="flex justify-between gap-3 text-sm">
                    <span className="text-ink">{task.title}</span>
                    <span className="text-ink-muted">{task.status}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
