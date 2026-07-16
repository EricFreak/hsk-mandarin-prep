import { test, expect } from "@playwright/test";
import {
  createAdminClient,
  getEnv,
  resetUserProgress,
  seedMockExamAttempt,
  seedPracticeAttemptsToday,
  setUserPlan,
} from "../helpers/supabase";

const freeEmail =
  getEnv().E2E_FREE_EMAIL ?? "hsk-e2e-free@test.hskprep.app";

test.describe("FREE — Paywall & limits", () => {
  test.beforeEach(async () => {
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("id, email")
      .eq("email", freeEmail)
      .maybeSingle();

    if (!profile) {
      throw new Error(`Free E2E user missing: ${freeEmail}. Run global-setup.`);
    }

    await setUserPlan(admin, profile.id, profile.email, "free");
    await resetUserProgress(admin, profile.id);
  });

  test("DASH-FREE-001: dashboard shows Free plan", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText(/^plan$/i)).toBeVisible();
    await expect(page.getByText(/^free$/i).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /upgrade to pro/i })).toBeVisible();
  });

  test("MOCK-007: second mock exam blocked with quote CTA", async ({ page }) => {
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .eq("email", freeEmail)
      .single();

    await seedMockExamAttempt(admin, profile!.id);

    await page.goto("/mock-exam");
    await expect(page.getByText(/mock exam limit reached/i)).toBeVisible();
    // The limit page now routes to the quote hub (/plan/quote), not a Pro checkout.
    const quoteCta = page.getByRole("link", { name: /see my quote/i });
    await expect(quoteCta).toBeVisible();
    await expect(quoteCta).toHaveAttribute("href", "/plan/quote");
  });

  test("MOCK-FREE-001: first mock exam allowed", async ({ page }) => {
    await page.goto("/mock-exam");
    await expect(page.getByText(/question 1 of/i)).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(/mock exam limit reached/i)).not.toBeVisible();
  });

  test("PAY-008 / PRC-005: practice daily limit via API", async ({ request }) => {
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .eq("email", freeEmail)
      .single();

    await seedPracticeAttemptsToday(admin, profile!.id, 20);

    const res = await request.get("/api/practice/generate?level=3&seed=limit-test");
    expect(res.status()).toBe(402);
    const body = await res.json();
    expect(body.error).toBe("limit_reached");
    expect(body.upgrade).toBe(true);
  });

  test("PRC-005: practice daily limit UI", async ({ page }) => {
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .eq("email", freeEmail)
      .single();

    await seedPracticeAttemptsToday(admin, profile!.id, 20);

    await page.goto("/practice");
    await expect(page.getByText(/daily limit reached/i)).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole("link", { name: /view pricing/i })).toBeVisible();
  });

  test("API-MOCK-402: mock submit blocked after free limit", async ({ request }) => {
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .eq("email", freeEmail)
      .single();

    await seedMockExamAttempt(admin, profile!.id);

    const answers = [
      { questionId: "l1", selectedIndex: 0 },
      { questionId: "w1", writingText: "测试写作内容超过三十个汉字用于模拟考试免费用户限制测试。" },
    ];

    const res = await request.post("/api/mock-exam/submit", {
      data: {
        answers,
        startedAt: new Date().toISOString(),
        durationSeconds: 60,
      },
    });

    expect(res.status()).toBe(402);
    const body = await res.json();
    expect(body.error).toBe("limit_reached");
  });
});
