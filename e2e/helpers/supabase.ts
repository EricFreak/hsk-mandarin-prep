import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

export function loadEnvLocal(): Record<string, string> {
  const file = resolve(process.cwd(), ".env.local");
  if (!existsSync(file)) return {};
  const env: Record<string, string> = {};
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    env[trimmed.slice(0, eq)] = trimmed.slice(eq + 1);
  }
  return env;
}

export function getEnv(): Record<string, string> {
  return { ...loadEnvLocal(), ...process.env } as Record<string, string>;
}

export function createAdminClient(): SupabaseClient {
  const env = getEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Missing Supabase admin credentials in .env.local");
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function projectRefFromUrl(url: string): string {
  return new URL(url).hostname.split(".")[0] ?? "localhost";
}

export function isCreemConfigured(): boolean {
  const env = getEnv();
  return Boolean(
    env.CREEM_API_KEY &&
      env.CREEM_PRODUCT_PRO_MONTHLY &&
      env.CREEM_PRODUCT_PRO_YEARLY,
  );
}

export function isStripeConfigured(): boolean {
  const env = getEnv();
  return Boolean(
    env.STRIPE_SECRET_KEY &&
      env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY &&
      env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY,
  );
}

export function isCheckoutConfigured(): boolean {
  const env = getEnv();
  const provider = env.PAYMENT_PROVIDER?.trim().toLowerCase();

  if (provider === "creem") {
    return isCreemConfigured();
  }

  if (provider === "stripe") {
    return isStripeConfigured();
  }

  return isCreemConfigured() || isStripeConfigured();
}

export async function resetUserProgress(
  admin: SupabaseClient,
  userId: string,
): Promise<void> {
  await admin.from("mock_exam_attempts").delete().eq("user_id", userId);
  await admin.from("practice_attempts").delete().eq("user_id", userId);
  await admin.from("practice_questions").delete().eq("user_id", userId);
}

export async function setUserPlan(
  admin: SupabaseClient,
  userId: string,
  email: string,
  plan: "free" | "pro",
): Promise<void> {
  const { error } = await admin.from("profiles").upsert({
    id: userId,
    email,
    plan,
    founder_cohort: false,
  });
  if (error) throw new Error(`profiles upsert: ${error.message}`);
}

export async function seedPracticeAttemptsToday(
  admin: SupabaseClient,
  userId: string,
  count: number,
): Promise<void> {
  const rows = Array.from({ length: count }, (_, i) => ({
    user_id: userId,
    level: 3,
    question_id: `e2e-seed-practice-${i}`,
    correct: i % 2 === 0,
    skill: "vocabulary",
  }));
  const { error } = await admin.from("practice_attempts").insert(rows);
  if (error) throw new Error(`seed practice: ${error.message}`);
}

export async function seedMockExamAttempt(
  admin: SupabaseClient,
  userId: string,
): Promise<void> {
  const { error } = await admin.from("mock_exam_attempts").insert({
    user_id: userId,
    level: 3,
    score: 70,
    breakdown: { e2e: true, attempts: [] },
    template_id: "hsk3-mock-exam",
    template_version: 1,
    answers: [],
    status: "completed",
    completed_at: new Date().toISOString(),
  });
  if (error) throw new Error(`seed mock exam: ${error.message}`);
}
