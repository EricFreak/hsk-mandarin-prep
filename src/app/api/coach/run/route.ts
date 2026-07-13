import { getAuthenticatedCoachUser, getUserPlan } from "@/lib/coach/api-auth";
import { runCoach } from "@/lib/coach/run-coach";
import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  trigger: z
    .enum(["mock_exam_completed", "manual_refresh", "post_tutoring"])
    .default("mock_exam_completed"),
  sourceAttemptId: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  const auth = await getAuthenticatedCoachUser();
  if ("error" in auth) return auth.error;

  const { supabase, user } = auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (parsed.data.trigger === "manual_refresh") {
    const plan = await getUserPlan(supabase, user.id);
    if (plan !== "pro") {
      return NextResponse.json({ error: "pro_required", upgrade: true }, { status: 402 });
    }
  }

  const result = await runCoach(supabase, {
    userId: user.id,
    trigger: parsed.data.trigger,
    sourceAttemptId: parsed.data.sourceAttemptId,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json({
    ok: true,
    reportId: result.reportId,
    planId: result.planId,
    alreadyExists: result.alreadyExists ?? false,
  });
}
