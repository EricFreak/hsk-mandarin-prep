import type { CoachGap, CoachStrength } from "./types";

export type GlanceReport = {
  id: string;
  readiness_score: number | null;
  gaps: CoachGap[];
  strengths: CoachStrength[];
};

export type SkillDirection = "up" | "down" | "flat";

export type SkillChip = {
  skill: string;
  direction: SkillDirection;
};

export function readinessDelta(
  current: GlanceReport | null,
  previous: GlanceReport | null,
): number | null {
  if (!current || current.readiness_score == null) return null;
  if (!previous || previous.readiness_score == null) return null;
  return current.readiness_score - previous.readiness_score;
}

function role(report: GlanceReport, skill: string): "gap" | "strength" | "none" {
  if (report.gaps.some((g) => g.skill === skill)) return "gap";
  if (report.strengths.some((s) => s.skill === skill)) return "strength";
  return "none";
}

export function skillDirectionChips(
  current: GlanceReport | null,
  previous: GlanceReport | null,
  limit: number,
): SkillChip[] {
  if (!current) return [];
  const skills: string[] = [];
  for (const g of current.gaps) {
    if (!skills.includes(g.skill)) skills.push(g.skill);
  }
  for (const s of current.strengths) {
    if (!skills.includes(s.skill)) skills.push(s.skill);
  }
  return skills.slice(0, limit).map((skill) => {
    if (!previous) return { skill, direction: "flat" as const };
    const cur = role(current, skill);
    const prev = role(previous, skill);
    let direction: SkillDirection = "flat";
    if (cur === "strength" && prev === "gap") direction = "up";
    else if (cur === "gap" && prev === "strength") direction = "down";
    else if (cur === "gap" && prev === "none") direction = "down";
    else if (cur === "strength" && prev === "none") direction = "up";
    return { skill, direction };
  });
}
