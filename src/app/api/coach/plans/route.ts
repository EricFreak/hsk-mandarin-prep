import { fetchCoachPlans } from "@/lib/coach/fetch-coach";
import { getAuthenticatedCoachUser, getUserPlan } from "@/lib/coach/api-auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await getAuthenticatedCoachUser();
  if ("error" in auth) return auth.error;

  const { supabase, user } = auth;

  try {
    const plan = await getUserPlan(supabase, user.id);
    const payload = await fetchCoachPlans(supabase, user.id, plan);
    return NextResponse.json(payload);
  } catch (err) {
    console.error("Coach plans GET failed:", err);
    return NextResponse.json({ error: "Failed to load coach plans" }, { status: 500 });
  }
}
