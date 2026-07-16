import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  resolveCustomerId,
  resolveUserIdFromMetadata,
} from "@/lib/payments/subscription-sync";
import { verifyCreemWebhookSignature } from "@/lib/payments/creem";
import { createLpCheckout } from "@/lib/payments/stripe-provider";
import { createHmac } from "crypto";

const { createMock } = vi.hoisted(() => ({
  createMock: vi.fn(),
}));

vi.mock("stripe", () => ({
  default: class MockStripe {
    checkout = { sessions: { create: createMock } };
  },
}));

describe("resolveUserIdFromMetadata", () => {
  it("reads userId", () => {
    expect(resolveUserIdFromMetadata({ userId: "abc-123" })).toBe("abc-123");
  });

  it("falls back to referenceId", () => {
    expect(resolveUserIdFromMetadata({ referenceId: "ref-1" })).toBe("ref-1");
  });

  it("returns null when missing", () => {
    expect(resolveUserIdFromMetadata({})).toBeNull();
  });
});

describe("resolveCustomerId", () => {
  it("reads string id", () => {
    expect(resolveCustomerId("cust_1")).toBe("cust_1");
  });

  it("reads nested customer object", () => {
    expect(resolveCustomerId({ id: "cust_2" })).toBe("cust_2");
  });
});

describe("verifyCreemWebhookSignature", () => {
  it("validates HMAC signature", () => {
    const secret = "test-secret";
    const body = '{"eventType":"subscription.paid"}';
    const signature = createHmac("sha256", secret).update(body).digest("hex");

    process.env.CREEM_WEBHOOK_SECRET = secret;
    expect(verifyCreemWebhookSignature(body, signature)).toBe(true);
    expect(verifyCreemWebhookSignature(body, "bad-signature")).toBe(false);
  });
});

describe("createLpCheckout", () => {
  const orderId = "00000000-0000-0000-0000-000000000000";

  beforeEach(() => {
    createMock.mockReset();
    process.env.STRIPE_SECRET_KEY = "sk_test_123";
    process.env.NEXT_PUBLIC_APP_URL = "https://app.test";
  });

  it("assembles one-time payment session params", async () => {
    createMock.mockResolvedValue({ url: "https://checkout.stripe.com/sess_123" });

    const { url } = await createLpCheckout({
      orderId,
      userId: "user-1",
      userEmail: "u@test.com",
      priceCents: 1300,
      productName: "Coach package · 4 weeks",
    });

    expect(url).toBe("https://checkout.stripe.com/sess_123");
    expect(createMock).toHaveBeenCalledWith({
      mode: "payment",
      client_reference_id: "user-1",
      customer_email: "u@test.com",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: 1300,
            product_data: { name: "Coach package · 4 weeks" },
          },
        },
      ],
      success_url: "https://app.test/dashboard?purchased=1",
      cancel_url: "https://app.test/plan/quote",
      metadata: { userId: "user-1", orderId },
    });
  });

  it("throws when stripe does not return a url", async () => {
    createMock.mockResolvedValue({ url: null });

    await expect(
      createLpCheckout({
        orderId,
        userId: "user-1",
        priceCents: 1300,
        productName: "Coach package · 4 weeks",
      }),
    ).rejects.toThrow("stripe_checkout_no_url");
  });

  it("throws when stripe is not configured", async () => {
    delete process.env.STRIPE_SECRET_KEY;

    await expect(
      createLpCheckout({
        orderId,
        userId: "user-1",
        priceCents: 1300,
        productName: "Coach package · 4 weeks",
      }),
    ).rejects.toThrow("Stripe is not configured");
  });
});
