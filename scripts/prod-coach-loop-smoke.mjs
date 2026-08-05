#!/usr/bin/env node
/**
 * Production coach-loop smoke (mutating):
 * login → mock submit → coach run → dashboard → practice → mark task done
 *
 * Usage:
 *   PLAYWRIGHT_BASE_URL=https://hsk-mandarin-prep.vercel.app npx tsx scripts/prod-coach-loop-smoke.mjs
 */
import { chromium, request } from "@playwright/test";
import { mkdirSync } from "fs";
import path from "path";
import { createStorageState } from "../e2e/helpers/auth";

const baseURL =
  process.env.PLAYWRIGHT_BASE_URL ?? "https://hsk-mandarin-prep.vercel.app";
const proEmail = process.env.E2E_EMAIL ?? "657696471@qq.com";
const authFile = path.resolve("e2e/.auth/pro-prod-smoke.json");

function ok(label, cond, detail = "") {
  console.log(`${cond ? "OK " : "FAIL"} ${label}${detail ? " — " + detail : ""}`);
  if (!cond) process.exitCode = 1;
}

async function main() {
  mkdirSync(path.dirname(authFile), { recursive: true });

  const browser = await chromium.launch();
  console.log(`▶ Auth ${proEmail} on ${baseURL}...`);
  await createStorageState(browser, baseURL, proEmail, undefined, authFile);
  await browser.close();

  const ctx = await request.newContext({
    baseURL,
    storageState: authFile,
    timeout: 180_000,
  });

  let coach = await (await ctx.get("/api/coach/dashboard")).json();
  console.log(
    `▶ Coach before: ${coach.status} tasks=${coach.tasks?.length ?? 0} llm=${coach.llmConfigured}`,
  );

  const answers = [
    { questionId: "l1", selectedIndex: 0 },
    { questionId: "l2", selectedIndex: 0 },
    { questionId: "l3", selectedIndex: 0 },
    { questionId: "l4", selectedIndex: 0 },
    { questionId: "l5", selectedIndex: 0 },
    { questionId: "r1", selectedIndex: 0 },
    { questionId: "r2", selectedIndex: 0 },
    { questionId: "r3", selectedIndex: 0 },
    { questionId: "r4", selectedIndex: 0 },
    { questionId: "r5", selectedIndex: 1 },
    {
      questionId: "w1",
      writingText:
        "我最喜欢打篮球，因为打篮球可以锻炼身体，也让我交到很多朋友。",
    },
  ];

  const submitRes = await ctx.post("/api/mock-exam/submit", {
    data: {
      answers,
      startedAt: new Date().toISOString(),
      durationSeconds: 90,
    },
  });
  const submitBody = await submitRes.json();
  ok(
    "SMK-03 mock submit",
    submitRes.status() === 200 && Boolean(submitBody.attemptId),
    `status=${submitRes.status()} attempt=${submitBody.attemptId} score=${submitBody.score}`,
  );

  if (!submitBody.attemptId) {
    await ctx.dispose();
    process.exit(1);
  }

  console.log("▶ POST /api/coach/run (may take ~1–2 min)...");
  const started = Date.now();
  const runRes = await ctx.post("/api/coach/run", {
    data: {
      trigger: "mock_exam_completed",
      sourceAttemptId: submitBody.attemptId,
    },
    timeout: 180_000,
  });
  const runBody = await runRes.json();
  ok(
    "SMK-03 coach run",
    runRes.ok() && Boolean(runBody.reportId),
    `status=${runRes.status()} body=${JSON.stringify(runBody).slice(0, 180)} elapsed=${Math.round((Date.now() - started) / 1000)}s`,
  );

  const coachRes = await ctx.get("/api/coach/dashboard");
  coach = await coachRes.json();
  ok(
    "SMK-03 coach dashboard",
    coachRes.status() === 200 && coach.status === "ready" && Boolean(coach.report),
    `status=${coach.status} readiness=${coach.report?.readiness_score} tasks=${coach.tasks?.length} summaryChars=${coach.report?.summary_markdown?.length ?? 0}`,
  );
  ok("SMK-03 llm configured on Vercel", coach.llmConfigured === true);
  ok(
    "SMK-03 has plan tasks",
    (coach.tasks?.length ?? 0) >= 1,
    `count=${coach.tasks?.length ?? 0}`,
  );

  const today = coach.todayTask;
  ok("SMK-04 today task present", Boolean(today), today ? today.title : "none");

  const skill =
    today?.skill ||
    coach.tasks?.find((task) => task.skill)?.skill ||
    "listening";
  const planTaskId = today?.id || coach.tasks?.[0]?.id;
  const pracRes = await ctx.get(
    `/api/practice/generate?level=3&seed=4242&skill=${encodeURIComponent(skill)}`,
  );
  const pracBody = await pracRes.json();
  ok(
    "SMK-04 practice with skill",
    pracRes.status() === 200 && Boolean(pracBody.questionId),
    `status=${pracRes.status()} skillParam=${skill} qSkill=${pracBody.question?.skill}`,
  );

  if (pracBody.questionId) {
    const postRes = await ctx.post("/api/practice/generate", {
      data: {
        questionId: pracBody.questionId,
        correct: true,
        skill: pracBody.question.skill,
        level: 3,
      },
    });
    const postBody = await postRes.json();
    ok(
      "SMK-04 record practice attempt",
      postRes.status() === 200 && postBody.ok === true,
    );
  }

  if (planTaskId) {
    const patchRes = await ctx.patch(`/api/coach/plan/tasks/${planTaskId}`, {
      data: { status: "done" },
    });
    const patchBody = await patchRes.json();
    ok(
      "SMK-04 mark plan task done",
      patchRes.status() === 200 && patchBody.ok === true,
      JSON.stringify(patchBody).slice(0, 120),
    );
  }

  try {
    const freeFile = path.resolve("e2e/.auth/free.json");
    const freeCtx = await request.newContext({
      baseURL,
      storageState: freeFile,
      timeout: 60_000,
    });
    const freeCoach = await (await freeCtx.get("/api/coach/dashboard")).json();
    const freeDash = await (await freeCtx.get("/api/dashboard")).json();
    ok("SMK-05 free plan", freeDash.plan === "free", `plan=${freeDash.plan}`);
    if (freeCoach.report && freeCoach.plan === "free") {
      ok(
        "SMK-05 free task gate",
        (freeCoach.tasks?.length ?? 0) <= 3,
        `tasks=${freeCoach.tasks?.length}`,
      );
    } else {
      console.log("INFO SMK-05 free has no coach report yet (ok)");
    }
    await freeCtx.dispose();
  } catch (err) {
    console.log(
      "WARN free check skipped:",
      err instanceof Error ? err.message : String(err),
    );
  }

  await ctx.dispose();
  console.log(
    process.exitCode
      ? "\nProduction coach loop FAILED"
      : "\nProduction coach loop PASSED",
  );
  process.exit(process.exitCode ?? 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
