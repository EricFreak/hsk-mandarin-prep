import { applyFreemiumTasks } from "@/lib/coach/freemium";
import { getAuthenticatedCoachUser, getUserPlan } from "@/lib/coach/api-auth";
import type { CoachPlanTaskRow } from "@/lib/coach/types";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await getAuthenticatedCoachUser();
  if ("error" in auth) return auth.error;

  const { supabase, user } = auth;

  try {
    const plan = await getUserPlan(supabase, user.id);
    const { data: activePlan } = await supabase
      .from("coach_study_plans")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (!activePlan) {
      return NextResponse.json({ plan: null, tasks: [] });
    }

    const { data: taskRows } = await supabase
      .from("coach_plan_tasks")
      .select("*")
      .eq("plan_id", activePlan.id)
      .order("day_offset", { ascending: true });

    const tasks = applyFreemiumTasks(
      ((taskRows ?? []) as CoachPlanTaskRow[]),
      plan,
    );

    return NextResponse.json({
      plan: activePlan,
      tasks,
    });
  } catch (err) {
    console.error("Coach plan GET failed:", err);
    return NextResponse.json({ error: "Failed to load study plan" }, { status: 500 });
  }
}
