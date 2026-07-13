#!/usr/bin/env node
/**
 * Verify Supabase schema for migrations 004/005 and common insert blockers.
 * Usage: node scripts/verify-migrations.mjs [user-email]
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnv() {
  const path = resolve(process.cwd(), ".env.local");
  const raw = readFileSync(path, "utf8");
  const env = {};
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    env[trimmed.slice(0, eq)] = trimmed.slice(eq + 1);
  }
  return env;
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const email = process.argv[2] ?? "657696471@qq.com";

async function checkColumns(table, expected) {
  const { data, error } = await admin.rpc("exec_sql", {});
  void data;
  void error;
  // RPC may not exist — use information_schema via REST not available.
  // Probe with a zero-row select instead.
  const probe = await admin.from(table).select(expected.join(",")).limit(0);
  if (probe.error) {
    return { ok: false, error: probe.error.message };
  }
  return { ok: true };
}

async function main() {
  console.log("=== Migration / schema verification ===\n");

  const mockCols = await checkColumns("mock_exam_attempts", [
    "template_id",
    "template_version",
    "answers",
    "started_at",
    "completed_at",
    "duration_seconds",
    "status",
  ]);
  console.log(
    mockCols.ok
      ? "OK  mock_exam_attempts (004 columns)"
      : `FAIL mock_exam_attempts (004): ${mockCols.error}`,
  );

  const pq = await checkColumns("practice_questions", [
    "id",
    "user_id",
    "stem",
    "choices",
    "answer_index",
  ]);
  console.log(
    pq.ok
      ? "OK  practice_questions (005 table)"
      : `FAIL practice_questions (005): ${pq.error}`,
  );

  const pa = await checkColumns("practice_attempts", ["practice_question_id"]);
  console.log(
    pa.ok
      ? "OK  practice_attempts.practice_question_id"
      : `FAIL practice_attempts column: ${pa.error}`,
  );

  console.log("\n=== User profile check ===\n");
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("id, email, plan, founder_cohort")
    .eq("email", email)
    .maybeSingle();

  if (profileError) {
    console.log(`FAIL profiles lookup: ${profileError.message}`);
  } else if (!profile) {
    console.log(`WARN No profile for ${email} — inserts will fail FK`);
  } else {
    console.log(`OK  profile: ${profile.email} plan=${profile.plan} founder=${profile.founder_cohort}`);
  }

  if (profile?.id) {
    console.log("\n=== Dry-run insert (rolled back via delete) ===\n");
    const userId = profile.id;

    const { data: qRow, error: qErr } = await admin
      .from("practice_questions")
      .insert({
        user_id: userId,
        level: 3,
        stem: "[verify] test",
        choices: ["A", "B", "C", "D"],
        answer_index: 0,
        explanation: "verify",
        skill: "vocabulary",
        seed: 1,
        model: null,
      })
      .select("id")
      .single();

    if (qErr) {
      console.log(`FAIL practice_questions insert: ${qErr.message}`);
    } else {
      console.log(`OK  practice_questions insert id=${qRow.id}`);

      const { error: paErr } = await admin.from("practice_attempts").insert({
        user_id: userId,
        level: 3,
        question_id: qRow.id,
        practice_question_id: qRow.id,
        correct: true,
        skill: "vocabulary",
      });
      if (paErr) {
        console.log(`FAIL practice_attempts insert: ${paErr.message}`);
      } else {
        console.log("OK  practice_attempts insert");
        await admin
          .from("practice_attempts")
          .delete()
          .eq("practice_question_id", qRow.id);
      }

      await admin.from("practice_questions").delete().eq("id", qRow.id);
    }

    const { data: mRow, error: mErr } = await admin
      .from("mock_exam_attempts")
      .insert({
        user_id: userId,
        level: 3,
        score: 80,
        breakdown: { test: true },
        template_id: "hsk3-mock-v1",
        template_version: 1,
        answers: [],
        status: "completed",
      })
      .select("id")
      .single();

    if (mErr) {
      console.log(`FAIL mock_exam_attempts insert: ${mErr.message}`);
    } else {
      console.log(`OK  mock_exam_attempts insert id=${mRow.id}`);
      await admin.from("mock_exam_attempts").delete().eq("id", mRow.id);
    }
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
