import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export async function getAuthenticatedCoachUser() {
  if (!hasSupabaseEnv()) {
    return {
      error: NextResponse.json(
        { error: "Supabase is not configured" },
        { status: 503 },
      ),
    };
  }

  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { supabase, user };
}

export async function getUserPlan(
  supabase: ReturnType<typeof createClient>,
  userId: string,
): Promise<"free" | "pro"> {
  const { data } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .maybeSingle();

  return data?.plan === "pro" ? "pro" : "free";
}
