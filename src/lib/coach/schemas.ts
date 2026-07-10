import { z } from "zod";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

export function normalizeSeverity(value: unknown): "low" | "medium" | "high" {
  if (typeof value !== "string") return "medium";
  const normalized = value.trim().toLowerCase();
  if (normalized === "moderate" || normalized === "med") return "medium";
  if (normalized === "low" || normalized === "medium" || normalized === "high") {
    return normalized;
  }
  return "medium";
}

function normalizeStrengthItem(item: unknown) {
  if (typeof item === "string") {
    return { skill: item, evidence: `Strong performance in ${item}` };
  }
  const rec = asRecord(item);
  if (!rec) {
    return { skill: "general", evidence: String(item) };
  }
  const skill = String(rec.skill ?? rec.name ?? "general");
  return {
    skill,
    evidence: String(
      rec.evidence ?? rec.detail ?? rec.description ?? `Strength in ${skill}`,
    ),
  };
}

function normalizeGapItem(item: unknown) {
  if (typeof item === "string") {
    return {
      skill: item,
      severity: "medium" as const,
      evidence: `Needs improvement in ${item}`,
    };
  }
  const rec = asRecord(item);
  if (!rec) {
    return {
      skill: "general",
      severity: "medium" as const,
      evidence: String(item),
    };
  }
  const skill = String(rec.skill ?? rec.name ?? "general");
  return {
    skill,
    severity: normalizeSeverity(rec.severity),
    evidence: String(
      rec.evidence ?? rec.detail ?? rec.description ?? `Gap in ${skill}`,
    ),
    subtopics: Array.isArray(rec.subtopics)
      ? rec.subtopics.map((topic) => String(topic))
      : undefined,
  };
}

export function normalizeReportPayload(json: unknown): unknown {
  const rec = asRecord(json);
  if (!rec) return json;

  const readinessRaw = rec.readinessScore ?? rec.readiness_score ?? rec.readiness;
  const readinessScore =
    typeof readinessRaw === "number"
      ? readinessRaw
      : Number.parseInt(String(readinessRaw ?? ""), 10);

  const summaryMarkdown = String(
    rec.summaryMarkdown ?? rec.summary_markdown ?? rec.summary ?? "",
  );

  return {
    readinessScore: Number.isFinite(readinessScore) ? readinessScore : 50,
    summaryMarkdown,
    strengths: Array.isArray(rec.strengths)
      ? rec.strengths.map(normalizeStrengthItem)
      : [],
    gaps: Array.isArray(rec.gaps) ? rec.gaps.map(normalizeGapItem) : [],
    metrics: asRecord(rec.metrics) ?? {},
  };
}

function normalizePlanTask(item: unknown) {
  const rec = asRecord(item);
  if (!rec) {
    return {
      dayOffset: 0,
      taskType: "practice" as const,
      skill: null,
      targetCount: 15,
      title: String(item),
    };
  }

  const taskTypeRaw = String(rec.taskType ?? rec.task_type ?? "practice");
  const allowed = [
    "practice",
    "flashcards",
    "mock_section",
    "review_mistakes",
    "rest",
  ] as const;
  const taskType = allowed.includes(taskTypeRaw as (typeof allowed)[number])
    ? (taskTypeRaw as (typeof allowed)[number])
    : "practice";

  const targetRaw = rec.targetCount ?? rec.target_count;
  const targetCount =
    targetRaw === null || targetRaw === undefined
      ? null
      : Number.parseInt(String(targetRaw), 10);

  return {
    dayOffset: Number(rec.dayOffset ?? rec.day_offset ?? 0),
    taskType,
    skill:
      rec.skill === null || rec.skill === undefined
        ? null
        : String(rec.skill),
    targetCount: Number.isFinite(targetCount) ? targetCount : null,
    title: String(rec.title ?? "Study task"),
  };
}

export function normalizePlanPayload(json: unknown): unknown {
  const rec = asRecord(json);
  if (!rec) return json;

  const focusSkills = Array.isArray(rec.focusSkills)
    ? rec.focusSkills.map((skill) => String(skill))
    : Array.isArray(rec.focus_skills)
      ? rec.focus_skills.map((skill) => String(skill))
      : [];

  return {
    focusSkills,
    tasks: Array.isArray(rec.tasks) ? rec.tasks.map(normalizePlanTask) : [],
  };
}

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
  return reportResponseSchema.parse(normalizeReportPayload(json));
}

export function parsePlanResponse(json: unknown) {
  return planResponseSchema.parse(normalizePlanPayload(json));
}
