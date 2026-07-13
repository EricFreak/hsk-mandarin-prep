import type { JourneyStageId } from "./types";

/** Relative skill weights inside a stage (sum ~= 1). */
export function stageQuotas(stage: JourneyStageId): Record<string, number> {
  switch (stage) {
    case "diagnose":
      return { vocabulary: 0.3, grammar: 0.2, listening: 0.2, reading: 0.2, writing: 0.1 };
    case "foundation":
      return { vocabulary: 0.4, grammar: 0.35, listening: 0.1, reading: 0.1, writing: 0.05 };
    case "skills":
      return { vocabulary: 0.15, grammar: 0.15, listening: 0.25, reading: 0.25, writing: 0.2 };
    case "sprint":
      return { listening: 0.25, reading: 0.25, writing: 0.2, vocabulary: 0.15, grammar: 0.15 };
  }
}

export function reweightQuotas(
  base: Record<string, number>,
  gaps: { skill: string; severity: "low" | "medium" | "high" }[],
): Record<string, number> {
  const boost = { low: 1.1, medium: 1.25, high: 1.5 } as const;
  const next = { ...base };
  for (const g of gaps) {
    const key = g.skill in next ? g.skill : g.skill === "vocab" ? "vocabulary" : g.skill;
    if (key in next) next[key] = (next[key] ?? 0) * boost[g.severity];
  }
  const sum = Object.values(next).reduce((a, b) => a + b, 0) || 1;
  for (const k of Object.keys(next)) next[k] = (next[k] ?? 0) / sum;
  return next;
}

export function primaryTheme(quotas: Record<string, number>, stage: JourneyStageId): {
  theme: string;
  skillFocus: string[];
} {
  const ranked = Object.entries(quotas).sort((a, b) => b[1] - a[1]);
  const top = ranked.slice(0, 2).map(([k]) => k);
  const label: Record<string, string> = {
    vocabulary: "Vocabulary",
    grammar: "Grammar",
    listening: "Listening",
    reading: "Reading",
    writing: "Writing",
  };
  const theme =
    stage === "sprint"
      ? `Sprint · ${label[top[0]!] ?? top[0]} + mock review`
      : `${label[top[0]!] ?? top[0]} focus` +
        (top[1] ? ` · ${label[top[1]] ?? top[1]} support` : "");
  return { theme, skillFocus: top };
}
