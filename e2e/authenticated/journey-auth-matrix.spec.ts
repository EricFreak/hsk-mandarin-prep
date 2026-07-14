import { test, expect } from "@playwright/test";
import { createAdminClient, setUserPlan } from "../helpers/supabase";
import { ensureAuthUser } from "../helpers/auth";
import { ensureOnboardingComplete } from "../helpers/supabase";

const PRO_EMAIL = process.env.E2E_PRO_EMAIL ?? "e2e-pro@hskprep.test";
const PRO_PASSWORD = process.env.E2E_PRO_PASSWORD ?? "e2e-pro-password-123";
const FREE_INCOMPLETE_PASSWORD =
  process.env.E2E_FREE_INCOMPLETE_PASSWORD ?? "e2e-free-incomplete-password-123";

test.use({ storageState: { cookies: [], origins: [] } });

async function passwordSignIn(
  page: import("@playwright/test").Page,
  baseURL: string,
  email: string,
  password: string,
) {
  await page.goto(`${baseURL}/login`);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: /^sign in$/i }).click();
  await page.waitForURL(
    (url) => !url.pathname.startsWith("/login") && !url.pathname.startsWith("/auth/"),
    { timeout: 30_000 },
  );
}

test.describe("JOURNEY — auth matrix", () => {
  test("JNY-AUTH-004: onboarding “I'm not sure” → /diagnosis", async ({
    browser,
    baseURL,
  }) => {
    test.skip(!baseURL, "baseURL required");

    const admin = createAdminClient();
    const email = `e2e-onb-${Date.now()}@hskprep.test`;
    const password = "e2e-onboarding-password-123";
    const user = await ensureAuthUser(email, password);
    await setUserPlan(admin, user.id, user.email, "free");
    await admin.from("learner_profiles").delete().eq("user_id", user.id);

    const context = await browser.newContext();
    const page = await context.newPage();
    await passwordSignIn(page, baseURL!, email, password);

    await page.goto(`${baseURL}/onboarding`);
    await page.getByRole("button", { name: /I.m not sure/i }).click();
    await expect(page).toHaveURL(/\/diagnosis/, { timeout: 20_000 });
    await expect(
      page.getByRole("heading", { name: /HSK Level 3 level check/i }),
    ).toBeVisible();

    await context.close();
  });

  test("JNY-GAP-001: Pro + marketing CTA must not open /login", async ({
    browser,
    baseURL,
  }) => {
    test.skip(!baseURL, "baseURL required");

    const admin = createAdminClient();
    const user = await ensureAuthUser(PRO_EMAIL, PRO_PASSWORD);
    await setUserPlan(admin, user.id, user.email, "pro");
    await ensureOnboardingComplete(admin, user.id);

    const context = await browser.newContext();
    const page = await context.newPage();
    await passwordSignIn(page, baseURL!, PRO_EMAIL, PRO_PASSWORD);

    await page.goto(`${baseURL}/`);
    await page.getByRole("link", { name: /Start free Week 1/i }).first().click();

    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).toHaveURL(/\/dashboard/);

    await context.close();
  });

  test("JNY-GAP-002: /login with live session must not show auth form", async ({
    browser,
    baseURL,
  }) => {
    test.skip(!baseURL, "baseURL required");

    const admin = createAdminClient();
    const user = await ensureAuthUser(PRO_EMAIL, PRO_PASSWORD);
    await setUserPlan(admin, user.id, user.email, "pro");
    await ensureOnboardingComplete(admin, user.id);

    const context = await browser.newContext();
    const page = await context.newPage();
    await passwordSignIn(page, baseURL!, PRO_EMAIL, PRO_PASSWORD);

    await page.goto(`${baseURL}/login?next=%2Fmock-exam`);
    await expect(page.getByLabel("Email")).toHaveCount(0);
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page).toHaveURL(/\/mock-exam/);

    await context.close();
  });

  test("JNY-GAP-003: incomplete learner blocked from /mock-exam", async ({
    browser,
    baseURL,
  }) => {
    test.skip(!baseURL, "baseURL required");

    const admin = createAdminClient();
    const email = `e2e-block-mock-${Date.now()}@hskprep.test`;
    const user = await ensureAuthUser(email, FREE_INCOMPLETE_PASSWORD);
    await setUserPlan(admin, user.id, user.email, "free");
    await admin.from("learner_profiles").delete().eq("user_id", user.id);

    const context = await browser.newContext();
    const page = await context.newPage();
    await passwordSignIn(page, baseURL!, email, FREE_INCOMPLETE_PASSWORD);

    await page.goto(`${baseURL}/mock-exam`);
    await expect(page).toHaveURL(/\/(onboarding|diagnosis)/);

    await context.close();
  });

  test("JNY-GAP-004: incomplete Free /dashboard → onboarding", async ({
    browser,
    baseURL,
  }) => {
    test.skip(!baseURL, "baseURL required");

    const admin = createAdminClient();
    const email = `e2e-incomplete-${Date.now()}@hskprep.test`;
    const user = await ensureAuthUser(email, FREE_INCOMPLETE_PASSWORD);
    await setUserPlan(admin, user.id, user.email, "free");
    await admin.from("learner_profiles").delete().eq("user_id", user.id);

    const context = await browser.newContext();
    const page = await context.newPage();
    await passwordSignIn(page, baseURL!, email, FREE_INCOMPLETE_PASSWORD);

    await page.goto(`${baseURL}/dashboard`);
    await expect(page.getByText(/Server Error/i)).toHaveCount(0);
    await expect(page).toHaveURL(/\/onboarding/, { timeout: 20_000 });
    await expect(
      page.getByRole("heading", { name: /HSK Level 3 exam/i }),
    ).toBeVisible();

    await context.close();
  });
});
