import { getAuthenticatedCoachUser } from "@/lib/coach/api-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const patchSchema = z.object({
  status: z.enum(["done", "skipped", "pending"]).optional(),
});

type RouteContext = {
  params: { id: string };
};

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

  const status = parsed.data.status ?? "done";
  const completedAt = status === "done" ? new Date().toISOString() : null;

  const { data, error } = await supabase
    .from("coach_plan_tasks")
    .update({
      status,
      completed_at: completedAt,
    })
    .eq("id", taskId)
    .eq("user_id", user.id)
    .select("id, status, completed_at")
    .maybeSingle();

  if (error) {
    console.error("Coach task PATCH failed:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, task: data });
}
