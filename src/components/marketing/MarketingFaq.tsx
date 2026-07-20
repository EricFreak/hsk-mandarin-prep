import Link from "next/link";

/**
 * FAQ — operational boundaries only.
 * Free-chain content lives in Before you pay; do not restate the full list here.
 * Plan taxonomy lives on /pricing — do not re-own it here.
 */
const FAQ_ITEMS = [
  {
    q: "Is this HSK 2.0 or HSK Level 3?",
    a: (
      <>
        HSK Prep is built for{" "}
        <span className="font-medium text-ink">HSK Level 3</span> under the current
        syllabus (GF0025-2021). If you are still deciding between older 2.0 papers and
        Level 3, see the{" "}
        <Link href="/hsk-2-vs-3" className="font-medium text-jade hover:text-jade-light">
          HSK exam guide
        </Link>
        .
      </>
    ),
  },
  {
    q: "How long is the free diagnosis?",
    a: (
      <>
        About{" "}
        <span className="font-medium text-ink">20 minutes</span> — one sit-down Level 3
        diagnosis with listening and reading MCQs. Shorter than a full official paper;
        sized to open your coach report and plan, not to burn a free mock-exam quota.
      </>
    ),
  },
  {
    q: "Is the free sample limited?",
    a: (
      <>
        Yes. Each account gets{" "}
        <span className="font-medium text-ink">one multi-skill taste</span> (including one
        AI writing review) — not unlimited free practice. See{" "}
        <a href="#before-you-pay" className="font-medium text-jade hover:text-jade-light">
          What You Get Before You Pay
        </a>{" "}
        above for the full free chain.
      </>
    ),
  },
  {
    q: "Is writing scored by AI?",
    a: (
      <>
        Your free sample includes{" "}
        <span className="font-medium text-ink">one full AI writing review</span> (DeepSeek).
        More writing reviews come with the package you buy — not unlimited free scoring.
      </>
    ),
  },
  {
    q: "Do you charge more when the exam is soon?",
    a: (
      <>
        No. Every plan uses the{" "}
        <span className="font-medium text-ink">same unit rate</span> — no urgency premium,
        even days before the exam. See{" "}
        <Link href="/pricing" className="font-medium text-jade hover:text-jade-light">
          full pricing
        </Link>
        .
      </>
    ),
  },
  {
    q: "Is this a subscription?",
    a: (
      <>
        No. Coach packs are{" "}
        <span className="font-medium text-ink">pay once</span> for a fixed number of
        weeks. When those weeks end, that pack ends — no monthly renewal. Custom plans
        and sprints use the same unit rate without an urgency premium.
      </>
    ),
  },
  {
    q: "Do I pick an HSK level in the app?",
    a: (
      <>
        No level picker for now — the product is a single-track{" "}
        <span className="font-medium text-ink">HSK Level 3</span> coach so the journey
        stays focused through exam day.
      </>
    ),
  },
] as const;

export default function MarketingFaq() {
  return (
    <section id="faq" aria-labelledby="faq-heading">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <h2
          id="faq-heading"
          className="text-center font-display text-3xl font-semibold text-ink"
        >
          Questions Before You Start
        </h2>

        <div className="mt-10 divide-y divide-mist/70">
          {FAQ_ITEMS.map((item) => (
            <details key={item.q} className="group py-1">
              <summary className="cursor-pointer list-none py-4 font-display text-base font-semibold text-ink marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-start justify-between gap-4">
                  {item.q}
                  <span
                    className="mt-0.5 shrink-0 text-ink-muted transition group-open:rotate-45"
                    aria-hidden
                  >
                    +
                  </span>
                </span>
              </summary>
              <p className="pb-5 pr-8 text-sm leading-relaxed text-ink-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
