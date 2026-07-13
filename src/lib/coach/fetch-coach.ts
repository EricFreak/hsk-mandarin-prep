import type { Plan } from "@/lib/entitlements";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  applyFreemiumReport,
  pickTodayTask,
} from "./freemium";
import { isCoachLLMConfigured } from "./llm";
import type {
  CoachPlanTaskRow,
  CoachReportRow,
  CoachStudyPlanRow,
} from "./types";
import { gateOrderedWeekTasks } from "./week-tasks";

export type CoachDashboardPayload = {
  plan: Plan;
  llmConfigured: boolean;
  status: "ready" | "pending" | "none";
  report: CoachReportRow | null;
  previousReport: CoachReportRow | null;
  studyPlan: CoachStudyPlanRow | null;
  tasks: CoachPlanTaskRow[];
  todayTask: CoachPlanTaskRow | null;
  hiddenTaskCount: number;
  executionLocked: boolean;
  tutoringWechatId: string | null;
};

export type CoachReportsPayload = {
  plan: Plan;
  reports: CoachReportRow[];
};

export type CoachPlanListItem = CoachStudyPlanRow & {
  taskTotal: number;
  taskDone: number;
  tasks: CoachPlanTaskRow[];
};

export type CoachPlansPayload = {
  plan: Plan;
  plans: CoachPlanListItem[];
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
    attempted_count:
      typeof row.attempted_count === "number" ? (row.attempted_count as number) : 0,
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
  const [{ data: reportRows }, { data: planRow }, { data: learnerProfile }] =
    await Promise.all([
      supabase
        .from("coach_reports")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(2),
      supabase
        .from("coach_study_plans")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active")
        .maybeSingle(),
      supabase
        .from("learner_profiles")
        .select("current_week_index")
        .eq("user_id", userId)
        .maybeSingle(),
    ]);

  const rows = (reportRows ?? []) as Record<string, unknown>[];
  const reportRow = rows[0] ?? null;
  const previousRow = rows[1] ?? null;

  let tasks: CoachPlanTaskRow[] = [];
  if (planRow?.id) {
    const { data: taskRows } = await supabase
      .from("coach_plan_tasks")
      .select("*")
      .eq("plan_id", planRow.id)
      .order("day_offset", { ascending: true });

    tasks = ((taskRows ?? []) as Record<string, unknown>[]).map(mapTask);
  }

  const report = reportRow ? applyFreemiumReport(mapReport(reportRow), userPlan) : null;
  const previousReport = previousRow
    ? applyFreemiumReport(mapReport(previousRow), userPlan)
    : null;
  const studyPlan = planRow ? mapPlan(planRow) : null;
  const topGapSkill = report?.gaps[0]?.skill ?? studyPlan?.focus_skills[0] ?? null;
  const planRowRecord = planRow as Record<string, unknown> | null;
  const weekIndex =
    typeof planRowRecord?.week_index === "number" ? planRowRecord.week_index : 1;
  const currentWeekIndex =
    typeof learnerProfile?.current_week_index === "number"
      ? learnerProfile.current_week_index
      : 1;
  const { tasks: gatedTasks, hiddenTaskCount, executionLocked } =
    gateOrderedWeekTasks(tasks, topGapSkill, userPlan, {
      weekIndex,
      currentWeekIndex,
    });
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
    previousReport,
    studyPlan,
    tasks: gatedTasks,
    todayTask,
    hiddenTaskCount,
    executionLocked,
    tutoringWechatId: process.env.TUTORING_WECHAT_ID ?? null,
  };
}

export async function fetchCoachReports(
  supabase: SupabaseClient,
  userId: string,
  userPlan: Plan,
  limit = 12,
): Promise<CoachReportsPayload> {
  const { data: reportRows } = await supabase
    .from("coach_reports")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  const reports = ((reportRows ?? []) as Record<string, unknown>[]).map((row) =>
    applyFreemiumReport(mapReport(row), userPlan),
  );

  return { plan: userPlan, reports };
}

export async function fetchCoachPlans(
  supabase: SupabaseClient,
  userId: string,
  userPlan: Plan,
): Promise<CoachPlansPayload> {
  const { data: planRows } = await supabase
    .from("coach_study_plans")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const plans: CoachPlanListItem[] = [];
  for (const row of (planRows ?? []) as Record<string, unknown>[]) {
    const studyPlan = mapPlan(row);
    const { data: taskRows } = await supabase
      .from("coach_plan_tasks")
      .select("*")
      .eq("plan_id", studyPlan.id)
      .order("day_offset", { ascending: true });

    const tasks = ((taskRows ?? []) as Record<string, unknown>[]).map(mapTask);
    plans.push({
      ...studyPlan,
      tasks,
      taskTotal: tasks.length,
      taskDone: tasks.filter((task) => task.status === "done").length,
    });
  }

  return { plan: userPlan, plans };
}
