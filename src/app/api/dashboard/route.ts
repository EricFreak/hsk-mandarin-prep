import { fetchDashboardForUser } from "@/lib/dashboard-data";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export async function GET() {
  if (!hasSupabaseEnv()) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 503 },
    );
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await fetchDashboardForUser(user.id);
  return NextResponse.json(data);
}
