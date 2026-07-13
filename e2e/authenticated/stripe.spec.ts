import { test, expect } from "@playwright/test";
import { isCheckoutConfigured } from "../helpers/supabase";

test.describe("PAY — Checkout (authenticated)", () => {
  test("API-021: POST /api/checkout monthly", async ({ request }) => {
    if (!isCheckoutConfigured()) {
      const res = await request.post("/api/checkout", {
        data: { priceType: "monthly" },
      });
      expect(res.status()).toBe(503);
      return;
    }

    const res = await request.post("/api/checkout", {
      data: { priceType: "monthly" },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.url).toMatch(/^https:\/\//);
  });

  test("API-021b: POST /api/checkout yearly", async ({ request }) => {
    if (!isCheckoutConfigured()) {
      test.skip();
    }

    const res = await request.post("/api/checkout", {
      data: { priceType: "yearly" },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.url).toMatch(/^https:\/\//);
  });

  test("API-023: invalid priceType returns 400", async ({ request }) => {
    // Zod validation runs after auth and before provider config checks.
    const res = await request.post("/api/checkout", {
      data: { priceType: "weekly" },
    });
    expect(res.status()).toBe(400);
  });

  test("PAY-003: pricing page initiates checkout", async ({ page }) => {
    await page.goto("/pricing");

    if (!isCheckoutConfigured()) {
      await page.getByRole("button", { name: /upgrade to pro/i }).click();
      await expect(
        page.getByText(/not configured|checkout failed|failed/i).first(),
      ).toBeVisible();
      return;
    }

    await expect(page.getByText("$9.99")).toBeVisible();

    const checkoutResponse = page.waitForResponse(
      (res) =>
        res.url().includes("/api/checkout") &&
        res.request().method() === "POST",
    );

    await page.getByRole("button", { name: /upgrade to pro/i }).click();
    const response = await checkoutResponse;
    expect(response.status()).toBe(200);

    const body = (await response.json()) as { url?: string };
    expect(body.url).toMatch(/^https:\/\//);
  });

  test("PAY-004: yearly toggle shows $69", async ({ page }) => {
    await page.goto("/pricing");
    await page.getByRole("button", { name: /^yearly$/i }).click();
    await expect(page.getByText("$69")).toBeVisible();
  });
});
