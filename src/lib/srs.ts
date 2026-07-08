export type SrsCard = {
  interval: number; // days
  repetitions: number;
  easeFactor: number;
};

export type SrsResult = SrsCard & { dueAt: Date };

export function sm2(card: SrsCard, quality: number): SrsResult {
  let { interval, repetitions, easeFactor } = card;
  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);
    repetitions += 1;
    easeFactor = Math.max(
      1.3,
      easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
    );
  }
  const dueAt = new Date();
  dueAt.setDate(dueAt.getDate() + interval);
  return { interval, repetitions, easeFactor, dueAt };
}
