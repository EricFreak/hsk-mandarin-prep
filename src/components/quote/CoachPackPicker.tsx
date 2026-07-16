"use client";

import { useState } from "react";
import { COACH_PACKS } from "@/lib/lp/catalog";

function dollars(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

type PendingQuote = {
  orderId: string;
  creditLp: number;
  priceCents: number;
  packId: string;
};

export function CoachPackPicker() {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingQuote, setPendingQuote] = useState<PendingQuote | null>(null);

  async function buy(packId: string) {
    setBusy(packId);
    setError(null);
    setPendingQuote(null);
    try {
      const quoteRes = await fetch("/api/lp/quote", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ serviceType: packId }),
      });
      const quote = await quoteRes.json();
      if (!quoteRes.ok) throw new Error(quote.error ?? "quote_failed");
      // Replan credit applies to coach packs too (spec §8.3). When credit is
      // applied, the final price drops below the sticker — surface it instead
      // of silently redirecting, so the learner sees what they actually pay.
      if (quote.creditLp > 0) {
        setPendingQuote({
          orderId: quote.orderId,
          creditLp: quote.creditLp,
          priceCents: quote.priceCents,
          packId,
        });
        return;
      }
      await checkout(quote.orderId, packId);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  async function checkout(orderId: string, packId: string) {
    setBusy(packId);
    setError(null);
    try {
      const checkoutRes = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const checkout = await checkoutRes.json();
      if (!checkoutRes.ok) throw new Error(checkout.error ?? "checkout_failed");
      window.location.assign(checkout.url);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        {COACH_PACKS.map((pack) => {
          const pending = pendingQuote?.packId === pack.id ? pendingQuote : null;
          return (
            <div key={pack.id} className="surface-card p-5">
              <div className="font-display text-lg font-semibold text-ink">
                {pack.weeks} weeks
              </div>
              <div className="mt-1 font-display text-2xl font-bold text-ink">
                {dollars(pack.priceCents)}
              </div>
              <div className="mt-1 text-sm text-ink-muted">
                {pack.lpBudget} learning points · same rate as every plan
              </div>
              {pending ? (
                <div className="mt-4 rounded-lg border border-jade/30 bg-jade/5 p-3 text-sm text-ink">
                  <p className="text-jade">
                    Unspent credit applied: −{pending.creditLp} LP, you pay{" "}
                    {dollars(pending.priceCents)}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={busy !== null}
                      onClick={() =>
                        void checkout(pending.orderId, pending.packId)
                      }
                    >
                      {busy === pending.packId ? "Redirecting…" : "Continue to payment"}
                    </button>
                    <button
                      type="button"
                      className="btn-secondary disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={busy !== null}
                      onClick={() => setPendingQuote(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn-primary mt-4 w-full disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={busy !== null}
                  onClick={() => void buy(pack.id)}
                >
                  {busy === pack.id ? "Preparing…" : "Buy once"}
                </button>
              )}
            </div>
          );
        })}
      </div>
      {error ? (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      ) : null}
    </div>
  );
}
