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

function CardCtaFooter({ children }: { children: React.ReactNode }) {
  return <div className="mt-auto border-t border-mist/80 pt-6">{children}</div>;
}

const pricingCtaClass = {
  free: "flex w-full items-center justify-center rounded-xl border border-mist/90 bg-paper-dark px-4 py-3 text-sm font-semibold text-ink shadow-sm transition hover:border-jade/40 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade",
  pro: "flex w-full items-center justify-center rounded-xl bg-jade px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-jade/20 transition hover:bg-jade-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-jade disabled:cursor-not-allowed disabled:opacity-60",
} as const;

const PRO_BILLING_OPTIONS = [
  {
    id: "monthly" as const,
    label: "Monthly",
    price: "$9.99",
    period: "/month",
    hint: "Flexible billing",
    badge: null,
  },
  {
    id: "yearly" as const,
    label: "Yearly",
    price: "$69",
    period: "/year",
    hint: "Save about 42%",
    badge: "Best value",
  },
];

function ProBillingOptions({
  priceType,
  onChange,
}: {
  priceType: PriceType;
  onChange: (type: PriceType) => void;
}) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Pro billing period">
      {PRO_BILLING_OPTIONS.map((option) => {
        const selected = priceType === option.id;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.id)}
            className={`flex min-h-[6.75rem] flex-col rounded-xl border px-3 py-3 text-left transition ${
              selected
                ? "border-jade bg-jade/5 shadow-sm ring-1 ring-jade/25"
                : "border-mist bg-white hover:border-jade/25 hover:bg-paper-dark/40"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                {option.label}
              </span>
              {option.badge ? (
                <span className="rounded-full bg-jade/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-jade">
                  {option.badge}
                </span>
              ) : null}
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-display text-2xl font-semibold tabular-nums text-ink">
                {option.price}
              </span>
              <span className="text-sm text-ink-muted">{option.period}</span>
            </div>
            <p className={`mt-1 text-xs leading-snug ${option.badge ? "text-jade" : "text-ink-muted"}`}>
              {option.hint}
            </p>
          </button>
        );
      })}
    </div>
  );
}

type PricingPlansProps = {
  /** marketing: Pro CTA links to /pricing; checkout: Pro button starts payment */
  mode?: "marketing" | "checkout";
  defaultBilling?: PriceType;
  /** Auth-aware Free CTA (resolved on the server). */
  freeCtaHref?: string;
};

export default function PricingPlans({
  mode = "marketing",
  defaultBilling = "monthly",
  freeCtaHref = "/login?next=%2Fonboarding",
}: PricingPlansProps) {
  const [priceType, setPriceType] = useState<PriceType>(defaultBilling);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-display text-4xl font-semibold tabular-nums text-ink">$0</span>
            <span className="text-sm text-ink-muted">Forever</span>
          </div>
          <FeatureList features={FREE_TIER_BENEFITS} />
          <CardCtaFooter>
            <Link href={freeCtaHref} className={pricingCtaClass.free}>
              Start free Week 1
            </Link>
          </CardCtaFooter>
        </div>

        <div className="flex h-full flex-col rounded-2xl border border-jade bg-white p-6 shadow-lift ring-2 ring-jade/20 sm:p-8">
          <span className="text-xs font-semibold uppercase tracking-wide text-jade">
            Most popular
          </span>
          <h3 className="mt-1 font-display text-xl font-semibold text-ink">Pro</h3>
          <p className="mt-1 text-sm text-ink-muted">Same features — pick how you pay.</p>

          <ProBillingOptions priceType={priceType} onChange={setPriceType} />

          <FeatureList features={PRO_BENEFITS} />
          {error ? (
            <p className="mt-4 text-sm text-seal" role="alert">
              {error}
            </p>
          ) : null}
          <CardCtaFooter>
            {mode === "checkout" ? (
              <button
                type="button"
                className={pricingCtaClass.pro}
                disabled={loading}
                onClick={() => void handleCheckout()}
              >
                {loading ? "Redirecting…" : "Upgrade to Pro"}
              </button>
            ) : (
              <Link href={pricingHref} className={pricingCtaClass.pro}>
                Upgrade to Pro
              </Link>
            )}
          </CardCtaFooter>
        </div>
      </div>
    </div>
  );
}
