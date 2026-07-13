import type { JourneyStageId, StageWindow } from "./types";

export const JOURNEY_STAGES: JourneyStageId[] = [
  "diagnose",
  "foundation",
  "skills",
  "sprint",
];

export function parseStageCalendar(value: unknown): StageWindow[] {
  if (!value) return [];
  if (Array.isArray(value)) return value as StageWindow[];
  if (typeof value === "object" && Object.keys(value as object).length === 0) return [];
  return [];
}

export function computeDaysToExam(
  targetExamDate: string | null | undefined,
  stageCalendar: StageWindow[],
  today = new Date().toISOString().slice(0, 10),
): number | null {
  const examDate = targetExamDate ?? stageCalendar.at(-1)?.endDate ?? null;
  if (!examDate) return null;
  const diff = Math.round(
    (Date.parse(`${examDate}T00:00:00.000Z`) - Date.parse(`${today}T00:00:00.000Z`)) /
      86400000,
  );
  return Math.max(0, diff);
}

export function formatStageLabel(stage: JourneyStageId | string): string {
  return stage.charAt(0).toUpperCase() + stage.slice(1);
}

export function stageDotIndex(stage: JourneyStageId): number {
  return JOURNEY_STAGES.indexOf(stage);
}
