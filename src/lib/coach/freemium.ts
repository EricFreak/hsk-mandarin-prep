import type { Plan } from "@/lib/entitlements";
import type {
  CoachGap,
  CoachPlanTaskRow,
  CoachReportRow,
  CoachStrength,
} from "./types";

export function truncateToFirstParagraph(markdown: string): string {
  const parts = markdown.split(/\n\s*\n/).filter(Boolean);
  return parts[0] ?? markdown;
}

export function applyFreemiumReport(
  report: CoachReportRow,
  plan: Plan,
): CoachReportRow {
  if (plan === "pro") return report;

  return {
    ...report,
    summary_markdown: truncateToFirstParagraph(report.summary_markdown),
    gaps: report.gaps.slice(0, 1) as CoachGap[],
    strengths: report.strengths.slice(0, 1) as CoachStrength[],
  };
}

export function applyFreemiumTasks(
  tasks: CoachPlanTaskRow[],
  _plan: Plan,
): CoachPlanTaskRow[] {
  return tasks;
}

export function getTodayDayOffset(weekStart: string): number {
  const start = new Date(`${weekStart}T00:00:00.000Z`);
  const today = new Date();
  const startUtc = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const diff = Math.floor((todayUtc - startUtc) / (24 * 60 * 60 * 1000));
  return Math.max(0, Math.min(6, diff));
}

export function pickTodayTask(
  tasks: CoachPlanTaskRow[],
  weekStart: string,
): CoachPlanTaskRow | null {
  const dayOffset = getTodayDayOffset(weekStart);
  const todayTasks = tasks.filter(
    (task) => task.day_offset === dayOffset && task.status === "pending",
  );
  const practiceTask = todayTasks.find((task) => task.task_type === "practice");
  return practiceTask ?? todayTasks[0] ?? tasks.find((task) => task.status === "pending") ?? null;
}
