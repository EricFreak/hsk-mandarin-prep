"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PRO_BENEFITS } from "@/lib/payments";

/** Legacy billing-period toggle state — kept visual until Task 16 redoes the pricing UI. */
type BillingPeriod = "monthly" | "yearly";

type UpgradeModalProps = {
  open: boolean;
  onClose: () => void;
  defaultBilling?: BillingPeriod;
};

export default function UpgradeModal({
  open,
  onClose,
  defaultBilling = "monthly",
}: UpgradeModalProps) {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>(defaultBilling);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setBillingPeriod(defaultBilling);
      panelRef.current?.focus();
    }
  }, [open, defaultBilling]);

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

        <p className="section-eyebrow">HSK Prep Pro</p>
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
              billingPeriod === "monthly"
                ? "bg-jade text-white"
                : "text-ink-muted hover:text-ink"
            }`}
            onClick={() => setBillingPeriod("monthly")}
          >
            Monthly — $9.99
          </button>
          <button
            type="button"
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
              billingPeriod === "yearly"
                ? "bg-jade text-white"
                : "text-ink-muted hover:text-ink"
            }`}
            onClick={() => setBillingPeriod("yearly")}
          >
            Yearly — $69
          </button>
        </div>

        <Link
          href="/pricing"
          className="mt-4 w-full btn-primary"
        >
          Upgrade to Pro
        </Link>

        <p className="mt-4 text-center text-sm text-ink-muted">
          <Link href="/pricing" className="text-link">
            View full pricing
          </Link>
        </p>
      </div>
    </div>
  );
}
