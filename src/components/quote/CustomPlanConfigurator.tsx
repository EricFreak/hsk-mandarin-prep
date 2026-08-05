"use client";

import { useMemo, useState } from "react";
import {
  EMPTY_COMPOSITION,
  computeQuote,
  type LpComposition,
} from "@/lib/lp/pricing";
import {
  estimateMinutes,
  DEFAULT_MINUTES_PER_DAY,
} from "@/lib/lp/feasibility";
import { daysUntilExam } from "@/lib/lp/sprint";

const FIELDS: { key: keyof LpComposition; label: string; step: number }[] = [
  { key: "vocabulary", label: "Vocabulary drills", step: 10 },
  { key: "grammar", label: "Grammar drills", step: 10 },
  { key: "listening", label: "Listening questions", step: 5 },
  { key: "reading", label: "Reading passage sets", step: 2 },
  { key: "writingReview", label: "Writing + AI review", step: 1 },
  { key: "mockSection", label: "Mock sections + report", step: 1 },
];

type ServerQuote = {
  orderId: string;
  lpTotal: number;
  priceCents: number;
  creditLp: number;
};

export function CustomPlanConfigurator(props: {
  examDate: string | null;
  minutesPerDay: number | null;
}) {
  const [composition, setComposition] = useState<LpComposition>({
    ...EMPTY_COMPOSITION,
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [quote, setQuote] = useState<ServerQuote | null>(null);

  const liveQuote = useMemo(() => computeQuote(composition), [composition]);
  const totalMinutes = useMemo(() => estimateMinutes(composition), [composition]);
  const days = props.examDate
    ? Math.max(1, daysUntilExam(new Date().toISOString().slice(0, 10), props.examDate))
    : null;
  const perDay = props.minutesPerDay ?? DEFAULT_MINUTES_PER_DAY;
  const overloaded = days !== null && totalMinutes > days * perDay;

  function resetQuote() {
    setQuote(null);
  }

  async function getQuote() {
    setBusy(true);
    setError(null);
    try {
      const quoteRes = await fetch("/api/lp/quote", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ serviceType: "exam_custom", composition }),
      });
      const data = await quoteRes.json();
      if (quoteRes.status === 422 && data.error === "not_feasible") {
        setError(
          `This plan needs ~${data.requiredMinutesPerDay} min/day — beyond your available time before the exam (about ${data.capacityMinutes} min total). Reduce the volume or change your exam date — we never trim your plan silently.`,
        );
        return;
      }
      if (quoteRes.status === 422 && data.error === "exam_date_required") {
        setError(
          "You haven't set an exam date yet. Set one to build a custom plan.",
        );
        return;
      }
      if (!quoteRes.ok) throw new Error(data.error ?? "quote_failed");
      setQuote({
        orderId: data.orderId,
        lpTotal: data.lpTotal,
        priceCents: data.priceCents,
        creditLp: data.creditLp ?? 0,
      });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function checkout() {
    if (!quote) return;
    setBusy(true);
    setError(null);
    try {
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
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="grid gap-3">
        {FIELDS.map((f) => (
          <label
            key={f.key}
            className="flex items-center justify-between gap-4 text-sm text-ink"
          >
            <span>{f.label}</span>
            <input
              type="number"
              min={0}
              step={f.step}
              value={composition[f.key]}
              onChange={(e) => {
                setComposition((c) => ({
                  ...c,
                  [f.key]: Math.max(0, Number(e.target.value) || 0),
                }));
                resetQuote();
              }}
              className="input-field w-24 text-right"
            />
          </label>
        ))}
      </div>

      <div className="mt-4 rounded-xl bg-paper-dark/60 p-4">
        <div className="font-display text-xl font-bold text-ink">
          Total: ${(liveQuote.priceCents / 100).toFixed(2)}
        </div>
        <div className="mt-1 text-sm text-ink-muted">
          {liveQuote.lpTotal} learning points · ~{Math.round(totalMinutes)} min
          of work
          {days !== null &&
            ` · ~${Math.ceil(totalMinutes / days)} min/day until your exam`}
        </div>
        {overloaded ? (
          <div className="mt-2 text-sm text-amber-700">
            This looks heavier than {perDay} min/day. You can still request a
            quote — we&apos;ll confirm feasibility, never trim silently.
          </div>
        ) : null}
      </div>

      {quote ? (
        <div className="mt-4 rounded-xl border border-jade/30 bg-jade/5 p-4">
          <div className="font-display text-lg font-semibold text-ink">
            Your quote: ${(quote.priceCents / 100).toFixed(2)}
          </div>
          <div className="mt-1 text-sm text-ink-muted">
            {quote.lpTotal} learning points
          </div>
          {quote.creditLp > 0 ? (
            <div className="mt-1 text-sm text-jade">
              {quote.creditLp} LP credit applied from your current plan
            </div>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
              disabled={busy}
              onClick={() => void checkout()}
            >
              {busy ? "Preparing checkout…" : "Continue to checkout"}
            </button>
            <button
              type="button"
              className="btn-secondary disabled:cursor-not-allowed disabled:opacity-60"
              disabled={busy}
              onClick={resetQuote}
            >
              Adjust
            </button>
          </div>
        </div>
      ) : null}

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      {!quote ? (
        <button
          type="button"
          className="btn-primary mt-4 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={busy || liveQuote.lpTotal === 0}
          onClick={() => void getQuote()}
        >
          {busy ? "Preparing quote…" : "Get my one-time quote"}
        </button>
      ) : null}
    </div>
  );
}
