import type { GeneratedPlan, GeneratedReport, LearnerSnapshot } from "./types";
import { getCoachLLM, getCoachModel } from "./llm";
import { parsePlanResponse } from "./schemas";

const PLAN_PROMPT_VERSION = 1;

const SYSTEM_PROMPT = `You are an HSK 3.0 study plan coach. Build a 7-day plan from the learner snapshot and assessment report.

Rules:
- focusSkills: ordered list of 1-3 skills to prioritize from report gaps.
- tasks: 7-10 actionable tasks across dayOffset 0-6.
- taskType: practice | flashcards | mock_section | review_mistakes | rest
- targetCount: number of questions/items when relevant (e.g. 15 for practice).
- Include at least one rest day.
- Titles should be specific and motivating in English.

Return valid JSON with keys: focusSkills, tasks`;

export function buildFallbackPlan(
  snapshot: LearnerSnapshot,
  report: GeneratedReport,
): GeneratedPlan {
  const focusSkills = report.gaps.slice(0, 2).map((gap) => gap.skill);
  if (!focusSkills.length) {
    focusSkills.push("listening");
  }

  const primary = focusSkills[0];
  const secondary = focusSkills[1] ?? "vocabulary";
  const minutes = snapshot.minutesPerDay ?? 20;
  const questionCount = minutes >= 30 ? 20 : 15;

  const tasks: GeneratedPlan["tasks"] = [
    {
      dayOffset: 0,
      taskType: "practice",
      skill: primary,
      targetCount: questionCount,
      title: `Practice ${primary}: targeted drills`,
    },
    {
      dayOffset: 1,
      taskType: "flashcards",
      skill: secondary,
      targetCount: 20,
      title: `Review ${secondary} flashcards`,
    },
    {
      dayOffset: 2,
      taskType: "practice",
      skill: primary,
      targetCount: questionCount,
      title: `${primary} listening patterns`,
    },
    {
      dayOffset: 3,
      taskType: "review_mistakes",
      skill: null,
      targetCount: 10,
      title: "Review mistake bank",
    },
    {
      dayOffset: 4,
      taskType: "practice",
      skill: secondary,
      targetCount: questionCount,
      title: `${secondary} reinforcement`,
    },
    {
      dayOffset: 5,
      taskType: "mock_section",
      skill: primary,
      targetCount: 1,
      title: `Mini mock: ${primary} section`,
    },
    {
      dayOffset: 6,
      taskType: "rest",
      skill: null,
      targetCount: null,
      title: "Rest and light review",
    },
  ];

  return { focusSkills, tasks };
}

export async function generatePlan(
  snapshot: LearnerSnapshot,
  report: GeneratedReport,
): Promise<{ plan: GeneratedPlan; model: string; tokenUsage: Record<string, unknown> | null }> {
  const client = getCoachLLM();
  const model = getCoachModel();

  if (!client) {
    return {
      plan: buildFallbackPlan(snapshot, report),
      model: "fallback",
      tokenUsage: null,
    };
  }

  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: JSON.stringify({ snapshot, report }),
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.4,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Empty coach plan response");
  }

  const parsed = parsePlanResponse(JSON.parse(content));

  return {
    plan: {
      focusSkills: parsed.focusSkills,
      tasks: parsed.tasks.map((task) => ({
        dayOffset: task.dayOffset,
        taskType: task.taskType,
        skill: task.skill,
        targetCount: task.targetCount,
        title: task.title,
      })),
    },
    model,
    tokenUsage: {
      provider: "deepseek",
      model,
      promptVersion: PLAN_PROMPT_VERSION,
      prompt_tokens: completion.usage?.prompt_tokens ?? null,
      completion_tokens: completion.usage?.completion_tokens ?? null,
      total_tokens: completion.usage?.total_tokens ?? null,
    },
  };
}

export { PLAN_PROMPT_VERSION };
