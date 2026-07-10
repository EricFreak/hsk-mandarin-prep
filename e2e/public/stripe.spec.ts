import { test, expect } from "@playwright/test";
import { isCheckoutConfigured } from "../helpers/supabase";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("PAY — Checkout (anonymous)", () => {
  test("API-022: checkout requires auth when payments configured", async ({
    request,
  }) => {
    if (!isCheckoutConfigured()) {
      const res = await request.post("/api/checkout", {
        data: { priceType: "monthly" },
      });
      expect(res.status()).toBe(503);
      return;
    }

    const res = await request.post("/api/checkout", {
      data: { priceType: "monthly" },
    });
    expect(res.status()).toBe(401);
  });

  test("PAY-002: pricing upgrade when logged out", async ({ page }) => {
    await page.goto("/pricing");
    await page.getByRole("button", { name: /upgrade to pro/i }).click();

    if (!isCheckoutConfigured()) {
      await expect(page.getByText(/payments are not configured/i)).toBeVisible();
      await expect(page).toHaveURL(/\/pricing/);
      return;
    }

    await expect(page).toHaveURL(/\/login/);
    expect(page.url()).toContain("next=%2Fpricing");
  });
});
