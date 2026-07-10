#!/usr/bin/env node
/**
 * Verify Learning Coach pipeline against live Supabase + DeepSeek.
 * Usage: node scripts/verify-coach.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const ROOT = process.cwd();

function loadEnv() {
  const path = resolve(ROOT, ".env.local");
  if (!existsSync(path)) throw new Error("Missing .env.local");
  const env = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    env[t.slice(0, eq)] = t.slice(eq + 1);
  }
  return env;
}

async function probeTable(admin, table, column = "id") {
  const { error } = await admin.from(table).select(column).limit(0);
  return error ? error.message : null;
}

async function main() {
  console.log("=== Learning Coach verification ===\n");
  const env = loadEnv();
  for (const [key, value] of Object.entries(env)) {
    if (!process.env[key]) process.env[key] = value;
  }
  const admin = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } },
  );

  const tables = [
    ["learner_profiles", "user_id"],
    ["coach_reports", "id"],
    ["coach_study_plans", "id"],
    ["coach_plan_tasks", "id"],
    ["coach_runs", "id"],
  ];

  let schemaOk = true;
  for (const [table, col] of tables) {
    const err = await probeTable(admin, table, col);
    if (err) {
      console.log(`FAIL ${table}: ${err}`);
      schemaOk = false;
    } else {
      console.log(`OK  ${table}`);
    }
  }

  if (!env.DEEPSEEK_API_KEY) {
    console.log("WARN DEEPSEEK_API_KEY missing — coach will use fallback only");
  } else {
    console.log(`OK  DEEPSEEK_API_KEY set (model=${env.COACH_LLM_MODEL ?? "deepseek-chat"})`);
  }

  if (!schemaOk) {
    console.log("\nRun supabase/migrations/006_coach.sql in Supabase SQL Editor first.");
    process.exit(1);
  }

  const email = "657696471@qq.com";
  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (!profile) {
    console.log(`FAIL no profile for ${email}`);
    process.exit(1);
  }

  const { data: mockRow, error: mockErr } = await admin
    .from("mock_exam_attempts")
    .insert({
      user_id: profile.id,
      level: 3,
      score: 68,
      breakdown: {
        breakdown_version: 1,
        attempts: [
          { questionId: "v-q1", skill: "listening", correct: false },
          { questionId: "v-q2", skill: "listening", correct: false },
          { questionId: "v-q3", skill: "grammar", correct: true },
        ],
        weaknesses: [{ skill: "listening", wrongCount: 2 }],
        correctCount: 1,
        totalMcq: 8,
      },
      template_id: "hsk3-mock-exam",
      template_version: 1,
      answers: [],
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (mockErr) {
    console.log(`FAIL mock insert: ${mockErr.message}`);
    process.exit(1);
  }

  console.log(`\n▶ Pipeline test (mock ${mockRow.id})`);

  const { runCoach } = await import("../src/lib/coach/run-coach.ts");
  const started = Date.now();
  const result = await runCoach(admin, {
    userId: profile.id,
    trigger: "mock_exam_completed",
    sourceAttemptId: mockRow.id,
  });
  const elapsed = Date.now() - started;

  if (!result.ok) {
    console.log(`FAIL runCoach (${elapsed}ms): ${result.error}`);
    await admin.from("mock_exam_attempts").delete().eq("id", mockRow.id);
    process.exit(1);
  }

  const { data: report } = await admin
    .from("coach_reports")
    .select("readiness_score, model, summary_markdown")
    .eq("id", result.reportId)
    .single();
  const { count: taskCount } = await admin
    .from("coach_plan_tasks")
    .select("id", { count: "exact", head: true })
    .eq("plan_id", result.planId);

  console.log(`OK  runCoach ${elapsed}ms`);
  console.log(`OK  report model=${report?.model} readiness=${report?.readiness_score}`);
  console.log(`OK  summary length=${report?.summary_markdown?.length ?? 0} chars`);
  console.log(`OK  plan tasks=${taskCount}`);

  if (!report?.summary_markdown || report.summary_markdown.length < 40) {
    console.log("FAIL summary too short");
    process.exit(1);
  }

  await admin.from("coach_plan_tasks").delete().eq("plan_id", result.planId);
  await admin.from("coach_study_plans").delete().eq("id", result.planId);
  await admin.from("coach_runs").delete().eq("report_id", result.reportId);
  await admin.from("coach_reports").delete().eq("id", result.reportId);
  await admin.from("mock_exam_attempts").delete().eq("id", mockRow.id);

  console.log("\nCoach verification PASSED (test data cleaned up).");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
