import Link from "next/link";

/**
 * FAQ — sole owner of operational detail (duration, writing AI, Free/Pro edge cases).
 * No section eyebrowse — questions are the interface.
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
    q: "How long is the free mock?",
    a: (
      <>
        One sit-down placement mock with{" "}
        <span className="font-medium text-ink">listening, reading, and a writing prompt</span>
        . It is sized for a diagnostic first attempt — shorter than a full official HSK 3
        paper — so you can open your coach report and Week 1 without a multi-hour session.
      </>
    ),
  },
  {
    q: "Is writing scored by AI?",
    a: (
      <>
        You can <span className="font-medium text-ink">submit writing on Free</span> with the
        mock. <span className="font-medium text-ink">AI writing score and feedback</span> is
        a Pro feature. Free still gets MCQ scoring, a (truncated) coach report, and full Week
        1.
      </>
    ),
  },
  {
    q: "What is free, and when do I need Pro?",
    a: (
      <>
        Free includes one full mock, a truncated coach report, and{" "}
        <span className="font-medium text-ink">full Week 1</span> on your journey.
        Pro unlocks continued weeks after Week 1, full reports, and unlimited mocks &amp;
        plan-driven practice. See the pricing cards above for the full split.
      </>
    ),
  },
  {
    q: "When should I upgrade?",
    a: (
      <>
        After you <span className="font-medium text-ink">clear Week 1</span> — that is the
        primary moment the product asks you to continue the journey with Pro. Placement and
        Week 1 itself are not interrupted by a mid-week paywall.
      </>
    ),
  },
  {
    q: "Do I pick an HSK level in the app?",
    a: (
      <>
        No level picker for now — the product is a single-track{" "}
        <span className="font-medium text-ink">HSK Level 3</span> coach so the journey stays
        focused through exam day.
      </>
    ),
  },
] as const;

export default function MarketingFaq() {
  return (
    <section id="faq" aria-labelledby="faq-heading">
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 sm:py-24">
        <h2
          id="faq-heading"
          className="text-center font-display text-3xl font-semibold text-ink"
        >
          Questions before you start
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
