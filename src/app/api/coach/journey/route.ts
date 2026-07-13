import { fetchCoachJourney } from "@/lib/coach/fetch-coach";
import { getAuthenticatedCoachUser } from "@/lib/coach/api-auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await getAuthenticatedCoachUser();
  if ("error" in auth) return auth.error;

  const { supabase, user } = auth;

  try {
    const payload = await fetchCoachJourney(supabase, user.id);
    return NextResponse.json(payload);
  } catch (err) {
    console.error("Coach journey GET failed:", err);
    return NextResponse.json({ error: "Failed to load journey" }, { status: 500 });
  }
}
