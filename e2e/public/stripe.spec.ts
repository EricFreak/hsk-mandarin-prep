import { test, expect } from "@playwright/test";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("PAY — Checkout (anonymous)", () => {
  test("API-022: checkout requires auth", async ({ request }) => {
    // Auth is checked before the body is parsed, so an anonymous caller gets 401
    // regardless of the orderId payload.
    const res = await request.post("/api/checkout", {
      data: { orderId: "00000000-0000-0000-0000-000000000000" },
    });
    expect(res.status()).toBe(401);
  });

  test("PAY-002: pricing service CTA when logged out redirects to login", async ({
    page,
  }) => {
    await page.goto("/pricing");
    await page.getByRole("link", { name: /^start free$/i }).first().click();
    await expect(page).toHaveURL(/\/login/);
    expect(page.url()).toContain("next=%2Fonboarding");
  });
});
