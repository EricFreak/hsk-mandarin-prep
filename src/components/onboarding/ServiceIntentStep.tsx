"use client";

export type ServiceIntent = "coach" | "exam_custom" | "sprint";

const OPTIONS: { id: ServiceIntent; title: string; description: string }[] = [
  {
    id: "coach",
    title: "Coach package",
    description:
      "A fixed 4/8/12-week program. We plan everything from your diagnosis.",
  },
  {
    id: "exam_custom",
    title: "Custom exam plan",
    description:
      "You set the skill mix and volume for your exam date. We check it's achievable.",
  },
  {
    id: "sprint",
    title: "Emergency sprint",
    description:
      "Exam within 6 days? Get a focused rescue plan. First sprint is free.",
  },
];

export function ServiceIntentStep(props: {
  value: ServiceIntent | null;
  onSelect: (intent: ServiceIntent) => void;
}) {
  return (
    <div className="grid gap-3">
      {OPTIONS.map((opt) => {
        const selected = props.value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => props.onSelect(opt.id)}
            aria-pressed={selected}
            className={`rounded-xl border p-4 text-left transition ${
              selected
                ? "border-jade bg-jade/5 shadow-sm ring-1 ring-jade/25"
                : "border-mist bg-white hover:border-jade/25 hover:bg-paper-dark/40"
            }`}
          >
            <div className="font-semibold text-ink">{opt.title}</div>
            <div className="mt-1 text-sm text-ink-muted">{opt.description}</div>
          </button>
        );
      })}
    </div>
  );
}
