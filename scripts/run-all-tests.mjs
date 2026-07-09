#!/usr/bin/env node
/**
 * Run ALL automated verification layers:
 *   1. full-app-verify (schema, DB, vitest, build)
 *   2. Playwright E2E (public + authenticated UI + API)
 *
 * Usage: npm run test:all
 */
import { execFileSync } from "child_process";
import { resolve } from "path";

const ROOT = resolve(process.cwd());

function freePort(port) {
  try {
    execFileSync("bash", [
      "-c",
      `pids=$(lsof -nP -iTCP:${port} -sTCP:LISTEN -t 2>/dev/null || true); [ -n "$pids" ] && kill $pids 2>/dev/null || true`,
    ]);
  } catch {
    // ignore
  }
}

freePort(3000);
freePort(3001);

const steps = [
  { name: "Layer 1 — Backend + unit + build", cmd: "node", args: ["scripts/full-app-verify.mjs"] },
  { name: "Layer 2/3 — Playwright E2E (full app)", cmd: "npx", args: ["playwright", "test"] },
];

console.log("╔══════════════════════════════════════════════════╗");
console.log("║  HSK Mandarin Prep — FULL automated test suite   ║");
console.log("╚══════════════════════════════════════════════════╝\n");

for (const step of steps) {
  console.log(`\n▶ ${step.name}\n`);
  try {
    execFileSync(step.cmd, step.args, { cwd: ROOT, stdio: "inherit" });
    console.log(`\n✓ ${step.name} — PASSED\n`);
  } catch {
    console.error(`\n✗ ${step.name} — FAILED\n`);
    process.exit(1);
  }
}

console.log("\n══════════════════════════════════════════════════");
console.log("  ALL automated layers PASSED");
console.log("  Report: e2e-report/index.html");
console.log("══════════════════════════════════════════════════\n");
