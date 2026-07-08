"use client";

import Link from "next/link";
import { useState } from "react";
import { PRO_BENEFITS, type PriceType } from "@/lib/stripe";

export default function PricingCheckout() {
  const [priceType, setPriceType] = useState<PriceType>("monthly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/checkout", {
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
    <div className="mx-auto max-w-lg">
      <div className="flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
        <button
          type="button"
          className={`flex-1 rounded-md px-4 py-2.5 text-sm font-medium ${
            priceType === "monthly"
              ? "bg-blue-600 text-white"
              : "text-gray-600 hover:text-gray-900"
          }`}
          onClick={() => setPriceType("monthly")}
        >
          Monthly
        </button>
        <button
          type="button"
          className={`flex-1 rounded-md px-4 py-2.5 text-sm font-medium ${
            priceType === "yearly"
              ? "bg-blue-600 text-white"
              : "text-gray-600 hover:text-gray-900"
          }`}
          onClick={() => setPriceType("yearly")}
        >
          Yearly
        </button>
      </div>

      <div className="mt-8 rounded-xl border border-blue-600 bg-white p-8 shadow-sm ring-2 ring-blue-600">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
          Pro
        </p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-4xl font-bold text-gray-900">
            {priceType === "monthly" ? "$9.99" : "$69"}
          </span>
          <span className="text-sm text-gray-500">
            {priceType === "monthly" ? "/month" : "/year"}
          </span>
        </div>
        {priceType === "yearly" ? (
          <p className="mt-2 text-sm text-green-700">
            Save about 42% vs monthly billing
          </p>
        ) : null}

        <ul className="mt-6 space-y-3">
          {PRO_BENEFITS.map((benefit) => (
            <li
              key={benefit}
              className="flex items-start gap-2 text-sm text-gray-700"
            >
              <svg
                className="mt-0.5 h-4 w-4 shrink-0 text-green-500"
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
          <p className="mt-4 text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="button"
          className="mt-6 w-full rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading}
          onClick={() => void handleCheckout()}
        >
          {loading ? "Redirecting…" : "Upgrade to Pro"}
        </button>
      </div>

      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">Free</h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-4xl font-bold text-gray-900">$0</span>
        </div>
        <ul className="mt-6 space-y-3 text-sm text-gray-600">
          <li>SRS flashcards (HSK 1–3)</li>
          <li>20 practice questions per day</li>
          <li>1 free mock exam with score</li>
          <li>Weakness summary report</li>
        </ul>
        <Link
          href="/mock-exam"
          className="mt-6 inline-flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-900 hover:bg-gray-50"
        >
          Start free
        </Link>
      </div>
    </div>
  );
}
