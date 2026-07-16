"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ServiceIntentStep,
  type ServiceIntent,
} from "@/components/onboarding/ServiceIntentStep";

export default function OnboardingForm({ returnHref }: { returnHref?: string }) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [serviceIntent, setServiceIntent] = useState<ServiceIntent | null>(null);
  const [examDate, setExamDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmUnsure, setConfirmUnsure] = useState(false);
  const [sprintFallback, setSprintFallback] = useState(false);

  const allowUnsure = serviceIntent === "coach";

  async function submitOnboarding(payload: {
    serviceIntent: ServiceIntent;
    examDate: string | null;
    unsure: boolean;
  }) {
    setLoading(true);
    setError(null);
    setConfirmUnsure(false);
    setSprintFallback(false);

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as {
        next?: string;
        error?: string;
      };

      if (!response.ok) {
        if (response.status === 422 && data.error === "not_sprint_eligible") {
          setSprintFallback(true);
          return;
        }
        setError(data.error ?? "Failed to save your exam date");
        return;
      }

      router.push(returnHref ?? data.next ?? "/diagnosis");
      router.refresh();
    } catch {
      setError("Failed to save your exam date");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!serviceIntent) {
      setError("Choose a service to continue.");
      return;
    }
    if (!examDate) {
      setError("Choose an exam date or select “I'm not sure”.");
      return;
    }

    void submitOnboarding({ serviceIntent, examDate, unsure: false });
  }

  function handleUnsure() {
    // Spec: never silently discard a filled date — ask for one beat.
    if (examDate && !confirmUnsure) {
      setConfirmUnsure(true);
      setError(null);
      return;
    }
    void submitOnboarding({
      serviceIntent: serviceIntent ?? "coach",
      examDate: null,
      unsure: true,
    });
  }

  function handleSprintFallback() {
    if (!serviceIntent) return;
    setServiceIntent("exam_custom");
    void submitOnboarding({
      serviceIntent: "exam_custom",
      examDate: examDate || null,
      unsure: false,
    });
  }

  const minDate = new Date().toISOString().slice(0, 10);

  if (step === 1) {
    return (
      <div className="mx-auto max-w-lg">
        <p className="section-eyebrow">Getting started</p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-ink">
          How do you want to prepare?
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Pick a service and we&apos;ll tailor your study journey. You can change
          your plan later.
        </p>

        <div className="mt-8">
          <ServiceIntentStep
            value={serviceIntent}
            onSelect={(intent) => {
              setServiceIntent(intent);
              setError(null);
              setStep(2);
            }}
          />
        </div>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <p className="section-eyebrow">Getting started</p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-ink">
        When is your HSK Level 3 exam?
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
            lang="en"
            min={minDate}
            value={examDate}
            onChange={(event) => {
              setExamDate(event.target.value);
              setConfirmUnsure(false);
              setSprintFallback(false);
            }}
            className="input-field mt-2"
          />
        </div>

        {confirmUnsure ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-ink">
            <p>
              You already chose <span className="font-medium">{examDate}</span>.
              Continue without an exam date and use a 12-week plan instead?
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  void submitOnboarding({
                    serviceIntent: serviceIntent ?? "coach",
                    examDate: null,
                    unsure: true,
                  })
                }
                className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                Yes, I&apos;m not sure
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => setConfirmUnsure(false)}
                className="btn-secondary disabled:cursor-not-allowed disabled:opacity-60"
              >
                Keep my date
              </button>
            </div>
          </div>
        ) : null}

        {sprintFallback ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-ink">
            <p>
              Your exam is more than 6 days away — the Custom exam plan fits
              better.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={handleSprintFallback}
                className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                Switch to Custom exam plan
              </button>
            </div>
          </div>
        ) : null}

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={loading || !examDate}
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Saving..." : "Continue to diagnosis"}
          </button>
          {allowUnsure ? (
            <button
              type="button"
              disabled={loading}
              onClick={handleUnsure}
              className="btn-secondary disabled:cursor-not-allowed disabled:opacity-60"
            >
              I&apos;m not sure
            </button>
          ) : null}
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setStep(1);
              setError(null);
              setConfirmUnsure(false);
              setSprintFallback(false);
            }}
            className="btn-secondary disabled:cursor-not-allowed disabled:opacity-60"
          >
            Back
          </button>
        </div>
      </form>
    </div>
  );
}
