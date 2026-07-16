import { getAuthenticatedCoachUser } from "@/lib/coach/api-auth";
import { runCoach } from "@/lib/coach/run-coach";
import { fetchAccess } from "@/lib/lp/access-server";
import { hasFullAccess } from "@/lib/lp/access";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  const auth = await getAuthenticatedCoachUser();
  if ("error" in auth) return auth.error;

  const { supabase, user } = auth;
  const access = await fetchAccess(supabase, user.id);

  if (!hasFullAccess(access)) {
    return NextResponse.json({ error: "pro_required", upgrade: true }, { status: 402 });
  }

  const result = await runCoach(supabase, {
    userId: user.id,
    trigger: "manual_refresh",
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    ok: true,
    reportId: result.reportId,
    planId: result.planId,
  });
}
