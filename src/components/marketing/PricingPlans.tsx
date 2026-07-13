"use client";

import Link from "next/link";
import { useState } from "react";
import { FREE_TIER_BENEFITS, PRO_BENEFITS, type PriceType } from "@/lib/payments";

function CheckIcon() {
  return (
    <svg
      className="mt-0.5 h-4 w-4 shrink-0 text-jade"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function BillingToggle({
  priceType,
  onChange,
  className = "",
}: {
  priceType: PriceType;
  onChange: (type: PriceType) => void;
  className?: string;
}) {
  return (
    <div
      className={`flex rounded-lg border border-mist bg-paper-dark p-0.5 ${className}`}
      role="group"
      aria-label="Pro billing period"
    >
      <button
        type="button"
        className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${
          priceType === "monthly" ? "bg-jade text-white" : "text-ink-muted hover:text-ink"
        }`}
        onClick={() => onChange("monthly")}
      >
        Monthly
      </button>
      <button
        type="button"
        className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${
          priceType === "yearly" ? "bg-jade text-white" : "text-ink-muted hover:text-ink"
        }`}
        onClick={() => onChange("yearly")}
      >
        Yearly
      </button>
    </div>
  );
}

function FeatureList({ features }: { features: readonly string[] }) {
  return (
    <ul className="mt-6 flex-1 space-y-3">
      {features.map((feature) => (
        <li key={feature} className="flex items-start gap-2 text-sm text-ink-muted">
          <CheckIcon />
          {feature}
        </li>
      ))}
    </ul>
  );
}

type PricingPlansProps = {
  /** marketing: Pro CTA links to /pricing; checkout: Pro button starts payment */
  mode?: "marketing" | "checkout";
  defaultBilling?: PriceType;
};

export default function PricingPlans({
  mode = "marketing",
  defaultBilling = "monthly",
}: PricingPlansProps) {
  const [priceType, setPriceType] = useState<PriceType>(defaultBilling);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const proPrice = priceType === "monthly" ? "$9.99" : "$69";
  const proPeriod = priceType === "monthly" ? "/month" : "/year";
  const pricingHref =
    priceType === "yearly" ? "/pricing?billing=yearly" : "/pricing";

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
    <div className="mx-auto max-w-4xl">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex h-full flex-col rounded-2xl border border-mist bg-white p-6 shadow-card sm:p-8">
          <h3 className="font-display text-xl font-semibold text-ink">Free</h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-4xl font-semibold tabular-nums text-ink">$0</span>
            <span className="text-sm text-ink-muted">Forever</span>
          </div>
          <FeatureList features={FREE_TIER_BENEFITS} />
          <Link
            href="/login?next=%2Fmock-exam"
            className="mt-auto block w-full btn-secondary py-3 pt-6 text-center text-base font-semibold"
          >
            Start free mock exam
          </Link>
        </div>

        <div className="flex h-full flex-col rounded-2xl border border-jade bg-white p-6 shadow-lift ring-2 ring-jade/20 sm:p-8">
          <span className="text-xs font-semibold uppercase tracking-wide text-jade">
            Most popular
          </span>
          <h3 className="mt-1 font-display text-xl font-semibold text-ink">Pro</h3>

          <div className="mt-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
              Pro billing
            </p>
            <BillingToggle
              className="mt-1.5 w-full"
              priceType={priceType}
              onChange={setPriceType}
            />
          </div>

          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="inline-block min-w-[5.5rem] font-display text-4xl font-semibold tabular-nums text-ink">
                {proPrice}
              </span>
              <span className="text-sm text-ink-muted">{proPeriod}</span>
            </div>
            <p className="mt-1 min-h-[1.25rem] text-sm leading-snug text-jade">
              {priceType === "yearly" ? "Save about 42% vs monthly billing" : "\u00A0"}
            </p>
          </div>

          <FeatureList features={PRO_BENEFITS} />
          {error ? (
            <p className="mt-4 text-sm text-seal" role="alert">
              {error}
            </p>
          ) : null}
          {mode === "checkout" ? (
            <button
              type="button"
              className="mt-auto w-full btn-primary py-3 pt-6 text-base disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading}
              onClick={() => void handleCheckout()}
            >
              {loading ? "Redirecting…" : "Upgrade to Pro"}
            </button>
          ) : (
            <Link
              href={pricingHref}
              className="mt-auto block w-full btn-primary py-3 pt-6 text-center text-base font-semibold"
            >
              View Pro plans
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
