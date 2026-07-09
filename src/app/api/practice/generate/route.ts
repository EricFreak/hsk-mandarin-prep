import { canStartPractice, FREE_DAILY_PRACTICE_LIMIT, type Plan } from "@/lib/entitlements";
import { generatePracticeQuestion } from "@/lib/openai/practice";
import { getWordsForLevel } from "@/lib/syllabus";
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

function startOfUtcDay(): string {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  return start.toISOString();
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

function parseLevel(value: string | null): 1 | 2 | 3 | null {
  if (value === "1" || value === "2" || value === "3") {
    return Number(value) as 1 | 2 | 3;
  }
  return null;
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

async function countPracticeAttemptsToday(
  supabase: ReturnType<typeof createClient>,
  userId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("practice_attempts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfUtcDay());

  if (error) {
    throw error;
  }

  return count ?? 0;
}

export async function GET(request: Request) {
  const auth = await getAuthenticatedUser();
  if ("error" in auth) return auth.error;

  const { supabase, user } = auth;
  const { searchParams } = new URL(request.url);
  const levelParam = searchParams.get("level");
  const level = parseLevel(levelParam) ?? 3;

  try {
    const [plan, usedToday] = await Promise.all([
      getUserPlan(supabase, user.id),
      countPracticeAttemptsToday(supabase, user.id),
    ]);

    if (!canStartPractice(plan, usedToday)) {
      return NextResponse.json(
        { error: "limit_reached", upgrade: true },
        { status: 402 },
      );
    }

    const words = getWordsForLevel(level);
    const seedParam = searchParams.get("seed");
    const seed = seedParam ? Number.parseInt(seedParam, 10) : Date.now();
    const question = await generatePracticeQuestion(level, words, Number.isFinite(seed) ? seed : Date.now());
    const questionId = crypto.randomUUID();

    return NextResponse.json({
      questionId,
      question,
      level,
      plan,
      usedToday,
      limit: plan === "pro" ? null : FREE_DAILY_PRACTICE_LIMIT,
    });
  } catch (err) {
    console.error("Practice generate GET failed:", err);
    return NextResponse.json(
      { error: "Failed to generate practice question" },
      { status: 500 },
    );
  }
}

const submitSchema = z.object({
  questionId: z.string().min(1),
  correct: z.boolean(),
  skill: z.string().min(1),
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
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

  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { questionId, correct, skill, level } = parsed.data;

  try {
    const plan = await getUserPlan(supabase, user.id);
    const usedToday = await countPracticeAttemptsToday(supabase, user.id);

    if (!canStartPractice(plan, usedToday)) {
      return NextResponse.json(
        { error: "limit_reached", upgrade: true },
        { status: 402 },
      );
    }

    const { error } = await supabase.from("practice_attempts").insert({
      user_id: user.id,
      level,
      question_id: questionId,
      correct,
      skill,
    });

    if (error) {
      throw error;
    }

    const usedAfter = usedToday + 1;

    return NextResponse.json({
      ok: true,
      usedToday: usedAfter,
      limit: plan === "pro" ? null : FREE_DAILY_PRACTICE_LIMIT,
      limitReached: plan === "free" && usedAfter >= FREE_DAILY_PRACTICE_LIMIT,
    });
  } catch (err) {
    console.error("Practice generate POST failed:", err);
    return NextResponse.json(
      { error: "Failed to record practice attempt" },
      { status: 500 },
    );
  }
}
