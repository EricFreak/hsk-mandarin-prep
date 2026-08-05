import type { Plan } from "@/lib/entitlements";
import type { CoachPlanTaskRow, CoachReportRow } from "./types";

/** Free users now receive the complete coach report (spec §2). */
export function applyFreemiumReport(
  report: CoachReportRow,
  _plan: Plan,
): CoachReportRow {
  void _plan;
  return report;
}

export function applyFreemiumTasks(
  tasks: CoachPlanTaskRow[],
  plan: Plan,
): CoachPlanTaskRow[] {
  void plan;
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
