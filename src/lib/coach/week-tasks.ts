import { canExecuteTask, type AccessSource } from "@/lib/lp/access";
import type { CoachPlanTaskRow } from "./types";

/**
 * Priority order for Zone 1: incomplete top-gap tasks first, then day_offset,
 * completed last. Free truncation prefers this order (problem-closing tasks).
 */
export function orderWeekTasks(
  tasks: CoachPlanTaskRow[],
  topGapSkill: string | null,
): CoachPlanTaskRow[] {
  return [...tasks].sort((a, b) => {
    const aDone = a.status === "done" ? 1 : 0;
    const bDone = b.status === "done" ? 1 : 0;
    if (aDone !== bDone) return aDone - bDone;

    if (topGapSkill) {
      const aGap = a.skill === topGapSkill ? 0 : 1;
      const bGap = b.skill === topGapSkill ? 0 : 1;
      if (aGap !== bGap) return aGap - bGap;
    }

    if (a.day_offset !== b.day_offset) return a.day_offset - b.day_offset;
    return a.title.localeCompare(b.title);
  });
}

/**
 * Stable partition: executable tasks first, locked previews after, preserving
 * relative order within each group. No-op when every task is executable (paid).
 */
export function partitionTasksByExecutability(
  tasks: CoachPlanTaskRow[],
  input: { access: AccessSource | null; weekIndex: number },
): CoachPlanTaskRow[] {
  const executable: CoachPlanTaskRow[] = [];
  const locked: CoachPlanTaskRow[] = [];
  for (const task of tasks) {
    if (
      canExecuteTask({
        access: input.access,
        weekIndex: input.weekIndex,
        dayOffset: task.day_offset,
      })
    ) {
      executable.push(task);
    } else {
      locked.push(task);
    }
  }
  return [...executable, ...locked];
}

/**
 * Week-level display gate for the dashboard task list. A non-current week is
 * hidden (executionLocked). The current week is shown in full; per-task
 * execution for free users is enforced server-side by `canExecuteTask` on the
 * task-status route, so the sample day (week 1, day 0) remains actionable
 * while later days are not completable via API.
 */
export function gateOrderedWeekTasks(
  tasks: CoachPlanTaskRow[],
  topGapSkill: string | null,
  journey?: {
    weekIndex: number;
    currentWeekIndex: number;
  },
  options?: {
    access: AccessSource | null;
  },
): { tasks: CoachPlanTaskRow[]; hiddenTaskCount: number; executionLocked: boolean } {
  const ordered = orderWeekTasks(tasks, topGapSkill);
  if (journey && journey.weekIndex !== journey.currentWeekIndex) {
    return { tasks: [], hiddenTaskCount: ordered.length, executionLocked: true };
  }
  const displayTasks =
    options != null
      ? partitionTasksByExecutability(ordered, {
          access: options.access,
          weekIndex: journey?.weekIndex ?? 1,
        })
      : ordered;
  return { tasks: displayTasks, hiddenTaskCount: 0, executionLocked: false };
}

export function taskTypeLabel(taskType: CoachPlanTaskRow["task_type"]): string {
  switch (taskType) {
    case "practice":
      return "Practice";
    case "review_mistakes":
      return "Review mistakes";
    case "flashcards":
      return "Flashcards";
    case "mock_section":
      return "Mock section";
    case "rest":
      return "Rest";
    default:
      return taskType;
  }
}
