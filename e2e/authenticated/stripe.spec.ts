import { test, expect } from "@playwright/test";
import { createAdminClient, getEnv } from "../helpers/supabase";

const proEmail = getEnv().E2E_EMAIL ?? "657696471@qq.com";
const UNKNOWN_ORDER_ID = "00000000-0000-0000-0000-000000000000";
const MOCK_ORDER_ID = "11111111-1111-1111-1111-111111111111";

test.describe("PAY — Checkout (authenticated, orderId flow)", () => {
  test("API-021: POST /api/checkout with unknown orderId returns 404", async ({
    request,
  }) => {
    // The route looks up lp_orders by orderId + user. An unknown id yields 404
    // whether or not migration 010 (lp_orders) is applied, so this is robust
    // against a remote DB that lacks the table.
    const res = await request.post("/api/checkout", {
      data: { orderId: UNKNOWN_ORDER_ID },
    });
    expect(res.status()).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("order_not_found");
  });

  test("API-023: POST /api/checkout with non-uuid orderId returns 400", async ({
    request,
  }) => {
    // Zod requires orderId to be a uuid; the old { priceType } shape is rejected.
    const res = await request.post("/api/checkout", {
      data: { orderId: "not-a-uuid" },
    });
    expect(res.status()).toBe(400);
  });

  test("PAY-003: pricing page service CTA routes to /plan/quote (not checkout)", async ({
    page,
  }) => {
    await page.goto("/pricing");
    const serviceCta = page.getByRole("link", { name: /see my quote/i }).first();
    await expect(serviceCta).toBeVisible();
    await serviceCta.click();
    await expect(page).toHaveURL(/\/plan\/quote/, { timeout: 30_000 });
  });

  test("PAY-005: quote page posts { orderId } to /api/checkout", async ({
    page,
  }) => {
    // Force the coach picker so the "Buy once" button is present regardless of
    // any service_intent left by prior runs.
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .eq("email", proEmail)
      .maybeSingle();
    if (profile) {
      await admin
        .from("learner_profiles")
        .update({ service_intent: "coach" })
        .eq("user_id", profile.id);
    }

    // Mock the quote + checkout endpoints so the test does not depend on
    // migration 010 (lp_orders) or a configured Stripe key.
    await page.route("**/api/lp/quote", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          orderId: MOCK_ORDER_ID,
          priceCents: 1300,
          creditLp: 0,
        }),
      });
    });

    let checkoutBody: unknown = null;
    await page.route("**/api/checkout", async (route) => {
      checkoutBody = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ url: "/dashboard?purchased=1" }),
      });
    });

    await page.goto("/plan/quote");
    await page.getByRole("button", { name: /buy once/i }).first().click();

    await expect
      .poll(() => checkoutBody, { timeout: 30_000 })
      .toEqual({ orderId: MOCK_ORDER_ID });
  });
});
