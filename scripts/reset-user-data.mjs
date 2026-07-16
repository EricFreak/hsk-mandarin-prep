#!/usr/bin/env node
/**
 * Reset a learner toward a clean test state.
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local
 *
 * Usage:
 *   node scripts/reset-user-data.mjs you@example.com
 *   node scripts/reset-user-data.mjs you@example.com --mock-only
 *   node scripts/reset-user-data.mjs you@example.com --to-signup
 *
 * --to-signup: wipe progress + coach + journey + learner_profiles so stage is
 *              needs_exam_prefs (just after registration). Keeps auth + profiles.plan.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env.local optional if vars already exported
  }
}

loadEnvLocal();

const email = process.argv[2];
const mockOnly = process.argv.includes("--mock-only");
const toSignup = process.argv.includes("--to-signup");

if (!email) {
  console.error(
    "Usage: node scripts/reset-user-data.mjs <email> [--mock-only|--to-signup]",
  );
  process.exit(1);
}

if (mockOnly && toSignup) {
  console.error("Choose either --mock-only or --to-signup, not both.");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function deleteByUser(table, userId) {
  const { count: before } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  const { error } = await supabase.from(table).delete().eq("user_id", userId);
  if (error) {
    throw new Error(`${table}: ${error.message}`);
  }
  console.log(`  ${table}: deleted ${before ?? 0} row(s)`);
}

async function main() {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, plan")
    .eq("email", email)
    .maybeSingle();

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (!profile) {
    console.error(`No profile found for ${email}`);
    process.exit(1);
  }

  console.log(
    `Resetting data for ${profile.email} (${profile.id}) plan=${profile.plan}…`,
  );
  if (toSignup) {
    console.log("Mode: --to-signup (fresh registration / needs_exam_prefs)");
  }

  if (toSignup) {
    // FK-safe order: tasks → runs → plans → reports → journey → attempts → learner row
    for (const table of [
      "coach_plan_tasks",
      "coach_runs",
      "coach_study_plans",
      "coach_reports",
      "journey_week_outlines",
      "practice_questions",
      "practice_attempts",
      "srs_cards",
      "mock_exam_attempts",
    ]) {
      await deleteByUser(table, profile.id);
    }

    const { count: lpBefore } = await supabase
      .from("learner_profiles")
      .select("*", { count: "exact", head: true })
      .eq("user_id", profile.id);

    const { error: lpError } = await supabase
      .from("learner_profiles")
      .delete()
      .eq("user_id", profile.id);

    if (lpError) {
      throw new Error(`learner_profiles: ${lpError.message}`);
    }
    console.log(`  learner_profiles: deleted ${lpBefore ?? 0} row(s)`);

    console.log(
      "Done. Account kept; journey stage should be needs_exam_prefs → /onboarding.",
    );
    return;
  }

  await deleteByUser("mock_exam_attempts", profile.id);

  if (!mockOnly) {
    await deleteByUser("practice_attempts", profile.id);
    await deleteByUser("srs_cards", profile.id);
  }

  console.log("Done. Free mock exam slot restored (limit is 1 completed exam).");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
