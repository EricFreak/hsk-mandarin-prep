import { test, expect } from "@playwright/test";
import { isStripeConfigured } from "../helpers/supabase";

test.describe("PAY — Stripe checkout (authenticated)", () => {
  test("API-021: POST /api/stripe/checkout monthly", async ({ request }) => {
    if (!isStripeConfigured()) {
      const res = await request.post("/api/stripe/checkout", {
        data: { priceType: "monthly" },
      });
      expect(res.status()).toBe(503);
      return;
    }

    const res = await request.post("/api/stripe/checkout", {
      data: { priceType: "monthly" },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.url).toMatch(/^https:\/\/checkout\.stripe\.com\//);
  });

  test("API-021b: POST /api/stripe/checkout yearly", async ({ request }) => {
    if (!isStripeConfigured()) {
      test.skip();
    }

    const res = await request.post("/api/stripe/checkout", {
      data: { priceType: "yearly" },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.url).toMatch(/^https:\/\/checkout\.stripe\.com\//);
  });

  test("API-023: invalid priceType returns 400", async ({ request }) => {
    if (!isStripeConfigured()) {
      const res = await request.post("/api/stripe/checkout", {
        data: { priceType: "weekly" },
      });
      expect(res.status()).toBe(503);
      return;
    }

    const res = await request.post("/api/stripe/checkout", {
      data: { priceType: "weekly" },
    });
    expect(res.status()).toBe(400);
  });

  test("PAY-003: pricing page initiates Stripe checkout", async ({ page }) => {
    await page.goto("/pricing");

    if (!isStripeConfigured()) {
      await page.getByRole("button", { name: /upgrade to pro/i }).click();
      await expect(page.getByText(/stripe is not configured/i)).toBeVisible();
      return;
    }

    await expect(page.getByText("$9.99")).toBeVisible();

    const checkoutResponse = page.waitForResponse(
      (res) =>
        res.url().includes("/api/stripe/checkout") &&
        res.request().method() === "POST",
    );

    await page.getByRole("button", { name: /upgrade to pro/i }).click();
    const response = await checkoutResponse;
    expect(response.status()).toBe(200);

    const body = (await response.json()) as { url?: string };
    expect(body.url).toMatch(/^https:\/\/checkout\.stripe\.com\//);
  });

  test("PAY-004: yearly toggle shows $69", async ({ page }) => {
    await page.goto("/pricing");
    await page.getByRole("button", { name: /^yearly$/i }).click();
    await expect(page.getByText("$69")).toBeVisible();
  });
});
