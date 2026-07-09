import { test, expect } from "@playwright/test";
import { isStripeConfigured } from "../helpers/supabase";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("PAY — Stripe (anonymous)", () => {
  test("API-022: checkout requires auth when Stripe configured", async ({
    request,
  }) => {
    if (!isStripeConfigured()) {
      const res = await request.post("/api/stripe/checkout", {
        data: { priceType: "monthly" },
      });
      expect(res.status()).toBe(503);
      return;
    }

    const res = await request.post("/api/stripe/checkout", {
      data: { priceType: "monthly" },
    });
    expect(res.status()).toBe(401);
  });

  test("PAY-002: pricing upgrade when logged out", async ({ page }) => {
    await page.goto("/pricing");
    await page.getByRole("button", { name: /upgrade to pro/i }).click();

    if (!isStripeConfigured()) {
      await expect(page.getByText(/stripe is not configured/i)).toBeVisible();
      await expect(page).toHaveURL(/\/pricing/);
      return;
    }

    await expect(page).toHaveURL(/\/login/);
    expect(page.url()).toContain("next=%2Fpricing");
  });
});
