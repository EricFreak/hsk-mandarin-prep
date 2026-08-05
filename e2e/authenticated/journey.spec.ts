import { test, expect } from "@playwright/test";

test.describe("MST — Mistake bank", () => {
  test("MST-001: mistakes page loads", async ({ page }) => {
    await page.goto("/mistakes");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/mistake/i);
  });

  test("MST-005/006: filters render", async ({ page }) => {
    await page.goto("/mistakes");
    await expect(page.getByRole("link", { name: /^all$/i }).first()).toBeVisible();
  });
});

test.describe("PAY — Pricing (authenticated)", () => {
  test("PAY-001: pricing while logged in", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByText(/free/i).first()).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /coach packages/i }),
    ).toBeVisible();
  });
});

test.describe("JNY — Full user journey", () => {
  test("JNY-002: study loop flashcards → practice → dashboard", async ({ page }) => {
    await page.goto("/flashcards");
    const card = page.locator("button").filter({ hasText: /[\u4e00-\u9fff]/ }).first();
    if (await card.isVisible()) {
      await card.click();
      const good = page.getByRole("button", { name: "Good" });
      if (await good.isVisible()) await good.click();
    }

    await page.goto("/practice");
    await expect(page.getByRole("button", { name: "Submit answer" })).toBeVisible({
      timeout: 45_000,
    });
    const choice = page.locator("div.grid.gap-3 button").first();
    await choice.click();
    await page.getByRole("button", { name: "Submit answer" }).click();
    await expect(page.getByText(/correct|not quite/i)).toBeVisible();

    await page.goto("/dashboard");
    await expect(page.getByText(/practice · last 7 days/i)).toBeVisible();
  });
});
