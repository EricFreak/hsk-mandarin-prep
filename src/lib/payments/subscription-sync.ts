import { createAdminClient } from "@/lib/supabase/admin";

export async function setUserPlan(
  userId: string,
  plan: "free" | "pro",
  billingCustomerId?: string | null,
) {
  const supabase = createAdminClient();
  if (!supabase) {
    throw new Error("Supabase admin client is not configured");
  }

  const update: { plan: "free" | "pro"; stripe_customer_id?: string } = {
    plan,
  };

  if (billingCustomerId) {
    update.stripe_customer_id = billingCustomerId;
  }

  const { error } = await supabase
    .from("profiles")
    .update(update)
    .eq("id", userId);

  if (error) {
    throw error;
  }
}

export async function setPlanByCustomerId(
  customerId: string,
  plan: "free" | "pro",
) {
  const supabase = createAdminClient();
  if (!supabase) {
    throw new Error("Supabase admin client is not configured");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ plan })
    .eq("stripe_customer_id", customerId);

  if (error) {
    throw error;
  }
}

export function resolveUserIdFromMetadata(
  metadata: Record<string, unknown> | null | undefined,
): string | null {
  if (!metadata) {
    return null;
  }

  const userId = metadata.userId;
  if (typeof userId === "string" && userId.length > 0) {
    return userId;
  }

  const referenceId = metadata.referenceId;
  if (typeof referenceId === "string" && referenceId.length > 0) {
    return referenceId;
  }

  return null;
}

export function resolveCustomerId(value: unknown): string | null {
  if (typeof value === "string" && value.length > 0) {
    return value;
  }

  if (value && typeof value === "object" && "id" in value) {
    const id = (value as { id?: unknown }).id;
    if (typeof id === "string" && id.length > 0) {
      return id;
    }
  }

  return null;
}
