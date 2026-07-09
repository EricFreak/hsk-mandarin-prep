import { test, expect } from "@playwright/test";

test.describe("FC — Flashcards", () => {
  test("FC-001/002/003: review flow", async ({ page }) => {
    await page.goto("/flashcards");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/flashcard/i);

    const card = page.locator("button").filter({ hasText: /[\u4e00-\u9fff]/ }).first();
    await expect(card).toBeVisible({ timeout: 30_000 });

    await card.click();
    await expect(page.getByText(/tap to hide|reveal/i)).toBeVisible();

    await page.getByRole("button", { name: "Good" }).click();
    await expect(page.getByText(/loading|all caught up|[\u4e00-\u9fff]/i).first()).toBeVisible({
      timeout: 30_000,
    });
  });
});
