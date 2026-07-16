import type { SupabaseClient } from "@supabase/supabase-js";
import { getCoachPack } from "./catalog";

export async function fulfillLpOrder(
  admin: SupabaseClient,
  input: { orderId: string; paymentProvider?: string; paymentRef?: string }
): Promise<{ ok: boolean }> {
  const { data: order } = await admin
    .from("lp_orders")
    .select("id, user_id, service_type, status")
    .eq("id", input.orderId)
    .maybeSingle();
  if (!order) return { ok: false };
  if (order.status === "paid") return { ok: true }; // idempotent (webhook retries)

  const now = new Date().toISOString();
  await admin
    .from("lp_orders")
    .update({ status: "superseded", updated_at: now })
    .eq("user_id", order.user_id)
    .eq("status", "paid");
  await admin
    .from("lp_orders")
    .update({
      status: "paid",
      paid_at: now,
      payment_provider: input.paymentProvider ?? null,
      payment_ref: input.paymentRef ?? null,
      updated_at: now,
    })
    .eq("id", order.id);

  const pack = getCoachPack(order.service_type);
  if (pack) {
    await admin
      .from("learner_profiles")
      .update({ journey_horizon_weeks: pack.weeks, updated_at: now })
      .eq("user_id", order.user_id);
  }
  return { ok: true };
}
