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
    q: "How long is the free diagnosis?",
    a: (
      <>
        One sit-down Level 3 diagnosis with{" "}
        <span className="font-medium text-ink">listening and reading MCQs</span>
        . It is sized for a first check — shorter than a full official HSK Level 3
        paper — so you can open your coach report and Week 1 without a multi-hour session.
      </>
    ),
  },
  {
    q: "Is writing scored by AI?",
    a: (
      <>
        You can <span className="font-medium text-ink">submit writing on Free</span> with a
        full mock. <span className="font-medium text-ink">AI writing score and feedback</span> is
        part of the paid services. Free still gets MCQ scoring and a complete coach report.
      </>
    ),
  },
  {
    q: "What is free, and when do I pay?",
    a: (
      <>
        Free includes the full diagnosis and your complete coach report — no truncation, no
        quotas. You only pay when you want more work: a{" "}
        <span className="font-medium text-ink">coach package</span>, a{" "}
        <span className="font-medium text-ink">custom exam plan</span>, or an{" "}
        <span className="font-medium text-ink">emergency sprint</span>. See the pricing cards
        above — one rate for all three.
      </>
    ),
  },
  {
    q: "When should I buy a plan?",
    a: (
      <>
        After your <span className="font-medium text-ink">diagnosis</span> — that is when you
        get a transparent quote for exactly the work you want to schedule. Diagnosis itself is
        never interrupted by a paywall.
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
