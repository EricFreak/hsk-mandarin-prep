#!/usr/bin/env node
/**
 * Grant Pro + founder_cohort to a user by email.
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.
 *
 * Usage:
 *   node scripts/grant-founder-pro.mjs you@example.com
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
    // ignore
  }
}

loadEnvLocal();

const email = process.argv[2];
if (!email) {
  console.error("Usage: node scripts/grant-founder-pro.mjs <email>");
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
    .select("id, email, plan, founder_cohort")
    .eq("email", email)
    .maybeSingle();

  if (profileError) throw new Error(profileError.message);
  if (!profile) throw new Error(`No profile found for ${email}`);

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ plan: "pro", founder_cohort: true })
    .eq("id", profile.id);

  if (updateError) throw new Error(updateError.message);

  const { data: after, error: afterError } = await supabase
    .from("profiles")
    .select("email, plan, founder_cohort")
    .eq("id", profile.id)
    .maybeSingle();

  if (afterError) throw new Error(afterError.message);
  console.log("Updated:", after);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

