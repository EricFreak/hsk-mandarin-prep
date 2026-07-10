import type { GeneratedReport, LearnerSnapshot } from "./types";
import { getCoachLLM, getCoachModel } from "./llm";
import { parseReportResponse } from "./schemas";

const REPORT_PROMPT_VERSION = 1;

const SYSTEM_PROMPT = `You are an HSK 3.0 Mandarin exam coach. Analyze ONLY the learner snapshot JSON provided.

Rules:
- Never invent scores, attempts, or skills not present in the snapshot.
- Reference HSK 3.0 skill names: listening, reading, writing, vocabulary, grammar.
- summaryMarkdown: 2-4 short paragraphs in English for the learner.
- strengths: cite evidence from snapshot data (mock scores, practice accuracy).
- gaps: order by severity; evidence must quote snapshot facts.
- readinessScore: 0-100 estimate for passing target HSK level soon.

Return valid JSON with keys:
readinessScore, summaryMarkdown, strengths, gaps, metrics`;

export function buildFallbackReport(snapshot: LearnerSnapshot): GeneratedReport {
  const latestMock = snapshot.mockExams[0];
  const gaps =
    latestMock?.weaknesses.map((w, index) => ({
      skill: w.skill,
      severity: (index === 0 ? "high" : index === 1 ? "medium" : "low") as
        | "low"
        | "medium"
        | "high",
      evidence: `${w.wrongCount} incorrect on latest mock exam (${latestMock.score}% score)`,
    })) ??
    snapshot.mistakeHotspots.slice(0, 3).map((hotspot, index) => ({
      skill: hotspot.skill,
      severity: (index === 0 ? "high" : "medium") as "low" | "medium" | "high",
      evidence: `${hotspot.count} incorrect practice answers in the last 30 days`,
    }));

  if (!gaps.length) {
    gaps.push({
      skill: "listening",
      severity: "medium",
      evidence: "Limited attempt data — complete more practice to refine this gap.",
    });
  }

  const topGap = gaps[0];
  const scoreText = latestMock
    ? `Your latest mock exam score is ${latestMock.score}%.`
    : "Complete a mock exam for a baseline score.";

  return {
    readinessScore: latestMock?.score ?? 50,
    summaryMarkdown: `${scoreText}\n\nYour coach recommends focusing on **${topGap.skill}** first. ${topGap.evidence}.\n\nFollow your weekly study plan for targeted practice sessions.`,
    strengths: Object.entries(snapshot.practiceLast30d.bySkill)
      .filter(([, stats]) => stats.answered >= 5 && stats.correct / stats.answered >= 0.8)
      .slice(0, 2)
      .map(([skill, stats]) => ({
        skill,
        evidence: `${Math.round((stats.correct / stats.answered) * 100)}% accuracy over ${stats.answered} questions in 30 days`,
      })),
    gaps,
    metrics: {
      latestMockScore: latestMock?.score ?? null,
      srsDueCount: snapshot.srsDueCount,
    },
  };
}

export async function generateReport(
  snapshot: LearnerSnapshot,
): Promise<{ report: GeneratedReport; model: string; tokenUsage: Record<string, unknown> | null }> {
  const client = getCoachLLM();
  const model = getCoachModel();

  if (!client) {
    return {
      report: buildFallbackReport(snapshot),
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
        content: JSON.stringify(snapshot),
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Empty coach report response");
  }

  const parsed = parseReportResponse(JSON.parse(content));

  return {
    report: {
      readinessScore: parsed.readinessScore,
      summaryMarkdown: parsed.summaryMarkdown,
      strengths: parsed.strengths,
      gaps: parsed.gaps,
      metrics: parsed.metrics ?? {},
    },
    model,
    tokenUsage: {
      provider: "deepseek",
      model,
      promptVersion: REPORT_PROMPT_VERSION,
      prompt_tokens: completion.usage?.prompt_tokens ?? null,
      completion_tokens: completion.usage?.completion_tokens ?? null,
      total_tokens: completion.usage?.total_tokens ?? null,
    },
  };
}

export { REPORT_PROMPT_VERSION };
