import { test, expect } from "@playwright/test";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("PAY — Checkout (anonymous)", () => {
  test("API-022: checkout requires auth", async ({ request }) => {
    // Auth is checked before payment provider config, so unauthenticated
    // callers always get 401 whether or not Creem/Stripe is configured.
    const res = await request.post("/api/checkout", {
      data: { priceType: "monthly" },
    });
    expect(res.status()).toBe(401);
  });

  test("PAY-002: pricing upgrade when logged out redirects to login", async ({
    page,
  }) => {
    await page.goto("/pricing");
    await page.getByRole("button", { name: /upgrade to pro/i }).click();
    await expect(page).toHaveURL(/\/login/);
    expect(page.url()).toContain("next=%2Fpricing");
  });
});
