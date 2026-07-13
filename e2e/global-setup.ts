import { createClient } from "@supabase/supabase-js";
import { chromium, type FullConfig } from "@playwright/test";
import { mkdirSync } from "fs";
import path from "path";
import {
  createStorageState,
  prepareFreeUserContext,
  prepareProUserContext,
} from "./helpers/auth";
import { getEnv } from "./helpers/supabase";

export default async function globalSetup(config: FullConfig) {
  const env = getEnv();
  const baseURL =
    (config.projects[0]?.use?.baseURL as string | undefined) ??
    "http://localhost:3000";

  const proEmail = env.E2E_EMAIL ?? "657696471@qq.com";
  const proPassword = env.E2E_PASSWORD;
  const freeEmail = env.E2E_FREE_EMAIL ?? "hsk-e2e-free@test.hskprep.app";
  const freePassword = env.E2E_FREE_PASSWORD ?? "HskE2eFreeTest!2026";

  const authDir = path.resolve(process.cwd(), "e2e/.auth");
  mkdirSync(authDir, { recursive: true });

  const proAuthFile = path.join(authDir, "pro.json");
  const freeAuthFile = path.join(authDir, "free.json");
  const legacyAuthFile = path.join(authDir, "user.json");

  const browser = await chromium.launch();

  console.log(`[e2e] Pro auth: ${proEmail}`);
  await prepareProUserContext(proEmail, proPassword!);
  await createStorageState(browser, baseURL, proEmail, proPassword, proAuthFile);
  await createStorageState(browser, baseURL, proEmail, proPassword, legacyAuthFile);

  console.log(`[e2e] Free auth: ${freeEmail}`);
  await prepareFreeUserContext(freeEmail, freePassword);
  await createStorageState(browser, baseURL, freeEmail, freePassword, freeAuthFile);

  await browser.close();
  console.log("[e2e] Auth states saved (pro + free)");
}
