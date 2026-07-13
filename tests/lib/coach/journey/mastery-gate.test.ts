import { describe, expect, it } from "vitest";
import { evaluateMasteryGate } from "@/lib/coach/journey/mastery-gate";

describe("evaluateMasteryGate", () => {
  it("passes at 0.75 accuracy", () => {
    const r = evaluateMasteryGate({
      correct: 8,
      answered: 10,
      hintAssistedCorrect: 0,
      passThreshold: 0.75,
    });
    expect(r.outcome).toBe("passed");
    expect(r.displayScore).toBe(8);
  });

  it("excludes hint-assisted corrects from pass numerator", () => {
    const r = evaluateMasteryGate({
      correct: 9,
      answered: 10,
      hintAssistedCorrect: 3,
      passThreshold: 0.75,
    });
    // effective 6/10
    expect(r.outcome).toBe("not_yet");
  });

  it("rest tasks auto-pass without fake score", () => {
    const r = evaluateMasteryGate({
      taskType: "rest",
      correct: 0,
      answered: 0,
      hintAssistedCorrect: 0,
    });
    expect(r.outcome).toBe("passed");
    expect(r.displayScore).toBeNull();
  });
});
