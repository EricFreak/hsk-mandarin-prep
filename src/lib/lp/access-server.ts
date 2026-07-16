import type { SupabaseClient } from "@supabase/supabase-js";
import type { Plan } from "@/lib/entitlements";
import { resolveAccessSource, type AccessSource } from "./access";

export async function fetchAccess(
  supabase: SupabaseClient,
  userId: string
): Promise<AccessSource | null> {
  const [profileRes, orderRes] = await Promise.all([
    supabase.from("profiles").select("plan").eq("id", userId).maybeSingle(),
    supabase
      .from("lp_orders")
      .select("price_cents")
      .eq("user_id", userId)
      .eq("status", "paid")
      .maybeSingle(),
  ]);
  const plan: Plan = profileRes.data?.plan === "pro" ? "pro" : "free";
  const order = orderRes.data ? { priceCents: orderRes.data.price_cents } : null;
  return resolveAccessSource({ plan, activePaidOrder: order });
}
