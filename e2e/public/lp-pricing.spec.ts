import { test, expect } from "@playwright/test";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("LP — Pricing page (three-service, buy-once)", () => {
  test("LP-PRC-001: pricing page shows buy-once coach packs, no subscription copy", async ({
    page,
  }) => {
    await page.goto("/pricing");

    await expect(page.getByText("$13", { exact: true })).toBeVisible();
    await expect(page.getByText("$26", { exact: true })).toBeVisible();
    await expect(page.getByText("$39", { exact: true })).toBeVisible();

    await expect(page.getByText(/per month|\/month|yearly/i)).toHaveCount(0);

    await expect(page.getByText(/sample day/i)).toBeVisible();
  });

  test("LP-PRC-002: pricing page names all three services", async ({ page }) => {
    await page.goto("/pricing");

    await expect(
      page.getByRole("heading", { name: /coach packages/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /custom exam plan/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /emergency sprint/i }),
    ).toBeVisible();
  });

  test("LP-PRC-003: anonymous service CTA funnels to signup, not checkout", async ({
    page,
  }) => {
    await page.goto("/pricing");

    // All three service cards (Coach packages / Custom exam plan / Emergency sprint)
    // share the same CTA and must funnel anonymous visitors to signup, not checkout.
    const serviceCtas = page.getByRole("link", { name: /^start free$/i });
    await expect(serviceCtas).toHaveCount(3);
    for (const cta of await serviceCtas.all()) {
      await expect(cta).toHaveAttribute("href", /\/login\?next=%2Fonboarding/);
    }
  });
});
