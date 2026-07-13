import { test, expect } from "@playwright/test";

test.describe("MKT — Marketing & public pages", () => {
  test("MKT-001: home page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: /pricing/i }).first()).toBeVisible();
  });

  test("MKT-003: HSK 2 vs 3 comparison", async ({ page }) => {
    await page.goto("/hsk-2-vs-3");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: /chinesetest/i }).first()).toBeVisible();
  });

  test("MKT-004: pricing page", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByText(/free/i).first()).toBeVisible();
    await expect(page.getByText(/pro/i).first()).toBeVisible();
  });

  test("AUTH-005: dashboard redirects when logged out", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("AUTH-006: practice redirects when logged out", async ({ page }) => {
    await page.goto("/practice");
    await expect(page).toHaveURL(/\/login/);
  });

  test("AUTH-001: login page renders", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
  });
});
