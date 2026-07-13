import { test, expect } from "@playwright/test";

test.describe("PRC — AI Practice", () => {
  test("PRC-001/002/003: generate, submit, next", async ({ page }) => {
    await page.goto("/practice");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/practice/i);

    const submitBtn = page.getByRole("button", { name: "Submit answer" });
    await expect(submitBtn).toBeVisible({ timeout: 60_000 });

    const choices = page.locator("div.grid.gap-3 button");
    await expect(choices.first()).toBeVisible({ timeout: 10_000 });
    expect(await choices.count()).toBeGreaterThanOrEqual(2);

    await choices.first().click();
    await submitBtn.click();

    await expect(page.getByText(/correct|not quite/i)).toBeVisible({ timeout: 15_000 });

    const nextBtn = page.getByRole("button", { name: /next question/i });
    if (await nextBtn.isVisible()) {
      await nextBtn.click();
      await expect(page.getByRole("button", { name: "Submit answer" })).toBeVisible({
        timeout: 60_000,
      });
    }
  });

  test("PRC-004: practice is locked to HSK 3", async ({ page }) => {
    await page.goto("/practice");
    await expect(page.getByText(/hsk 3/i).first()).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole("button", { name: "1" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Submit answer" })).toBeVisible({
      timeout: 60_000,
    });
  });
});
