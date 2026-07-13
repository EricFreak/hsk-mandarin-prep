#!/usr/bin/env node
/**
 * Reset beta user progress (mock exams, practice counts, SRS cards).
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local
 *
 * Usage:
 *   node scripts/reset-user-data.mjs you@example.com
 *   node scripts/reset-user-data.mjs you@example.com --mock-only
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

if (!email) {
  console.error("Usage: node scripts/reset-user-data.mjs <email> [--mock-only]");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

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

  console.log(`Resetting data for ${profile.email} (${profile.id})…`);

  const { count: mockBefore } = await supabase
    .from("mock_exam_attempts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", profile.id);

  const { error: mockDeleteError } = await supabase
    .from("mock_exam_attempts")
    .delete()
    .eq("user_id", profile.id);

  if (mockDeleteError) {
    throw new Error(`mock_exam_attempts: ${mockDeleteError.message}`);
  }

  console.log(`  mock_exam_attempts: deleted ${mockBefore ?? 0} row(s)`);

  if (!mockOnly) {
    const { count: practiceBefore } = await supabase
      .from("practice_attempts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", profile.id);

    const { error: practiceDeleteError } = await supabase
      .from("practice_attempts")
      .delete()
      .eq("user_id", profile.id);

    if (practiceDeleteError) {
      throw new Error(`practice_attempts: ${practiceDeleteError.message}`);
    }

    console.log(`  practice_attempts: deleted ${practiceBefore ?? 0} row(s)`);

    const { count: srsBefore } = await supabase
      .from("srs_cards")
      .select("*", { count: "exact", head: true })
      .eq("user_id", profile.id);

    const { error: srsDeleteError } = await supabase
      .from("srs_cards")
      .delete()
      .eq("user_id", profile.id);

    if (srsDeleteError) {
      throw new Error(`srs_cards: ${srsDeleteError.message}`);
    }

    console.log(`  srs_cards: deleted ${srsBefore ?? 0} row(s)`);
  }

  console.log("Done. Free mock exam slot restored (limit is 1 completed exam).");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
