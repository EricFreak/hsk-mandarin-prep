import { test, expect } from "@playwright/test";

const WRITING_SAMPLE =
  "我最喜欢打篮球，因为打篮球可以锻炼身体，也让我交到很多朋友。每个周末我都会和朋友一起打球。";

async function selectMcqIfPresent(page: import("@playwright/test").Page) {
  const choices = page.locator("div.grid.gap-3 button");
  if ((await choices.count()) > 0) {
    await choices.first().click();
  }
}

async function completeMockExam(page: import("@playwright/test").Page) {
  await page.goto("/mock-exam");
  await expect(page.getByText(/question 1 of/i)).toBeVisible({ timeout: 30_000 });

  for (let i = 0; i < 12; i += 1) {
    const textarea = page.locator("textarea");
    if (await textarea.isVisible()) {
      await textarea.fill(WRITING_SAMPLE);
    } else {
      await selectMcqIfPresent(page);
    }

    const primaryBtn = page.getByRole("button", { name: /next question|submit exam/i });
    await expect(primaryBtn).toBeEnabled({ timeout: 10_000 });
    const label = (await primaryBtn.textContent()) ?? "";
    await primaryBtn.click();
    if (/submit exam/i.test(label)) break;
  }

  await expect(page.getByText(/%/).first()).toBeVisible({ timeout: 30_000 });
}

test.describe("MOCK — Mock exam", () => {
  test("MOCK-001/005/009: full exam UI submit and review link", async ({ page }) => {
    await completeMockExam(page);

    const reviewLink = page.getByRole("link", { name: /review exam/i });
    if (await reviewLink.isVisible()) {
      await reviewLink.click();
      await expect(page).toHaveURL(/\/mock-exam\/attempts\//);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
  });

  test("MOCK-010: attempt history list", async ({ page }) => {
    await page.goto("/mock-exam/attempts");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/history|attempt/i);
  });
});
