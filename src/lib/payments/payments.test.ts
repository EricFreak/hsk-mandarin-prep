import { describe, expect, it } from "vitest";
import {
  resolveCustomerId,
  resolveUserIdFromMetadata,
} from "@/lib/payments/subscription-sync";
import { verifyCreemWebhookSignature } from "@/lib/payments/creem";
import { createHmac } from "crypto";

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
