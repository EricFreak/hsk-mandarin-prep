import type { SupabaseClient } from "@supabase/supabase-js";
import { allocateStages, stageAtDate } from "./allocate-stages";
import { buildWeekOutline } from "./build-outline";
import { stageQuotas, reweightQuotas } from "./stage-quotas";
import { nextWeekAfterClear } from "./week-unlock";
import type { JourneyStageId, StageWindow, WeekOutlineRow } from "./types";
import { buildSnapshot } from "../build-snapshot";
import { generatePlan } from "../generate-plan";
import type { GeneratedReport } from "../types";

export type JourneyGap = { skill: string; severity: "low" | "medium" | "high" };

export type PlanTaskForClearance = {
  task_type: string;
  status: string;
  mastery_status?: string | null;
  required?: boolean | null;
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function parseStageCalendar(value: unknown): StageWindow[] {
  if (!value) return [];
  if (Array.isArray(value)) return value as StageWindow[];
  if (typeof value === "object" && Object.keys(value as object).length === 0) return [];
  return [];
}

function mapOutlineRow(row: {
  week_index: number;
  stage: JourneyStageId;
  theme: string;
  skill_focus: string[];
  status: WeekOutlineRow["status"];
}): WeekOutlineRow {
  return {
    weekIndex: row.week_index,
    stage: row.stage,
    theme: row.theme,
    skillFocus: row.skill_focus ?? [],
    status: row.status,
  };
}

export function isTaskCleared(task: PlanTaskForClearance): boolean {
  if (task.required === false) return true;

  if (task.task_type === "rest") {
    return (
      task.status === "done" ||
      task.mastery_status === "passed" ||
      task.mastery_status === "challenged"
    );
  }

  const mastery = task.mastery_status;
  if (mastery === "passed" || mastery === "challenged") return true;
  if (!mastery && task.status === "done") return true;
  return false;
}

export function isWeekCleared(tasks: PlanTaskForClearance[]): boolean {
  const required = tasks.filter((t) => t.required !== false);
  if (!required.length) return false;
  return required.every(isTaskCleared);
}

type LearnerJourneyProfile = {
  target_exam_date?: string | null;
  journey_horizon_weeks?: number | null;
  current_week_index?: number | null;
  current_stage?: JourneyStageId | null;
  stage_calendar?: unknown;
  journey_started_at?: string | null;
};

async function loadLearnerJourneyProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<LearnerJourneyProfile | null> {
  try {
    const { data, error } = await supabase
      .from("learner_profiles")
      .select(
        "target_exam_date, journey_horizon_weeks, current_week_index, current_stage, stage_calendar, journey_started_at",
      )
      .eq("user_id", userId)
      .maybeSingle();

    if (error) return null;
    return (data ?? null) as LearnerJourneyProfile | null;
  } catch {
    return null;
  }
}

async function loadOutlineRows(
  supabase: SupabaseClient,
  userId: string,
): Promise<WeekOutlineRow[]> {
  try {
    const { data, error } = await supabase
      .from("journey_week_outlines")
      .select("week_index, stage, theme, skill_focus, status")
      .eq("user_id", userId)
      .order("week_index", { ascending: true });

    if (error || !data?.length) return [];
    return data.map((row) =>
      mapOutlineRow(
        row as {
          week_index: number;
          stage: JourneyStageId;
          theme: string;
          skill_focus: string[];
          status: WeekOutlineRow["status"];
        },
      ),
    );
  } catch {
    return [];
  }
}

async function upsertOutlines(
  supabase: SupabaseClient,
  userId: string,
  outline: WeekOutlineRow[],
): Promise<boolean> {
  try {
    const rows = outline.map((w) => ({
      user_id: userId,
      week_index: w.weekIndex,
      stage: w.stage,
      theme: w.theme,
      skill_focus: w.skillFocus,
      status: w.status,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from("journey_week_outlines")
      .upsert(rows, { onConflict: "user_id,week_index" });

    return !error;
  } catch {
    return false;
  }
}

export async function ensureJourney(
  supabase: SupabaseClient,
  userId: string,
  input: { gaps: JourneyGap[]; today?: string },
): Promise<{
  currentWeekIndex: number;
  currentStage: JourneyStageId;
  stageCalendar: StageWindow[];
  outline: WeekOutlineRow[];
}> {
  const profile = await loadLearnerJourneyProfile(supabase, userId);
  const existingOutline = await loadOutlineRows(supabase, userId);
  const stageCalendar = parseStageCalendar(profile?.stage_calendar);

  const needsInit =
    !existingOutline.length ||
    !stageCalendar.length;

  if (!needsInit) {
    return {
      currentWeekIndex: profile?.current_week_index ?? 1,
      currentStage: profile?.current_stage ?? existingOutline[0]?.stage ?? "diagnose",
      stageCalendar,
      outline: existingOutline,
    };
  }

  const today = input.today ?? todayIso();
  const examDate = profile?.target_exam_date ?? null;
  const stages = allocateStages({
    today,
    examDate,
    defaultHorizonWeeks: profile?.journey_horizon_weeks ?? 12,
  });
  const outline = buildWeekOutline({ stages, today, gaps: input.gaps });

  const persisted = await upsertOutlines(supabase, userId, outline);
  const currentStage = stageAtDate(stages, today);

  if (persisted) {
    try {
      await supabase
        .from("learner_profiles")
        .update({
          stage_calendar: stages,
          current_stage: currentStage,
          current_week_index: 1,
          journey_started_at: new Date().toISOString(),
        })
        .eq("user_id", userId);
    } catch {
      // Journey columns may be missing before migration 008.
    }
  }

  return {
    currentWeekIndex: 1,
    currentStage,
    stageCalendar: stages,
    outline,
  };
}

export async function clearWeekAndUnlockNext(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ advanced: boolean; newWeekIndex?: number }> {
  const profile = await loadLearnerJourneyProfile(supabase, userId);
  const currentWeekIndex = profile?.current_week_index ?? 1;

  let activePlan: { id: string; week_index?: number | null } | null = null;
  try {
    const { data } = await supabase
      .from("coach_study_plans")
      .select("id, week_index")
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle();
    activePlan = data;
  } catch {
    return { advanced: false };
  }

  if (!activePlan?.id) return { advanced: false };

  let tasks: PlanTaskForClearance[] = [];
  try {
    const { data } = await supabase
      .from("coach_plan_tasks")
      .select("task_type, status, mastery_status, required")
      .eq("plan_id", activePlan.id);
    tasks = (data ?? []) as PlanTaskForClearance[];
  } catch {
    try {
      const { data } = await supabase
        .from("coach_plan_tasks")
        .select("task_type, status")
        .eq("plan_id", activePlan.id);
      tasks = (data ?? []) as PlanTaskForClearance[];
    } catch {
      return { advanced: false };
    }
  }

  if (!isWeekCleared(tasks)) return { advanced: false };

  const newWeekIndex = nextWeekAfterClear(currentWeekIndex);

  try {
    await supabase
      .from("journey_week_outlines")
      .update({ status: "passed", updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("week_index", currentWeekIndex);
  } catch {
    // Outline table may be missing.
  }

  try {
    await supabase
      .from("journey_week_outlines")
      .update({ status: "available", updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("week_index", newWeekIndex);
  } catch {
    // Outline table may be missing.
  }

  const outline = await loadOutlineRows(supabase, userId);
  const nextWeek = outline.find((w) => w.weekIndex === newWeekIndex);
  const nextStage = nextWeek?.stage ?? profile?.current_stage ?? "foundation";

  try {
    await supabase
      .from("learner_profiles")
      .update({
        current_week_index: newWeekIndex,
        current_stage: nextStage,
      })
      .eq("user_id", userId);
  } catch {
    return { advanced: false };
  }

  return { advanced: true, newWeekIndex };
}

export async function materializeWeekPlan(
  supabase: SupabaseClient,
  userId: string,
  weekIndex: number,
): Promise<{ ok: true; planId: string } | { ok: false; error: string }> {
  const snapshot = await buildSnapshot(supabase, userId);

  let reportRow: { id: string; gaps: GeneratedReport["gaps"] } | null = null;
  try {
    const { data, error } = await supabase
      .from("coach_reports")
      .select("id, gaps")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error || !data) {
      return { ok: false, error: "no_report" };
    }
    reportRow = data as { id: string; gaps: GeneratedReport["gaps"] };
  } catch {
    return { ok: false, error: "no_report" };
  }

  const outline = await loadOutlineRows(supabase, userId);
  const weekOutline = outline.find((w) => w.weekIndex === weekIndex);
  const stage: JourneyStageId =
    weekOutline?.stage ??
    (await loadLearnerJourneyProfile(supabase, userId))?.current_stage ??
    "foundation";

  const gaps = (reportRow.gaps ?? []).map((g) => ({
    skill: g.skill,
    severity: g.severity,
  }));

  const skillQuotas = reweightQuotas(stageQuotas(stage), gaps);
  const journeyContext = { stage, skillQuotas };

  const report: GeneratedReport = {
    readinessScore: 0,
    summaryMarkdown: "",
    strengths: [],
    gaps: reportRow.gaps ?? [],
    metrics: {},
  };

  let planResult;
  try {
    planResult = await generatePlan(snapshot, report, journeyContext);
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "plan_generation_failed",
    };
  }

  try {
    await supabase
      .from("coach_study_plans")
      .update({ status: "superseded" })
      .eq("user_id", userId)
      .eq("status", "active");
  } catch {
    // Continue even if supersede fails.
  }

  const weekStart = new Date().toISOString().slice(0, 10);
  let planRow: { id: string } | null = null;

  try {
    const insertPayload: Record<string, unknown> = {
      user_id: userId,
      report_id: reportRow.id,
      status: "active",
      week_start: weekStart,
      focus_skills: planResult.plan.focusSkills,
    };
    insertPayload.week_index = weekIndex;
    insertPayload.stage = stage;

    const { data, error } = await supabase
      .from("coach_study_plans")
      .insert(insertPayload)
      .select("id")
      .single();

    if (error || !data) {
      return { ok: false, error: error?.message ?? "plan_insert_failed" };
    }
    planRow = data;
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "plan_insert_failed",
    };
  }

  const taskRows = planResult.plan.tasks.map((task) => ({
    plan_id: planRow!.id,
    user_id: userId,
    day_offset: task.dayOffset,
    task_type: task.taskType,
    skill: task.skill,
    target_count: task.targetCount,
    title: task.title,
    status: "pending",
  }));

  try {
    const { error } = await supabase.from("coach_plan_tasks").insert(taskRows);
    if (error) return { ok: false, error: error.message };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "task_insert_failed",
    };
  }

  return { ok: true, planId: planRow.id };
}
