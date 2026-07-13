import type { StageWindow, WeekOutlineRow } from "./types";
import { stageAtDate } from "./allocate-stages";
import { primaryTheme, reweightQuotas, stageQuotas } from "./stage-quotas";

function addDays(iso: string, days: number): string {
  const ms = Date.parse(`${iso}T00:00:00.000Z`) + days * 86400000;
  return new Date(ms).toISOString().slice(0, 10);
}

export function buildWeekOutline(input: {
  stages: StageWindow[];
  today: string;
  gaps: { skill: string; severity: "low" | "medium" | "high" }[];
}): WeekOutlineRow[] {
  const end = input.stages.at(-1)!.endDate;
  const rows: WeekOutlineRow[] = [];
  let weekStart = input.today;
  let index = 1;
  while (weekStart < end && index <= 52) {
    const stage = stageAtDate(input.stages, weekStart);
    const quotas = reweightQuotas(stageQuotas(stage), input.gaps);
    const { theme, skillFocus } = primaryTheme(quotas, stage);
    rows.push({
      weekIndex: index,
      stage,
      theme,
      skillFocus,
      status: index === 1 ? "available" : "locked",
    });
    weekStart = addDays(weekStart, 7);
    index += 1;
  }
  return rows;
}
