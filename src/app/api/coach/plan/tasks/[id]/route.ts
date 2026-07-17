import { getAuthenticatedCoachUser } from "@/lib/coach/api-auth";
import { clearWeekAndUnlockNext } from "@/lib/coach/journey/persist-journey";
import { canExecuteTask } from "@/lib/lp/access";
import { selectTasterTaskIds } from "@/lib/lp/sample-taste";
import { fetchAccess } from "@/lib/lp/access-server";
import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const DEFAULT_TARGET = 10;

const patchSchema = z.object({
  status: z.enum(["done", "skipped", "pending"]).optional(),
  mastery_status: z.enum(["not_yet", "passed", "challenged"]).optional(),
  mastery_score: z.number().min(0).max(10).nullable().optional(),
  /** Increment practice progress by this many answered questions (usually 1). */
  incrementAttempted: z.number().int().min(1).max(20).optional(),
  attemptedCount: z.number().int().min(0).optional(),
});

type RouteContext = {
  params: { id: string };
};

function mapTask(row: Record<string, unknown>) {
  const target =
    typeof row.target_count === "number" && row.target_count > 0
      ? row.target_count
      : DEFAULT_TARGET;
  const attempted =
    typeof row.attempted_count === "number" ? row.attempted_count : 0;
  return {
    id: row.id as string,
    title: row.title as string,
    skill: (row.skill as string | null) ?? null,
    task_type: row.task_type as string,
    status: row.status as string,
    target_count: target,
    attempted_count: attempted,
    completed_at: (row.completed_at as string | null) ?? null,
    mastery_status: (row.mastery_status as string | null) ?? null,
    mastery_score:
      typeof row.mastery_score === "number" ? row.mastery_score : null,
  };
}

export async function GET(_request: Request, context: RouteContext) {
  const auth = await getAuthenticatedCoachUser();
  if ("error" in auth) return auth.error;

  const { supabase, user } = auth;
  const taskId = context.params.id;

  const { data, error } = await supabase
    .from("coach_plan_tasks")
    .select(
      "id, title, skill, task_type, status, target_count, completed_at, mastery_status, mastery_score",
    )
    .eq("id", taskId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Coach task GET failed:", error);
    return NextResponse.json({ error: "Failed to load task" }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  // attempted_count may be missing until migration 007 is applied
  const { data: withProgress } = await supabase
    .from("coach_plan_tasks")
    .select("attempted_count")
    .eq("id", taskId)
    .eq("user_id", user.id)
    .maybeSingle();

  return NextResponse.json({
    task: mapTask({
      ...(data as Record<string, unknown>),
      attempted_count: withProgress?.attempted_count ?? 0,
    }),
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await getAuthenticatedCoachUser();
  if ("error" in auth) return auth.error;

  const { supabase, user } = auth;
  const taskId = context.params.id;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { data: existing, error: loadError } = await supabase
    .from("coach_plan_tasks")
    .select(
      "id, title, skill, task_type, status, target_count, completed_at, mastery_status, mastery_score, plan_id, day_offset",
    )
    .eq("id", taskId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (loadError) {
    console.error("Coach task PATCH load failed:", loadError);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }

  if (!existing) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  // Gate execution by access: free users may only update taster tasks
  // (cross-skill sample in week 1). Enforced server-side so locked tasks
  // cannot be completed via API.
  const existingRow = existing as Record<string, unknown>;
  const planId = existingRow.plan_id as string;
  let weekIndex = 1;
  try {
    const { data: planRow } = await supabase
      .from("coach_study_plans")
      .select("week_index")
      .eq("id", planId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (typeof planRow?.week_index === "number") weekIndex = planRow.week_index;
  } catch {
    // Default to week 1 if the plan lookup fails.
  }

  const { data: weekTaskRows } = await supabase
    .from("coach_plan_tasks")
    .select("id, skill, day_offset, task_type")
    .eq("plan_id", planId)
    .eq("user_id", user.id);

  const tasterTaskIds = selectTasterTaskIds(
    ((weekTaskRows ?? []) as {
      id: string;
      skill: string | null;
      day_offset: number;
      task_type: string;
    }[]).map((row) => ({
      id: row.id,
      skill: row.skill,
      day_offset: row.day_offset,
      task_type: row.task_type,
    })),
  );

  const access = await fetchAccess(supabase, user.id);
  if (
    !canExecuteTask({
      access,
      weekIndex,
      taskId,
      tasterTaskIds,
    })
  ) {
    return NextResponse.json({ error: "quote_required" }, { status: 402 });
  }

  const { data: progressRow } = await supabase
    .from("coach_plan_tasks")
    .select("attempted_count")
    .eq("id", taskId)
    .eq("user_id", user.id)
    .maybeSingle();

  const row = {
    ...(existing as Record<string, unknown>),
    attempted_count:
      (progressRow as { attempted_count?: number } | null)?.attempted_count ?? 0,
  } as Record<string, unknown>;
  const taskType = row.task_type as string;
  let attempted =
    typeof row.attempted_count === "number" ? row.attempted_count : 0;

  if (typeof parsed.data.attemptedCount === "number") {
    attempted = parsed.data.attemptedCount;
  } else if (typeof parsed.data.incrementAttempted === "number") {
    attempted += parsed.data.incrementAttempted;
  }

  const status =
    (parsed.data.status as string | undefined) ?? (row.status as string);
  const masteryStatus =
    parsed.data.mastery_status ??
    ((row.mastery_status as string | null) ?? undefined);

  if (status === "done" && taskType !== "rest") {
    if (masteryStatus !== "passed" && masteryStatus !== "challenged") {
      return NextResponse.json(
        { error: "Mastery required before marking done" },
        { status: 400 },
      );
    }
  }

  const completedAt =
    status === "done"
      ? ((row.completed_at as string | null) ?? new Date().toISOString())
      : null;

  const updatePayload: Record<string, unknown> = {
    status,
    completed_at: completedAt,
    attempted_count: attempted,
  };

  if (parsed.data.mastery_status !== undefined) {
    updatePayload.mastery_status = parsed.data.mastery_status;
  }
  if (parsed.data.mastery_score !== undefined) {
    updatePayload.mastery_score = parsed.data.mastery_score;
  }

  const { data, error } = await supabase
    .from("coach_plan_tasks")
    .update(updatePayload)
    .eq("id", taskId)
    .eq("user_id", user.id)
    .select(
      "id, title, skill, task_type, status, target_count, attempted_count, completed_at, mastery_status, mastery_score",
    )
    .maybeSingle();

  if (error) {
    console.error("Coach task PATCH failed:", error);
    // If column missing (migration not applied), fall back to status-only update
    if (
      String(error.message ?? "").includes("attempted_count") ||
      String(error.message ?? "").includes("mastery_")
    ) {
      const fallbackPayload: Record<string, unknown> = {
        status,
        completed_at: completedAt,
      };
      const { data: fallback, error: fallbackError } = await supabase
        .from("coach_plan_tasks")
        .update(fallbackPayload)
        .eq("id", taskId)
        .eq("user_id", user.id)
        .select("id, title, skill, task_type, status, target_count, completed_at")
        .maybeSingle();

      if (fallbackError || !fallback) {
        return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
      }

      return NextResponse.json({
        ok: true,
        task: mapTask({
          ...fallback,
          attempted_count: attempted,
          mastery_status: parsed.data.mastery_status ?? null,
          mastery_score: parsed.data.mastery_score ?? null,
        } as Record<string, unknown>),
        migrationWarning: "journey columns missing — apply migration 008",
      });
    }
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  let journeyAdvanced: { advanced: boolean; newWeekIndex?: number } | undefined;
  if (status === "done") {
    try {
      journeyAdvanced = await clearWeekAndUnlockNext(supabase, user.id);
    } catch (err) {
      console.error("Coach task journey advance failed:", err);
    }
  }

  return NextResponse.json({
    ok: true,
    task: mapTask(data as Record<string, unknown>),
    journey: journeyAdvanced,
  });
}
