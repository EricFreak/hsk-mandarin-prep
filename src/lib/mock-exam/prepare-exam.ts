import type { MockExamQuestion } from "@/lib/mock-exam/hsk3-template";

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash || 1;
}

function seededShuffle<T>(items: T[], seed: string): T[] {
  const shuffled = [...items];
  let state = hashSeed(seed);

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const j = state % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

/** Deterministically shuffle MCQ choices so correct answers are not always option A. */
export function prepareMockExamQuestion(question: MockExamQuestion): MockExamQuestion {
  if (!question.choices || question.answerIndex === undefined) {
    return question;
  }

  const correctChoice = question.choices[question.answerIndex];
  const choices = seededShuffle(question.choices, question.id);

  return {
    ...question,
    choices,
    answerIndex: choices.indexOf(correctChoice),
  };
}

export function prepareMockExam(questions: MockExamQuestion[]): MockExamQuestion[] {
  return questions.map(prepareMockExamQuestion);
}
