import { canUseAiWritingScore, type Plan } from "@/lib/entitlements";
import { scoreWriting } from "@/lib/openai/writing-score";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

async function getAuthenticatedUser() {
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

async function getUserPlan(
  supabase: ReturnType<typeof createClient>,
  userId: string,
): Promise<Plan> {
  const { data, error } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data?.plan) {
    return "free";
  }

  return data.plan === "pro" ? "pro" : "free";
}

const requestSchema = z.object({
  prompt: z.string().min(1),
  userText: z.string(),
});

export async function POST(request: Request) {
  const auth = await getAuthenticatedUser();
  if ("error" in auth) return auth.error;

  const { supabase, user } = auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const plan = await getUserPlan(supabase, user.id);

    if (!canUseAiWritingScore(plan)) {
      return NextResponse.json({ upgrade: true }, { status: 403 });
    }

    const result = await scoreWriting(parsed.data.prompt, parsed.data.userText);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Writing score failed:", err);
    return NextResponse.json(
      { error: "Failed to score writing response" },
      { status: 500 },
    );
  }
}
