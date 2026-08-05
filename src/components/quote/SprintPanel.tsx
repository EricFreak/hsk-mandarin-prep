"use client";

import { useState } from "react";

export function SprintPanel(props: { freeUsed: boolean }) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function start() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/sprint/start", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(
          data.error === "not_sprint_eligible"
            ? "Sprint is for exams within 6 days. Try the Custom exam plan instead."
            : data.error === "active_package_exists"
              ? "You already have an active package — starting a sprint would replace it. Contact support or finish your package first."
              : "Something went wrong. Please try again.",
        );
        return;
      }
      if (data.started) {
        window.location.assign("/dashboard");
        return;
      }
      const checkoutRes = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderId: data.orderId }),
      });
      const checkout = await checkoutRes.json();
      if (!checkoutRes.ok) throw new Error(checkout.error ?? "checkout_failed");
      window.location.assign(checkout.url);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="surface-card p-6">
      <h2 className="font-display text-lg font-semibold text-ink">
        Emergency sprint
      </h2>
      <p className="mt-2 text-sm text-ink-muted">
        {props.freeUsed
          ? "You've used your free sprint. This one is priced by workload at the same rate as every plan — no urgency premium."
          : "Your first sprint is completely free: diagnosis, full report, and the whole rescue plan."}
      </p>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      <button
        type="button"
        className="btn-primary mt-4 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={busy}
        onClick={() => void start()}
      >
        {busy
          ? "Starting…"
          : props.freeUsed
            ? "Get sprint quote"
            : "Start free sprint"}
      </button>
    </div>
  );
}
