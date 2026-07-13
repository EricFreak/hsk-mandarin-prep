"use client";

import Link from "next/link";
import { useState } from "react";
import { PRO_BENEFITS, type PriceType } from "@/lib/payments";

export default function PricingCheckout() {
  const [priceType, setPriceType] = useState<PriceType>("monthly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceType }),
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (response.status === 401) {
        window.location.href = `/login?next=${encodeURIComponent("/pricing")}`;
        return;
      }

      if (!response.ok) {
        setError(data.error ?? "Checkout failed");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      setError("Checkout failed");
    } catch {
      setError("Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-2">
      <div className="order-2 lg:order-1">
        <div className="flex rounded-xl border border-mist bg-white p-1 shadow-card">
          <button
            type="button"
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
              priceType === "monthly"
                ? "bg-jade text-white"
                : "text-ink-muted hover:text-ink"
            }`}
            onClick={() => setPriceType("monthly")}
          >
            Monthly
          </button>
          <button
            type="button"
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
              priceType === "yearly"
                ? "bg-jade text-white"
                : "text-ink-muted hover:text-ink"
            }`}
            onClick={() => setPriceType("yearly")}
          >
            Yearly
          </button>
        </div>

        <div className="mt-6 rounded-2xl border border-jade bg-white p-8 shadow-lift ring-2 ring-jade/20">
          <p className="text-xs font-semibold uppercase tracking-wide text-jade">
            Most popular
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold text-ink">Pro</h2>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-4xl font-semibold text-ink">
              {priceType === "monthly" ? "$9.99" : "$69"}
            </span>
            <span className="text-sm text-ink-muted">
              {priceType === "monthly" ? "/month" : "/year"}
            </span>
          </div>
          {priceType === "yearly" ? (
            <p className="mt-2 text-sm text-jade">Save about 42% vs monthly billing</p>
          ) : null}

          <ul className="mt-6 space-y-3">
            {PRO_BENEFITS.map((benefit) => (
              <li
                key={benefit}
                className="flex items-start gap-2 text-sm text-ink-muted"
              >
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-jade"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {benefit}
              </li>
            ))}
          </ul>

          {error ? (
            <p className="mt-4 text-sm text-seal" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="button"
            className="mt-6 w-full btn-primary py-3 text-base disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
            onClick={() => void handleCheckout()}
          >
            {loading ? "Redirecting…" : "Upgrade to Pro"}
          </button>
        </div>
      </div>

      <div className="order-1 lg:order-2">
        <div className="surface-card p-8">
          <h3 className="font-display text-xl font-semibold text-ink">Free</h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-4xl font-semibold text-ink">$0</span>
            <span className="text-sm text-ink-muted">Forever</span>
          </div>
          <ul className="mt-6 space-y-3 text-sm text-ink-muted">
            <li>SRS flashcards (HSK 3.0 vocabulary)</li>
            <li>20 practice questions per day</li>
            <li>1 free mock exam with score</li>
            <li>Weakness summary report</li>
          </ul>
          <Link href="/mock-exam" className="mt-6 inline-flex w-full btn-secondary py-3 text-base">
            Start free mock exam
          </Link>
        </div>
      </div>
    </div>
  );
}
