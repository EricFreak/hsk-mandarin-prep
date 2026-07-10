import type { Plan } from "@/lib/entitlements";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  applyFreemiumReport,
  applyFreemiumTasks,
  pickTodayTask,
} from "./freemium";
import { isCoachLLMConfigured } from "./llm";
import type {
  CoachPlanTaskRow,
  CoachReportRow,
  CoachStudyPlanRow,
} from "./types";

export type CoachDashboardPayload = {
  plan: Plan;
  llmConfigured: boolean;
  status: "ready" | "pending" | "none";
  report: CoachReportRow | null;
  studyPlan: CoachStudyPlanRow | null;
  tasks: CoachPlanTaskRow[];
  todayTask: CoachPlanTaskRow | null;
  hiddenTaskCount: number;
  tutoringWechatId: string | null;
};

function mapReport(row: Record<string, unknown>): CoachReportRow {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    trigger: row.trigger as CoachReportRow["trigger"],
    source_attempt_id: (row.source_attempt_id as string | null) ?? null,
    previous_report_id: (row.previous_report_id as string | null) ?? null,
    readiness_score: (row.readiness_score as number | null) ?? null,
    summary_markdown: row.summary_markdown as string,
    strengths: (row.strengths as CoachReportRow["strengths"]) ?? [],
    gaps: (row.gaps as CoachReportRow["gaps"]) ?? [],
    metrics: (row.metrics as Record<string, unknown>) ?? {},
    model: (row.model as string | null) ?? null,
    version: row.version as number,
    created_at: row.created_at as string,
  };
}

function mapPlan(row: Record<string, unknown>): CoachStudyPlanRow {
  return {
    id: row.id as string,
    user_id: row.user_id as string,
    report_id: row.report_id as string,
    status: row.status as CoachStudyPlanRow["status"],
    week_start: row.week_start as string,
    focus_skills: (row.focus_skills as string[]) ?? [],
    created_at: row.created_at as string,
  };
}

function mapTask(row: Record<string, unknown>): CoachPlanTaskRow {
  return {
    id: row.id as string,
    plan_id: row.plan_id as string,
    user_id: row.user_id as string,
    day_offset: row.day_offset as number,
    task_type: row.task_type as CoachPlanTaskRow["task_type"],
    skill: (row.skill as string | null) ?? null,
    target_count: (row.target_count as number | null) ?? null,
    title: row.title as string,
    status: row.status as CoachPlanTaskRow["status"],
    completed_at: (row.completed_at as string | null) ?? null,
  };
}

export async function fetchCoachDashboard(
  supabase: SupabaseClient,
  userId: string,
  userPlan: Plan,
): Promise<CoachDashboardPayload> {
  const [{ data: reportRow }, { data: planRow }] = await Promise.all([
    supabase
      .from("coach_reports")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("coach_study_plans")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle(),
  ]);

  let tasks: CoachPlanTaskRow[] = [];
  if (planRow?.id) {
    const { data: taskRows } = await supabase
      .from("coach_plan_tasks")
      .select("*")
      .eq("plan_id", planRow.id)
      .order("day_offset", { ascending: true });

    tasks = ((taskRows ?? []) as Record<string, unknown>[]).map(mapTask);
  }

  const fullTasks = tasks;
  const gatedTasks = applyFreemiumTasks(fullTasks, userPlan);
  const report = reportRow ? applyFreemiumReport(mapReport(reportRow), userPlan) : null;
  const studyPlan = planRow ? mapPlan(planRow) : null;
  const todayTask = studyPlan ? pickTodayTask(gatedTasks, studyPlan.week_start) : null;

  let status: CoachDashboardPayload["status"] = "none";
  if (report) {
    status = "ready";
  }

  const { count: pendingRuns } = await supabase
    .from("mock_exam_attempts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (!report && (pendingRuns ?? 0) > 0) {
    status = "pending";
  }

  return {
    plan: userPlan,
    llmConfigured: isCoachLLMConfigured(),
    status,
    report,
    studyPlan,
    tasks: gatedTasks,
    todayTask,
    hiddenTaskCount: Math.max(0, fullTasks.length - gatedTasks.length),
    tutoringWechatId: process.env.TUTORING_WECHAT_ID ?? null,
  };
}
