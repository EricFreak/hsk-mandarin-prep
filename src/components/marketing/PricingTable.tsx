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
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {TIERS.map((tier) => (
        <div
          key={tier.name}
          className={`relative flex flex-col rounded-lg border bg-white p-6 shadow-sm ${
            tier.highlighted
              ? "border-blue-600 ring-2 ring-blue-600"
              : "border-gray-200"
          }`}
        >
          {tier.badge ? (
            <span className="absolute -top-3 right-4 rounded-full bg-amber-100 px-3 py-0.5 text-xs font-medium text-amber-800">
              {tier.badge}
            </span>
          ) : null}
          {tier.highlighted ? (
            <span className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-600">
              Most popular
            </span>
          ) : null}
          <h3 className="text-lg font-semibold text-gray-900">{tier.name}</h3>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-bold text-gray-900">{tier.price}</span>
            {tier.period ? (
              <span className="text-sm text-gray-500">{tier.period}</span>
            ) : null}
          </div>
          <ul className="mt-6 flex-1 space-y-3">
            {tier.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
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
                {feature}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
