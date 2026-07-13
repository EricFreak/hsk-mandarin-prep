import { test, expect } from "@playwright/test";

test.describe("DASH — Dashboard", () => {
  test("DASH-001/002/003: dashboard loads with action-first zones", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { level: 1, name: /dashboard/i })).toBeVisible();
    await expect(page.getByText(/^this week$/i).first()).toBeVisible();
    await expect(page.getByText(/progress glance/i)).toBeVisible();
    await expect(page.getByText(/latest mock/i)).toBeVisible();
    await expect(page.getByText(/practice · last 7 days/i)).toBeVisible();
  });

  test("DASH-008: navigation CTAs", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("link", { name: /start practice/i }).last().click();
    await expect(page).toHaveURL(/\/practice/);
    await page.goto("/dashboard");
    await page.getByRole("link", { name: /take mock exam/i }).last().click();
    await expect(page).toHaveURL(/\/mock-exam/);
  });
});
