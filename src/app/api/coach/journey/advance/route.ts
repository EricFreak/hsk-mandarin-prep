import { getAuthenticatedCoachUser } from "@/lib/coach/api-auth";
import {
  clearWeekAndUnlockNext,
  materializeWeekPlan,
} from "@/lib/coach/journey/persist-journey";
import { canExecuteWeek } from "@/lib/coach/journey/week-unlock";
import { fetchAccess } from "@/lib/lp/access-server";
import { hasFullAccess } from "@/lib/lp/access";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  const auth = await getAuthenticatedCoachUser();
  if ("error" in auth) return auth.error;

  const { supabase, user } = auth;

  try {
    const access = await fetchAccess(supabase, user.id);
    if (!hasFullAccess(access)) {
      return NextResponse.json({ error: "quote_required" }, { status: 402 });
    }

    const result = await clearWeekAndUnlockNext(supabase, user.id);
    if (!result.advanced) {
      return NextResponse.json({ advanced: false });
    }

    const newWeekIndex = result.newWeekIndex!;

    if (
      canExecuteWeek({
        weekIndex: newWeekIndex,
        currentWeekIndex: newWeekIndex,
        access,
      })
    ) {
      const materialized = await materializeWeekPlan(supabase, user.id, newWeekIndex);
      if (materialized.ok) {
        return NextResponse.json({
          advanced: true,
          newWeekIndex,
          planId: materialized.planId,
        });
      }

      return NextResponse.json({
        advanced: true,
        newWeekIndex,
        planError: materialized.error,
      });
    }

    return NextResponse.json({ advanced: true, newWeekIndex });
  } catch (err) {
    console.error("Coach journey advance failed:", err);
    return NextResponse.json({ error: "Failed to advance journey" }, { status: 500 });
  }
}
