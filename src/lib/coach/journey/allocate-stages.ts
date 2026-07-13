import type { StageWindow, JourneyStageId } from "./types";

function parseDay(iso: string): number {
  return Date.parse(`${iso}T00:00:00.000Z`);
}
function formatDay(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}
function addDays(iso: string, days: number): string {
  return formatDay(parseDay(iso) + days * 86400000);
}
function dayDiff(a: string, b: string): number {
  return Math.round((parseDay(b) - parseDay(a)) / 86400000);
}

export function allocateStages(input: {
  today: string;
  examDate: string | null;
  defaultHorizonWeeks?: number;
}): StageWindow[] {
  const horizonWeeks = input.defaultHorizonWeeks ?? 12;
  const exam =
    input.examDate ?? addDays(input.today, horizonWeeks * 7);
  const total = Math.max(21, dayDiff(input.today, exam)); // at least ~3 weeks
  const diagnoseDays = Math.min(7, Math.max(3, Math.round(total * 0.08)));
  let sprintDays = Math.round(total * 0.2);
  sprintDays = Math.min(28, Math.max(14, sprintDays));
  if (total < 42) sprintDays = Math.min(14, Math.max(10, Math.round(total * 0.25)));
  const remaining = Math.max(7, total - diagnoseDays - sprintDays);
  // Short horizon: foundation gets ~35% of remaining; long: ~55%
  const foundationShare = total < 56 ? 0.35 : 0.55;
  const foundationDays = Math.max(5, Math.round(remaining * foundationShare));
  const skillsDays = Math.max(5, remaining - foundationDays);

  const d0 = input.today;
  const d1 = addDays(d0, diagnoseDays);
  const d2 = addDays(d1, foundationDays);
  const d3 = addDays(d2, skillsDays);
  const d4 = exam;

  const windows: StageWindow[] = [
    { stage: "diagnose", startDate: d0, endDate: d1 },
    { stage: "foundation", startDate: d1, endDate: d2 },
    { stage: "skills", startDate: d2, endDate: d3 },
    { stage: "sprint", startDate: d3, endDate: d4 },
  ];
  return windows;
}

export function stageAtDate(windows: StageWindow[], date: string): JourneyStageId {
  for (const w of windows) {
    if (date >= w.startDate && date < w.endDate) return w.stage;
  }
  return windows.at(-1)?.stage ?? "sprint";
}
