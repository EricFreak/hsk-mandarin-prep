import type { SupabaseClient } from "@supabase/supabase-js";

export type SeedJourneyOptions = {
  currentWeekIndex?: number;
  planWeekIndex?: number;
  taskCount?: number;
  allTasksDone?: boolean;
};

export type SeedJourneyResult = {
  reportId: string;
  planId: string;
  week2Theme: string;
};

const WEEK2_THEME = "Grammar focus · Vocabulary support";

export async function resetCoachJourney(
  admin: SupabaseClient,
  userId: string,
): Promise<void> {
  const { data: plans } = await admin
    .from("coach_study_plans")
    .select("id")
    .eq("user_id", userId);

  const planIds = (plans ?? []).map((row) => row.id as string);
  if (planIds.length > 0) {
    await admin.from("coach_plan_tasks").delete().in("plan_id", planIds);
  }

  await admin.from("coach_study_plans").delete().eq("user_id", userId);
  await admin.from("coach_reports").delete().eq("user_id", userId);
  await admin.from("coach_runs").delete().eq("user_id", userId);
  await admin.from("journey_week_outlines").delete().eq("user_id", userId);
}

export async function seedJourneyCoachState(
  admin: SupabaseClient,
  userId: string,
  options: SeedJourneyOptions = {},
): Promise<SeedJourneyResult> {
  const currentWeekIndex = options.currentWeekIndex ?? 1;
  const planWeekIndex = options.planWeekIndex ?? currentWeekIndex;
  const taskCount = options.taskCount ?? 4;
  const examDate = "2026-09-07";

  const { error: profileError } = await admin.from("learner_profiles").upsert({
    user_id: userId,
    target_level: 3,
    target_exam_date: examDate,
    journey_horizon_weeks: 12,
    current_week_index: currentWeekIndex,
    current_stage: "foundation",
    journey_started_at: new Date().toISOString(),
    stage_calendar: [],
  });
  if (profileError) {
    throw new Error(`learner_profiles upsert: ${profileError.message}`);
  }

  const outlineRows = [
    {
      user_id: userId,
      week_index: 1,
      stage: "foundation",
      theme: "Vocabulary focus · Grammar support",
      skill_focus: ["vocabulary", "grammar"],
      status: currentWeekIndex === 1 ? "available" : "passed",
    },
    {
      user_id: userId,
      week_index: 2,
      stage: "foundation",
      theme: WEEK2_THEME,
      skill_focus: ["grammar", "vocabulary"],
      status: currentWeekIndex >= 2 ? "available" : "locked",
    },
    {
      user_id: userId,
      week_index: 3,
      stage: "skills",
      theme: "Listening focus · Reading support",
      skill_focus: ["listening", "reading"],
      status: "locked",
    },
  ];

  for (const row of outlineRows) {
    const { error } = await admin.from("journey_week_outlines").upsert(row, {
      onConflict: "user_id,week_index",
    });
    if (error) throw new Error(`journey_week_outlines upsert: ${error.message}`);
  }

  const { data: report, error: reportError } = await admin
    .from("coach_reports")
    .insert({
      user_id: userId,
      trigger: "mock_exam_completed",
      summary_markdown: "E2E seed coach report.\n\nExtra detail for pro users.",
      strengths: [{ skill: "vocabulary", evidence: "Strong retention" }],
      gaps: [{ skill: "listening", severity: "high", evidence: "Low mock score" }],
      readiness_score: 55,
      version: 1,
    })
    .select("id")
    .single();

  if (reportError || !report) {
    throw new Error(`coach_reports insert: ${reportError?.message ?? "no row"}`);
  }

  const weekStart = new Date().toISOString().slice(0, 10);
  const { data: plan, error: planError } = await admin
    .from("coach_study_plans")
    .insert({
      user_id: userId,
      report_id: report.id,
      status: "active",
      week_start: weekStart,
      focus_skills: ["listening", "vocabulary"],
      week_index: planWeekIndex,
      stage: "foundation",
    })
    .select("id")
    .single();

  if (planError || !plan) {
    throw new Error(`coach_study_plans insert: ${planError?.message ?? "no row"}`);
  }

  const taskDefs = [
    { title: "Vocabulary review", skill: "vocabulary", task_type: "practice" },
    { title: "Listening drills", skill: "listening", task_type: "practice" },
    { title: "Grammar practice", skill: "grammar", task_type: "practice" },
    { title: "Writing sample", skill: "writing", task_type: "practice" },
    { title: "Reading passage", skill: "reading", task_type: "practice" },
    { title: "Flashcard sprint", skill: "vocabulary", task_type: "flashcards" },
  ] as const;

  const tasks = Array.from({ length: taskCount }, (_, index) => {
    const def = taskDefs[index] ?? {
      title: `Task ${index + 1}`,
      skill: "listening",
      task_type: "practice" as const,
    };
    return {
      plan_id: plan.id,
      user_id: userId,
      day_offset: index,
      task_type: def.task_type,
      skill: def.skill,
      title: def.title,
      status:
        options.allTasksDone && planWeekIndex === 1 ? "done" : ("pending" as const),
      required: true,
    };
  });

  const { error: taskError } = await admin.from("coach_plan_tasks").insert(tasks);
  if (taskError) throw new Error(`coach_plan_tasks insert: ${taskError.message}`);

  return { reportId: report.id, planId: plan.id, week2Theme: WEEK2_THEME };
}
