// src/lib/coach/journey/mastery-gate.ts
export type MasteryOutcome = "not_yet" | "passed" | "challenged";

export function evaluateMasteryGate(input: {
  correct: number;
  answered: number;
  hintAssistedCorrect: number;
  passThreshold?: number;
  challengeThreshold?: number;
  taskType?: string;
}): {
  outcome: MasteryOutcome;
  displayScore: number | null;
  displayMax: number | null;
  effectiveAccuracy: number | null;
} {
  if (input.taskType === "rest") {
    return { outcome: "passed", displayScore: null, displayMax: null, effectiveAccuracy: null };
  }
  const passAt = input.passThreshold ?? 0.75;
  const effectiveCorrect = Math.max(0, input.correct - input.hintAssistedCorrect);
  const answered = Math.max(1, input.answered);
  const acc = effectiveCorrect / answered;
  const displayMax = 10;
  const displayScore = Math.round(acc * displayMax);
  if (acc >= (input.challengeThreshold ?? 0.9)) {
    return { outcome: "challenged", displayScore, displayMax, effectiveAccuracy: acc };
  }
  if (acc >= passAt) {
    return { outcome: "passed", displayScore, displayMax, effectiveAccuracy: acc };
  }
  return { outcome: "not_yet", displayScore, displayMax, effectiveAccuracy: acc };
}
