import { describe, it, expect } from "vitest";
import { fulfillLpOrder } from "@/lib/lp/fulfill-order";

type Row = Record<string, unknown>;

/** Minimal chainable supabase stub recording updates. */
function makeAdminStub(
  order: Row | null,
  options?: { updateErrors?: unknown[] },
) {
  const updates: { table: string; values: Row; filters: Row }[] = [];
  let updateIndex = 0;
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
          return builder;
        },
        maybeSingle: async () => ({ data: order, error: null }),
        then: (resolve: (v: unknown) => void) => {
          if (builder._update) {
            const idx = updateIndex++;
            const error = options?.updateErrors?.[idx] ?? null;
            updates.push({ table, values: builder._update, filters: { ...filters } });
            resolve({ data: null, error });
          } else {
            resolve({ data: null, error: null });
          }
        },
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
    expect(superseded?.filters).toEqual({ user_id: "u1", status: "paid" });
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

  it("returns ok false when supersede update fails", async () => {
    const { client, updates } = makeAdminStub(
      { id: "o1", user_id: "u1", service_type: "exam_custom", status: "quoted" },
      { updateErrors: [{ message: "supersede failed" }] },
    );
    const result = await fulfillLpOrder(client, { orderId: "o1" });
    expect(result.ok).toBe(false);
    expect(updates.find((u) => u.values.status === "paid")).toBeUndefined();
  });

  it("returns ok false when paid update fails", async () => {
    const { client, updates } = makeAdminStub(
      { id: "o1", user_id: "u1", service_type: "exam_custom", status: "quoted" },
      { updateErrors: [null, { message: "paid failed" }] },
    );
    const result = await fulfillLpOrder(client, { orderId: "o1" });
    expect(result.ok).toBe(false);
    expect(updates.find((u) => u.values.status === "paid")).toBeDefined();
  });

  it("returns ok false when coach horizon update fails", async () => {
    const { client, updates } = makeAdminStub(
      { id: "o2", user_id: "u1", service_type: "coach_8w", status: "quoted" },
      { updateErrors: [null, null, { message: "horizon failed" }] },
    );
    const result = await fulfillLpOrder(client, { orderId: "o2" });
    expect(result.ok).toBe(false);
    expect(updates.find((u) => u.table === "learner_profiles")).toBeDefined();
  });
});
