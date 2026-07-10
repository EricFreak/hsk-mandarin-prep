import { z } from "zod";

const strengthSchema = z.object({
  skill: z.string().min(1),
  evidence: z.string().min(1),
});

const gapSchema = z.object({
  skill: z.string().min(1),
  severity: z.enum(["low", "medium", "high"]),
  evidence: z.string().min(1),
  subtopics: z.array(z.string()).optional(),
});

export const reportResponseSchema = z.object({
  readinessScore: z.number().int().min(0).max(100),
  summaryMarkdown: z.string().min(1),
  strengths: z.array(strengthSchema),
  gaps: z.array(gapSchema).min(1),
  metrics: z.record(z.string(), z.unknown()).optional().default({}),
});

export const planTaskSchema = z.object({
  dayOffset: z.number().int().min(0).max(6),
  taskType: z.enum([
    "practice",
    "flashcards",
    "mock_section",
    "review_mistakes",
    "rest",
  ]),
  skill: z.string().nullable(),
  targetCount: z.number().int().positive().nullable(),
  title: z.string().min(1),
});

export const planResponseSchema = z.object({
  focusSkills: z.array(z.string().min(1)).min(1),
  tasks: z.array(planTaskSchema).min(3).max(14),
});

export function parseReportResponse(json: unknown) {
  return reportResponseSchema.parse(json);
}

export function parsePlanResponse(json: unknown) {
  return planResponseSchema.parse(json);
}
