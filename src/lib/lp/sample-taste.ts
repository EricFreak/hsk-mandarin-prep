import type { AccessSource } from "./access";

/** Skills included in the free cross-skill sample taste (not calendar Day 1). */
export const TASTER_SKILLS = [
  "vocabulary",
  "listening",
  "grammar",
  "writing",
] as const;

export type TasterTaskLike = {
  id: string;
  skill: string | null;
  day_offset: number;
  task_type: string;
};

/**
 * Pick at most one task per taster skill (earliest day_offset).
 * If no skill-tagged tasks match, fall back to all non-rest day_offset 0 tasks
 * so free users are never fully locked out of a broken plan.
 */
export function selectTasterTaskIds(tasks: TasterTaskLike[]): Set<string> {
  const ids = new Set<string>();

  for (const skill of TASTER_SKILLS) {
    const candidates = tasks
      .filter((t) => (t.skill ?? "").toLowerCase() === skill)
      .filter((t) => t.task_type !== "rest")
      .sort(
        (a, b) =>
          a.day_offset - b.day_offset || a.id.localeCompare(b.id),
      );
    if (candidates[0]) ids.add(candidates[0].id);
  }

  if (ids.size === 0) {
    for (const t of tasks) {
      if (t.day_offset === 0 && t.task_type !== "rest") ids.add(t.id);
    }
  }

  return ids;
}

/** Free users may only execute week-1 taster tasks. Paid / sprint / legacy → all. */
export function canExecuteTask(input: {
  access: AccessSource | null;
  weekIndex: number;
  taskId: string;
  tasterTaskIds: ReadonlySet<string>;
}): boolean {
  if (input.access) return true;
  if (input.weekIndex !== 1) return false;
  return input.tasterTaskIds.has(input.taskId);
}
