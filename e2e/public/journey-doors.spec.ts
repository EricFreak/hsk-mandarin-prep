import { test, expect } from "@playwright/test";

/**
 * UI / public journey contract.
 *
 * Landing copy changed from "Start free Week 1" to "Start with a free
 * diagnosis" (diagnosis-first funnel). Anonymous CTAs funnel to
 * /login?next=%2Fonboarding; authed paths are covered in journey-auth-matrix.
 */
test.describe("JOURNEY — public CTA & diagnosis door", () => {
  test("JNY-PUB-001: hero primary CTA resolves via continue door", async ({
    page,
  }) => {
    await page.goto("/");
    const cta = page
      .getByRole("link", { name: /start with a free diagnosis/i })
      .first();
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute(
      "href",
      /\/login\?next=%2Fonboarding|\/onboarding|\/dashboard|\/diagnosis/,
    );
  });

  test("JNY-PUB-002: all primary CTAs stay on journey door", async ({ page }) => {
    await page.goto("/");
    const ctas = page.getByRole("link", { name: /start with a free diagnosis/i });
    await expect(ctas.first()).toBeVisible();
    const count = await ctas.count();
    expect(count).toBeGreaterThanOrEqual(2);
    for (let i = 0; i < count; i += 1) {
      await expect(ctas.nth(i)).toHaveAttribute(
        "href",
        /\/login\?next=%2Fonboarding|\/onboarding|\/dashboard|\/diagnosis/,
      );
    }
  });

  test("JNY-PUB-003: plans CTA uses journey door", async ({ page }) => {
    await page.goto("/#plans");
    const planCta = page.getByRole("link", { name: /start with diagnosis/i }).first();
    await expect(planCta).toHaveAttribute(
      "href",
      /\/login\?next=%2Fonboarding|\/onboarding|\/dashboard|\/diagnosis/,
    );
  });

  test("JNY-PUB-004: logged-out /diagnosis redirects to login with next", async ({
    page,
  }) => {
    await page.goto("/diagnosis");
    await expect(page).toHaveURL(/\/login/);
    expect(page.url()).toMatch(/next=/);
  });

  test("JNY-PUB-005: legacy /placement redirects toward diagnosis", async ({ page }) => {
    await page.goto("/placement");
    await expect(page).toHaveURL(/\/(diagnosis|login)/);
  });

  test("JNY-PUB-006: header shows Login when anonymous", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /^Login$/i }).first()).toBeVisible();
  });
});
