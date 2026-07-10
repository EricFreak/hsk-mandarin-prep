import type { SupabaseClient } from "@supabase/supabase-js";
import { buildSnapshot, ensureLearnerProfile } from "./build-snapshot";
import { generatePlan } from "./generate-plan";
import { generateReport, REPORT_PROMPT_VERSION } from "./generate-report";
import type { CoachTrigger } from "./types";

export type RunCoachInput = {
  userId: string;
  trigger: CoachTrigger;
  sourceAttemptId?: string;
};

export type RunCoachResult =
  | { ok: true; reportId: string; planId: string; alreadyExists?: boolean }
  | { ok: false; error: string; status: number };

function weekStartDate(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export async function runCoach(
  supabase: SupabaseClient,
  input: RunCoachInput,
): Promise<RunCoachResult> {
  const started = Date.now();

  if (input.sourceAttemptId) {
    const { data: existing } = await supabase
      .from("coach_reports")
      .select("id")
      .eq("source_attempt_id", input.sourceAttemptId)
      .maybeSingle();

    if (existing?.id) {
      const { data: plan } = await supabase
        .from("coach_study_plans")
        .select("id")
        .eq("report_id", existing.id)
        .maybeSingle();

      return {
        ok: true,
        reportId: existing.id,
        planId: plan?.id ?? "",
        alreadyExists: true,
      };
    }
  }

  if (input.trigger === "manual_refresh") {
    const since = new Date();
    since.setHours(since.getHours() - 24);
    const { data: recent } = await supabase
      .from("coach_reports")
      .select("id")
      .eq("user_id", input.userId)
      .eq("trigger", "manual_refresh")
      .gte("created_at", since.toISOString())
      .maybeSingle();

    if (recent?.id) {
      return { ok: false, error: "refresh_rate_limited", status: 429 };
    }
  }

  await ensureLearnerProfile(supabase, input.userId);
  const snapshot = await buildSnapshot(supabase, input.userId);

  let reportResult;
  let planResult;
  let runError: string | null = null;

  try {
    reportResult = await generateReport(snapshot);
    planResult = await generatePlan(snapshot, reportResult.report);
  } catch (err) {
    runError = err instanceof Error ? err.message : "Coach generation failed";
    return { ok: false, error: runError, status: 503 };
  }

  const { data: reportRow, error: reportError } = await supabase
    .from("coach_reports")
    .insert({
      user_id: input.userId,
      trigger: input.trigger,
      source_attempt_id: input.sourceAttemptId ?? null,
      previous_report_id: snapshot.previousReportId ?? null,
      readiness_score: reportResult.report.readinessScore,
      summary_markdown: reportResult.report.summaryMarkdown,
      strengths: reportResult.report.strengths,
      gaps: reportResult.report.gaps,
      metrics: reportResult.report.metrics,
      model: reportResult.model,
      version: REPORT_PROMPT_VERSION,
    })
    .select("id")
    .single();

  if (reportError || !reportRow) {
    return {
      ok: false,
      error: reportError?.message ?? "Failed to save coach report",
      status: 500,
    };
  }

  await supabase
    .from("coach_study_plans")
    .update({ status: "superseded" })
    .eq("user_id", input.userId)
    .eq("status", "active");

  const { data: planRow, error: planError } = await supabase
    .from("coach_study_plans")
    .insert({
      user_id: input.userId,
      report_id: reportRow.id,
      status: "active",
      week_start: weekStartDate(),
      focus_skills: planResult.plan.focusSkills,
    })
    .select("id")
    .single();

  if (planError || !planRow) {
    return {
      ok: false,
      error: planError?.message ?? "Failed to save study plan",
      status: 500,
    };
  }

  const taskRows = planResult.plan.tasks.map((task) => ({
    plan_id: planRow.id,
    user_id: input.userId,
    day_offset: task.dayOffset,
    task_type: task.taskType,
    skill: task.skill,
    target_count: task.targetCount,
    title: task.title,
    status: "pending",
  }));

  const { error: tasksError } = await supabase.from("coach_plan_tasks").insert(taskRows);

  if (tasksError) {
    return { ok: false, error: tasksError.message, status: 500 };
  }

  const tokenUsage = {
    report: reportResult.tokenUsage,
    plan: planResult.tokenUsage,
  };

  await supabase.from("coach_runs").insert({
    user_id: input.userId,
    report_id: reportRow.id,
    plan_id: planRow.id,
    trigger: input.trigger,
    source_attempt_id: input.sourceAttemptId ?? null,
    input_snapshot: snapshot,
    token_usage: tokenUsage,
    latency_ms: Date.now() - started,
    error: runError,
  });

  return { ok: true, reportId: reportRow.id, planId: planRow.id };
}
