import { getAppUrl, type PriceType } from "@/lib/payments/types";
import { createHmac, timingSafeEqual } from "crypto";

type CreemCheckoutResponse = {
  checkout_url?: string;
  id?: string;
};

export function isCreemConfigured(): boolean {
  return Boolean(
    process.env.CREEM_API_KEY &&
      process.env.CREEM_PRODUCT_PRO_MONTHLY &&
      process.env.CREEM_PRODUCT_PRO_YEARLY,
  );
}

function getCreemApiBaseUrl(): string {
  const testMode = process.env.CREEM_TEST_MODE !== "false";
  return testMode ? "https://test-api.creem.io" : "https://api.creem.io";
}

function getCreemProductId(priceType: PriceType): string | null {
  if (priceType === "monthly") {
    return process.env.CREEM_PRODUCT_PRO_MONTHLY || null;
  }

  return process.env.CREEM_PRODUCT_PRO_YEARLY || null;
}

export function verifyCreemWebhookSignature(
  rawBody: string,
  signature: string | null,
): boolean {
  const secret = process.env.CREEM_WEBHOOK_SECRET;
  if (!secret || !signature) {
    return false;
  }

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");

  try {
    return timingSafeEqual(
      Buffer.from(expected, "utf8"),
      Buffer.from(signature, "utf8"),
    );
  } catch {
    return false;
  }
}

export async function createCreemCheckout(params: {
  priceType: PriceType;
  userId: string;
  userEmail?: string | null;
}): Promise<{ url: string }> {
  const apiKey = process.env.CREEM_API_KEY;
  const productId = getCreemProductId(params.priceType);

  if (!apiKey || !productId) {
    throw new Error("Creem is not configured");
  }

  const appUrl = getAppUrl();
  const response = await fetch(`${getCreemApiBaseUrl()}/v1/checkouts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      product_id: productId,
      request_id: `${params.userId}:${params.priceType}:${Date.now()}`,
      success_url: `${appUrl}/dashboard?upgraded=1`,
      customer: params.userEmail ? { email: params.userEmail } : undefined,
      metadata: {
        userId: params.userId,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Creem checkout failed (${response.status})`);
  }

  const payload = (await response.json()) as CreemCheckoutResponse;
  if (!payload.checkout_url) {
    throw new Error("Creem checkout did not return a URL");
  }

  return { url: payload.checkout_url };
}
