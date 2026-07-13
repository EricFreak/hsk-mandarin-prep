import OpenAI from "openai";
import { z } from "zod";

export type WritingScoreResult = {
  score: number;
  grammarNotes: string[];
  vocabularyNotes: string[];
  suggestions: string[];
};

const writingScoreSchema = z.object({
  score: z.number().min(0).max(100),
  grammarNotes: z.array(z.string().min(1)),
  vocabularyNotes: z.array(z.string().min(1)),
  suggestions: z.array(z.string().min(1)),
});

export function parseWritingScore(json: unknown): WritingScoreResult {
  return writingScoreSchema.parse(json);
}

function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function buildMockScore(prompt: string, userText: string): WritingScoreResult {
  const seed = hashString(`${prompt}::${userText}`);
  const charCount = userText.trim().length;
  const hasChinese = /[\u4e00-\u9fff]/.test(userText);

  const lengthBonus = Math.min(20, Math.floor(charCount / 3));
  const baseScore = hasChinese ? 45 + (seed % 25) + lengthBonus : 20 + (seed % 15);
  const score = Math.min(95, Math.max(10, baseScore));

  return {
    score,
    grammarNotes: hasChinese
      ? [
          "Sentence structure is generally clear.",
          seed % 2 === 0
            ? "Watch particle placement (了, 的, 着) for natural flow."
            : "Consider using 因为…所以… to explain reasons more clearly.",
        ]
      : ["Response should be written primarily in Chinese characters."],
    vocabularyNotes: hasChinese
      ? [
          charCount >= 30
            ? "Good effort meeting the minimum length requirement."
            : "Try to expand your answer to meet the 30-character minimum.",
          "HSK 3 sport-related vocabulary (运动, 喜欢, 因为) would strengthen the response.",
        ]
      : ["Include HSK 3 vocabulary related to sports and hobbies."],
    suggestions: [
      "Add a specific example of when you do this sport.",
      "Explain your feelings using 觉得 or 因为 to connect ideas.",
      "Review HSK 3 grammar patterns for describing preferences.",
    ],
  };
}

function buildPrompt(examPrompt: string, userText: string): string {
  return `You are an HSK 3 Mandarin writing examiner. Score the student's response.

Exam prompt:
${examPrompt}

Student response:
${userText}

Return valid JSON with:
- score: integer 0-100 for HSK 3 writing quality (grammar, vocabulary, relevance, length)
- grammarNotes: array of 1-3 short English notes on grammar issues or strengths
- vocabularyNotes: array of 1-3 short English notes on vocabulary use
- suggestions: array of 2-4 actionable English suggestions to improve

Be constructive and specific to the student's text.`;
}

export async function scoreWriting(
  prompt: string,
  userText: string,
): Promise<WritingScoreResult> {
  const trimmed = userText.trim();
  if (!trimmed) {
    return {
      score: 0,
      grammarNotes: ["No response submitted."],
      vocabularyNotes: [],
      suggestions: ["Write your answer in Chinese before submitting for feedback."],
    };
  }

  const client = getOpenAIClient();
  if (!client) {
    return buildMockScore(prompt, trimmed);
  }

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You score HSK Mandarin writing responses. Respond with JSON only.",
        },
        {
          role: "user",
          content: buildPrompt(prompt, trimmed),
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return buildMockScore(prompt, trimmed);
    }

    return parseWritingScore(JSON.parse(content));
  } catch {
    return buildMockScore(prompt, trimmed);
  }
}
