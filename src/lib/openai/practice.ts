import { formatPinyinSpaced } from "@/lib/pinyin";
import type { HskWord } from "@/lib/syllabus";
import OpenAI from "openai";
import { z } from "zod";

export type PracticeQuestion = {
  stem: string;
  choices: string[];
  answerIndex: number;
  explanation: string;
  skill: string;
};

const practiceQuestionSchema = z.object({
  stem: z.string().min(1),
  choices: z.array(z.string().min(1)).length(4),
  answerIndex: z.number().int().min(0).max(3),
  explanation: z.string().min(1),
  skill: z.string().min(1),
});

export function parsePracticeQuestion(json: unknown): PracticeQuestion {
  return practiceQuestionSchema.parse(json);
}

function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

function deterministicIndex(seed: number, max: number): number {
  return Math.abs(seed) % max;
}

function buildFallbackQuestion(
  level: 1 | 2 | 3,
  words: HskWord[],
  seed = 0,
): PracticeQuestion {
  if (words.length < 4) {
    throw new Error("At least four words are required to generate a practice question");
  }

  const answerIdx = deterministicIndex(level * 17 + seed, words.length);
  const answer = words[answerIdx];
  const pool = words.filter((word) => word.id !== answer.id);
  const distractors = [0, 1, 2].map((offset) => pool[(answerIdx + offset) % pool.length]);

  const choices = [answer.english, ...distractors.map((word) => word.english)];
  const rotateBy = deterministicIndex(level * 3 + seed, choices.length);
  const rotated = [...choices.slice(rotateBy), ...choices.slice(0, rotateBy)];
  const answerIndex = rotated.indexOf(answer.english);

  return {
    stem: `Choose the best English meaning for: ${answer.hanzi} (${formatPinyinSpaced(answer.pinyin)})`,
    choices: rotated,
    answerIndex,
    explanation: `${answer.hanzi} (${formatPinyinSpaced(answer.pinyin)}) means "${answer.english}".`,
    skill: "vocabulary",
  };
}

function buildPrompt(level: 1 | 2 | 3, words: HskWord[], focusSkill?: string): string {
  const wordList = words
    .slice(0, 40)
    .map((word) => `${word.hanzi} (${formatPinyinSpaced(word.pinyin)}): ${word.english}`)
    .join("\n");

  const focusLine = focusSkill
    ? `\nFocus this question on the "${focusSkill}" skill area from the learner's study plan.`
    : "";

  return `You are an HSK ${level} Mandarin tutor. Generate ONE cloze-style multiple-choice question using ONLY vocabulary from this list:

${wordList}
${focusLine}

Requirements:
- Return valid JSON with keys: stem, choices, answerIndex, explanation, skill
- stem: a short Mandarin sentence with exactly one blank shown as ___
- choices: exactly 4 Mandarin words (hanzi only) from the list above
- answerIndex: 0-3 index of the correct choice
- explanation: one sentence in English explaining the answer
- skill: one of "vocabulary", "grammar", or "reading"
- Only one correct answer; distractors must be plausible HSK ${level} words from the list`;
}

export async function generatePracticeQuestion(
  level: 1 | 2 | 3,
  words: HskWord[],
  seed = 0,
  focusSkill?: string,
): Promise<PracticeQuestion> {
  const client = getOpenAIClient();
  if (!client) {
    const fallback = buildFallbackQuestion(level, words, seed);
    return focusSkill ? { ...fallback, skill: focusSkill } : fallback;
  }

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You generate HSK Mandarin practice questions. Respond with JSON only.",
        },
        {
          role: "user",
          content: buildPrompt(level, words, focusSkill),
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      const fallback = buildFallbackQuestion(level, words, seed);
      return focusSkill ? { ...fallback, skill: focusSkill } : fallback;
    }

    const parsed = parsePracticeQuestion(JSON.parse(content));
    return focusSkill ? { ...parsed, skill: focusSkill } : parsed;
  } catch {
    const fallback = buildFallbackQuestion(level, words, seed);
    return focusSkill ? { ...fallback, skill: focusSkill } : fallback;
  }
}
