import { test, expect } from "@playwright/test";
import {
  createAdminClient,
  getEnv,
  isCheckoutConfigured,
  seedMockExamAttempt,
} from "../helpers/supabase";

const freeEmail =
  getEnv().E2E_FREE_EMAIL ?? "hsk-e2e-free@test.hskprep.app";

test.describe("PAY — Free user upgrade flow", () => {
  test("PAY-009: mock paywall upgrade modal → checkout API", async ({ page }) => {
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .eq("email", freeEmail)
      .single();

    await seedMockExamAttempt(admin, profile!.id);

    await page.goto("/mock-exam");
    await expect(page.getByText(/mock exam limit reached/i)).toBeVisible();
    await page.getByRole("button", { name: /upgrade to pro/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText(/unlock unlimited prep/i)).toBeVisible();

    if (!isCheckoutConfigured()) {
      await page.getByRole("button", { name: /upgrade to pro/i }).last().click();
      await expect(
        page.getByText(/not configured|checkout failed|failed/i).first(),
      ).toBeVisible();
      return;
    }

    const checkoutResponse = page.waitForResponse(
      (res) =>
        res.url().includes("/api/checkout") &&
        res.request().method() === "POST",
    );

    await page.getByRole("button", { name: /upgrade to pro/i }).last().click();
    const response = await checkoutResponse;
    expect(response.status()).toBe(200);
    const body = (await response.json()) as { url?: string };
    expect(body.url).toMatch(/^https:\/\//);
  });
});
