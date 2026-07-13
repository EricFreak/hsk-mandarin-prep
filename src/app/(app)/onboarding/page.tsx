"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const [examDate, setExamDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitOnboarding(payload: {
    examDate: string | null;
    unsure: boolean;
  }) {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { next?: string; error?: string };

      if (!response.ok) {
        setError(data.error ?? "Failed to save your exam date");
        return;
      }

      router.push(data.next ?? "/placement");
      router.refresh();
    } catch {
      setError("Failed to save your exam date");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!examDate) {
      setError("Choose an exam date or select “I'm not sure”.");
      return;
    }

    void submitOnboarding({ examDate, unsure: false });
  }

  function handleUnsure() {
    void submitOnboarding({ examDate: null, unsure: true });
  }

  const minDate = new Date().toISOString().slice(0, 10);

  return (
    <div className="mx-auto max-w-lg">
      <p className="section-eyebrow">Getting started</p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-ink">
        When is your HSK 3 exam?
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        We use your exam date to build a personalized study journey. If you
        are not sure yet, we will plan a 12-week horizon.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="surface-card p-6">
          <label htmlFor="exam-date" className="text-sm font-medium text-ink">
            Exam date
          </label>
          <input
            id="exam-date"
            type="date"
            min={minDate}
            value={examDate}
            onChange={(event) => setExamDate(event.target.value)}
            className="input-field mt-2"
          />
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={loading || !examDate}
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Saving..." : "Continue to placement"}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleUnsure}
            className="btn-secondary disabled:cursor-not-allowed disabled:opacity-60"
          >
            I&apos;m not sure
          </button>
        </div>
      </form>
    </div>
  );
}
