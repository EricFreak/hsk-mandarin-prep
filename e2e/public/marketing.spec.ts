import { test, expect } from "@playwright/test";

test.describe("MKT — Marketing & public pages", () => {
  test("MKT-001: home page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("link", { name: /How it works/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /pricing/i }).first()).toBeVisible();
    await expect(page.getByRole("contentinfo").getByRole("link", { name: /HSK exam guide/i })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Built for your first real HSK/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Free Week 1\. Pro for the rest/i }),
    ).toBeVisible();
    await expect(page.getByText(/GF0025-2021/i).first()).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Questions before you start/i }),
    ).toBeVisible();
    await expect(page.getByText(/How long is the free mock/i)).toBeVisible();
  });

  test("MKT-003: HSK exam guide page", async ({ page }) => {
    await page.goto("/hsk-2-vs-3");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/HSK standards/i);
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
