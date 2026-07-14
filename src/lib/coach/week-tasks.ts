import type { Plan } from "@/lib/entitlements";
import { canExecuteWeek } from "@/lib/coach/journey/week-unlock";
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

export function gateOrderedWeekTasks(
  tasks: CoachPlanTaskRow[],
  topGapSkill: string | null,
  plan: Plan,
  journey?: {
    weekIndex: number;
    currentWeekIndex: number;
    w1ClearedAt?: string | null;
  },
): { tasks: CoachPlanTaskRow[]; hiddenTaskCount: number; executionLocked: boolean } {
  const ordered = orderWeekTasks(tasks, topGapSkill);
  if (
    journey &&
    !canExecuteWeek({
      weekIndex: journey.weekIndex,
      currentWeekIndex: journey.currentWeekIndex,
      plan,
      w1ClearedAt: journey.w1ClearedAt,
    })
  ) {
    return { tasks: [], hiddenTaskCount: ordered.length, executionLocked: true };
  }
  if (plan === "free") {
    return { tasks: ordered, hiddenTaskCount: 0, executionLocked: false };
  }
  return { tasks: ordered, hiddenTaskCount: 0, executionLocked: false };
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
