import { describe, it, expect, vi } from "vitest";
import { fulfillLpOrder } from "@/lib/lp/fulfill-order";

type Row = Record<string, unknown>;

/** Minimal chainable supabase stub recording updates. */
function makeAdminStub(order: Row | null) {
  const updates: { table: string; values: Row; filters: Row }[] = [];
  const client = {
    from(table: string) {
      const filters: Row = {};
      const builder: any = {
        select: () => builder,
        update(values: Row) {
          builder._update = values;
          return builder;
        },
        eq(col: string, val: unknown) {
          filters[col] = val;
          if (builder._update) {
            // terminal for update chains in our usage
            updates.push({ table, values: builder._update, filters: { ...filters } });
          }
          return builder;
        },
        maybeSingle: async () => ({ data: order, error: null }),
        then: (resolve: (v: unknown) => void) => resolve({ data: null, error: null }),
      };
      return builder;
    },
  };
  return { client: client as any, updates };
}

describe("fulfillLpOrder", () => {
  it("marks quoted order paid and supersedes previous paid orders", async () => {
    const { client, updates } = makeAdminStub({
      id: "o1", user_id: "u1", service_type: "exam_custom", status: "quoted",
    });
    const result = await fulfillLpOrder(client, { orderId: "o1", paymentRef: "cs_123" });
    expect(result.ok).toBe(true);
    const paid = updates.find((u) => u.values.status === "paid");
    expect(paid?.filters.id).toBe("o1");
    const superseded = updates.find((u) => u.values.status === "superseded");
    expect(superseded?.filters.user_id).toBe("u1");
  });

  it("is idempotent for already-paid orders", async () => {
    const { client, updates } = makeAdminStub({
      id: "o1", user_id: "u1", service_type: "sprint", status: "paid",
    });
    expect((await fulfillLpOrder(client, { orderId: "o1" })).ok).toBe(true);
    expect(updates).toHaveLength(0);
  });

  it("syncs journey horizon for coach packs", async () => {
    const { client, updates } = makeAdminStub({
      id: "o2", user_id: "u1", service_type: "coach_8w", status: "quoted",
    });
    await fulfillLpOrder(client, { orderId: "o2" });
    const horizon = updates.find((u) => u.table === "learner_profiles");
    expect(horizon?.values.journey_horizon_weeks).toBe(8);
  });

  it("fails cleanly on unknown order", async () => {
    const { client } = makeAdminStub(null);
    expect((await fulfillLpOrder(client, { orderId: "nope" })).ok).toBe(false);
  });
});
