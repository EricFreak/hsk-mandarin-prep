"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { PRO_BENEFITS, type PriceType } from "@/lib/payments";

type UpgradeModalProps = {
  open: boolean;
  onClose: () => void;
  defaultPriceType?: PriceType;
};

export default function UpgradeModal({
  open,
  onClose,
  defaultPriceType = "monthly",
}: UpgradeModalProps) {
  const [priceType, setPriceType] = useState<PriceType>(defaultPriceType);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setPriceType(defaultPriceType);
      setError(null);
      panelRef.current?.focus();
    }
  }, [open, defaultPriceType]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const handleUpgrade = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceType }),
      });

      const data = (await response.json()) as { url?: string; error?: string };

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
  }, [priceType]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-ink/50"
        aria-label="Close upgrade modal"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative z-10 w-full max-w-md rounded-2xl border border-mist bg-white p-6 shadow-lift outline-none"
      >
        <button
          type="button"
          className="absolute right-4 top-4 text-ink-muted hover:text-ink"
          aria-label="Close"
          onClick={onClose}
        >
          ×
        </button>

        <p className="section-eyebrow">HSK Mandarin Prep Pro</p>
        <h2
          id="upgrade-modal-title"
          className="mt-2 font-display text-xl font-semibold text-ink"
        >
          Unlock unlimited prep
        </h2>
        <p className="mt-2 text-sm text-ink-muted">
          Upgrade to Pro for unlimited practice, all mock exams, and AI writing
          feedback.
        </p>

        <ul className="mt-6 space-y-2">
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

        <div className="mt-6 flex rounded-xl border border-mist p-1">
          <button
            type="button"
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
              priceType === "monthly"
                ? "bg-jade text-white"
                : "text-ink-muted hover:text-ink"
            }`}
            onClick={() => setPriceType("monthly")}
          >
            Monthly — $9.99
          </button>
          <button
            type="button"
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
              priceType === "yearly"
                ? "bg-jade text-white"
                : "text-ink-muted hover:text-ink"
            }`}
            onClick={() => setPriceType("yearly")}
          >
            Yearly — $69
          </button>
        </div>

        {error ? (
          <p className="mt-4 text-sm text-seal" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="button"
          className="mt-4 w-full btn-primary disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading}
          onClick={() => void handleUpgrade()}
        >
          {loading ? "Redirecting…" : "Upgrade to Pro"}
        </button>

        <p className="mt-4 text-center text-sm text-ink-muted">
          <Link href="/pricing" className="text-link">
            View full pricing
          </Link>
        </p>
      </div>
    </div>
  );
}
