#!/usr/bin/env node
/**
 * Full automated backend + build verification (no browser).
 * Does NOT replace manual/E2E UI checks — see docs/testing/full-verification-runbook.md
 *
 * Usage: node scripts/full-app-verify.mjs [email]
 */
import { createClient } from "@supabase/supabase-js";
import { execFileSync } from "child_process";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const ROOT = process.cwd();
const email = process.argv[2] ?? "657696471@qq.com";

const results = [];

function pass(id, msg) {
  results.push({ id, status: "PASS", msg });
  console.log(`  ✓ ${id}: ${msg}`);
}

function fail(id, msg) {
  results.push({ id, status: "FAIL", msg });
  console.log(`  ✗ ${id}: ${msg}`);
}

function warn(id, msg) {
  results.push({ id, status: "WARN", msg });
  console.log(`  ! ${id}: ${msg}`);
}

function loadEnv() {
  const path = resolve(ROOT, ".env.local");
  if (!existsSync(path)) throw new Error("Missing .env.local");
  const raw = readFileSync(path, "utf8");
  const env = {};
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    env[t.slice(0, eq)] = t.slice(eq + 1);
  }
  return env;
}

async function probeTable(admin, table, columns) {
  const { error } = await admin.from(table).select(columns.join(",")).limit(0);
  return error ? error.message : null;
}

async function main() {
  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║  HSK Mandarin Prep — Full App Verify (auto)      ║");
  console.log("╚══════════════════════════════════════════════════╝\n");

  // ── 1. Environment ──────────────────────────────────────────
  console.log("▶ 1/6 Environment");
  const env = loadEnv();
  for (const key of [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "NEXT_PUBLIC_APP_URL",
  ]) {
    if (env[key]) pass(`ENV-${key}`, "set");
    else fail(`ENV-${key}`, "missing");
  }
  if (env.OPENAI_API_KEY) pass("ENV-OPENAI", "set (AI quality)");
  else warn("ENV-OPENAI", "missing — fallback questions only");
  if (env.STRIPE_SECRET_KEY) pass("ENV-STRIPE", "set");
  else warn("ENV-STRIPE", "missing — checkout disabled");

  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // ── 2. Schema (004/005 + core) ──────────────────────────────
  console.log("\n▶ 2/6 Database schema");
  const tables = [
    ["profiles", ["id", "email", "plan", "founder_cohort"]],
    ["practice_attempts", ["id", "user_id", "practice_question_id"]],
    ["practice_questions", ["id", "user_id", "stem", "choices"]],
    [
      "mock_exam_attempts",
      ["id", "score", "template_id", "answers", "status"],
    ],
    ["srs_cards", ["id", "user_id", "word_id", "due_at"]],
  ];
  for (const [table, cols] of tables) {
    const err = await probeTable(admin, table, cols);
    if (err) fail(`DB-${table}`, err);
    else pass(`DB-${table}`, "columns accessible");
  }

  // ── 3. User + insert probes ─────────────────────────────────
  console.log("\n▶ 3/6 User data & write probes");
  const { data: profile, error: profileErr } = await admin
    .from("profiles")
    .select("id, email, plan")
    .eq("email", email)
    .maybeSingle();

  if (profileErr || !profile) {
    fail("USER-profile", profileErr?.message ?? `no profile for ${email}`);
  } else {
    pass("USER-profile", `${profile.email} plan=${profile.plan}`);

    const { data: q, error: qErr } = await admin
      .from("practice_questions")
      .insert({
        user_id: profile.id,
        level: 3,
        stem: "[verify]",
        choices: ["A", "B"],
        answer_index: 0,
        explanation: "verify",
        skill: "vocabulary",
        seed: 99,
      })
      .select("id")
      .single();

    if (qErr) fail("WRITE-practice_questions", qErr.message);
    else {
      pass("WRITE-practice_questions", "insert ok");
      const { error: paErr } = await admin.from("practice_attempts").insert({
        user_id: profile.id,
        level: 3,
        question_id: q.id,
        practice_question_id: q.id,
        correct: false,
        skill: "vocabulary",
      });
      if (paErr) fail("WRITE-practice_attempts", paErr.message);
      else {
        pass("WRITE-practice_attempts", "insert ok");
        await admin.from("practice_attempts").delete().eq("practice_question_id", q.id);
      }
      await admin.from("practice_questions").delete().eq("id", q.id);
    }

    const mockAnswers = Array.from({ length: 8 }, (_, i) => ({
      questionId: `verify-q${i}`,
      selectedIndex: 0,
    }));

    const { data: mockRow, error: mockErr } = await admin
      .from("mock_exam_attempts")
      .insert({
        user_id: profile.id,
        level: 3,
        score: 75,
        breakdown: { verify: true, attempts: [] },
        template_id: "hsk3-mock-exam",
        template_version: 1,
        answers: mockAnswers,
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (mockErr) fail("WRITE-mock_exam_attempts", mockErr.message);
    else {
      pass("WRITE-mock_exam_attempts", `insert ok (${mockAnswers.length} answers)`);
      await admin.from("mock_exam_attempts").delete().eq("id", mockRow.id);
    }
  }

  // ── 4. Business logic (via Vitest — already comprehensive) ──
  console.log("\n▶ 4/6 Business logic (Vitest covers lib/*)");
  pass("LOGIC-delegated", "entitlements, weakness, SRS, mock template — see npm test");

  // ── 5. Vitest ───────────────────────────────────────────────
  console.log("\n▶ 5/6 Vitest unit tests");
  try {
    execFileSync("npm", ["test"], { cwd: ROOT, stdio: "pipe" });
    pass("TEST-vitest", "all unit tests passed");
  } catch (e) {
    fail("TEST-vitest", e.stderr?.toString() || e.message);
  }

  // ── 6. Production build ─────────────────────────────────────
  console.log("\n▶ 6/6 Production build");
  try {
    execFileSync("npm", ["run", "build"], { cwd: ROOT, stdio: "pipe" });
    pass("BUILD-next", "compiled successfully");
  } catch (e) {
    fail("BUILD-next", e.stderr?.toString()?.slice(-500) || e.message);
  }

  // ── Summary ─────────────────────────────────────────────────
  const passed = results.filter((r) => r.status === "PASS").length;
  const failed = results.filter((r) => r.status === "FAIL").length;
  const warnings = results.filter((r) => r.status === "WARN").length;

  console.log("\n══════════════════════════════════════════════════");
  console.log(`  PASS: ${passed}   FAIL: ${failed}   WARN: ${warnings}`);
  console.log("══════════════════════════════════════════════════");

  if (failed > 0) {
    console.log("\nAutomated verification FAILED. Fix failures before release.");
    console.log("See docs/testing/full-verification-runbook.md for UI/E2E layer.\n");
    process.exit(1);
  }

  console.log("\nAutomated layer PASSED.");
  console.log("⚠  Minimum smoke does NOT cover UI, auth cookies, Stripe, or full E2E.");
  console.log("   Run Layer 2 in docs/testing/full-verification-runbook.md (~45 min).\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
