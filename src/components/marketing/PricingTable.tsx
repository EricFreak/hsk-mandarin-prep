type Tier = {
  name: string;
  price: string;
  period?: string;
  badge?: string;
  features: string[];
  highlighted?: boolean;
};

const TIERS: Tier[] = [
  {
    name: "Free",
    price: "$0",
    features: [
      "SRS flashcards (HSK 1–3)",
      "20 practice questions per day",
      "1 free mock exam with score",
      "Weakness summary report",
    ],
  },
  {
    name: "Pro",
    price: "$8–12",
    period: "/month",
    features: [
      "Unlimited AI practice",
      "All mock exams",
      "AI writing score",
      "Detailed weakness report",
      "Mistake review bank",
    ],
    highlighted: true,
  },
  {
    name: "HSK 3 Course Pack",
    price: "$29–49",
    period: "one-time",
    badge: "Coming soon",
    features: [
      "10–20 curated core lessons",
      "Flagship HSK 3 study path",
      "Lifetime access",
    ],
  },
];

export default function PricingTable() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {TIERS.map((tier) => (
        <div
          key={tier.name}
          className={`relative flex flex-col rounded-2xl border p-6 ${
            tier.highlighted
              ? "border-seal bg-white shadow-lift ring-2 ring-seal/20"
              : "border-mist bg-paper-dark/30 shadow-card"
          }`}
        >
          {tier.badge ? (
            <span className="absolute -top-3 right-4 rounded-full bg-jade/10 px-3 py-0.5 text-xs font-semibold text-jade">
              {tier.badge}
            </span>
          ) : null}
          {tier.highlighted ? (
            <span className="mb-2 text-xs font-semibold uppercase tracking-wide text-seal">
              Most popular
            </span>
          ) : null}
          <h3 className="font-display text-xl font-semibold text-ink">{tier.name}</h3>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-display text-4xl font-semibold text-ink">
              {tier.price}
            </span>
            {tier.period ? (
              <span className="text-sm text-ink-muted">{tier.period}</span>
            ) : null}
          </div>
          <ul className="mt-6 flex-1 space-y-3">
            {tier.features.map((feature) => (
              <li
                key={feature}
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
                {feature}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
