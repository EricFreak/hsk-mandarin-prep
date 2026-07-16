"use client";

import { useState } from "react";
import { COACH_PACKS } from "@/lib/lp/catalog";

function dollars(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function CoachPackPicker() {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function buy(packId: string) {
    setBusy(packId);
    setError(null);
    try {
      const quoteRes = await fetch("/api/lp/quote", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ serviceType: packId }),
      });
      const quote = await quoteRes.json();
      if (!quoteRes.ok) throw new Error(quote.error ?? "quote_failed");
      const checkoutRes = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderId: quote.orderId }),
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
        {COACH_PACKS.map((pack) => (
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
            <button
              type="button"
              className="btn-primary mt-4 w-full"
              disabled={busy !== null}
              onClick={() => void buy(pack.id)}
            >
              {busy === pack.id ? "Redirecting…" : "Buy once"}
            </button>
          </div>
        ))}
      </div>
      {error ? (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      ) : null}
    </div>
  );
}
