import { createClient } from "@supabase/supabase-js";
import type { Browser } from "@playwright/test";
import {
  createAdminClient,
  getEnv,
  projectRefFromUrl,
  resetUserProgress,
  setUserPlan,
} from "./supabase";

export async function ensureAuthUser(
  email: string,
  password: string,
): Promise<{ id: string; email: string }> {
  const admin = createAdminClient();

  const { data: listData, error: listError } =
    await admin.auth.admin.listUsers({ perPage: 1000 });
  if (listError) throw new Error(`listUsers: ${listError.message}`);

  let user = listData.users.find((u) => u.email === email);

  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error || !data.user) {
      throw new Error(`createUser: ${error?.message ?? "no user"}`);
    }
    user = data.user;
  }

  return { id: user.id, email: user.email ?? email };
}

export async function prepareFreeUserContext(
  email: string,
  password: string,
): Promise<{ id: string; email: string }> {
  const admin = createAdminClient();
  const user = await ensureAuthUser(email, password);
  await setUserPlan(admin, user.id, user.email, "free");
  await resetUserProgress(admin, user.id);
  return user;
}

export async function createStorageState(
  browser: Browser,
  baseURL: string,
  email: string,
  password?: string,
  authFile?: string,
): Promise<void> {
  const env = getEnv();
  const url = env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const context = await browser.newContext();
  const page = await context.newPage();

  if (password) {
    await page.goto(`${baseURL}/login`);
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: /^sign in$/i }).click();
    await page.waitForURL(/\/dashboard/, { timeout: 30_000 });
  } else {
    const admin = createAdminClient();
    const { data: linkData, error: linkError } =
      await admin.auth.admin.generateLink({
        type: "magiclink",
        email,
        options: { redirectTo: `${baseURL}/auth/callback` },
      });

    if (linkError || !linkData?.properties?.hashed_token) {
      throw new Error(`magic link: ${linkError?.message ?? "no token"}`);
    }

    const anon = createClient(url, anonKey);
    const { data: authData, error: verifyError } = await anon.auth.verifyOtp({
      type: "email",
      token_hash: linkData.properties.hashed_token,
    });

    if (verifyError || !authData.session) {
      throw new Error(`verifyOtp: ${verifyError?.message ?? "no session"}`);
    }

    const ref = projectRefFromUrl(url);
    const sessionJson = JSON.stringify({
      access_token: authData.session.access_token,
      refresh_token: authData.session.refresh_token,
      expires_at: authData.session.expires_at,
      expires_in: authData.session.expires_in,
      token_type: authData.session.token_type,
      user: authData.session.user,
    });

    const { hostname, protocol } = new URL(baseURL);
    const cookieDomain = hostname === "127.0.0.1" ? "localhost" : hostname;

    await context.addCookies([
      {
        name: `sb-${ref}-auth-token`,
        value: sessionJson,
        domain: cookieDomain,
        path: "/",
        httpOnly: false,
        secure: protocol === "https:",
        sameSite: "Lax",
      },
    ]);

    await page.goto(`${baseURL}/dashboard`);
    await page.waitForURL(/\/dashboard/, { timeout: 15_000 });
  }

  if (authFile) {
    await context.storageState({ path: authFile });
  }

  await context.close();
}
