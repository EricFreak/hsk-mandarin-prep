import Link from "next/link";

/**
 * Problem framing — sole owner of “why us vs glued tools.”
 * Syllabus authority lives here as a foot note (not a separate skim band).
 */
const WITHOUT = {
  label: "Most self-study apps",
  points: [
    "Random drills with no exam date on the calendar",
    "Word lists that still track older HSK 2.0 maps",
    "No weekly bar — easy to skip hard skills",
  ],
} as const;

const WITH = {
  label: "HSK Prep coach",
  points: [
    "Journey mapped from your mock to your exam day",
    "HSK Level 3 syllabus (GF0025-2021)",
    "Weekly tasks + mastery gate before the next week unlocks",
  ],
} as const;

export default function ProblemFrame() {
  return (
    <section id="why-coach" aria-labelledby="why-coach-heading">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <h2
          id="why-coach-heading"
          className="mx-auto max-w-2xl text-center font-display text-3xl font-semibold text-ink"
        >
          Built for your first real HSK — not another endless word bank
        </h2>

        <div className="mx-auto mt-12 grid max-w-4xl items-stretch gap-4 md:grid-cols-2 md:gap-6">
          <div className="flex flex-col rounded-2xl border border-dashed border-ink/15 bg-paper-dark/50 p-6 sm:p-8">
            <h3 className="font-display text-lg font-semibold text-ink/55">{WITHOUT.label}</h3>
            <ul className="mt-5 flex-1 space-y-3.5">
              {WITHOUT.points.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-muted/90"
                >
                  <span
                    className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-seal/15 text-xs font-semibold text-seal"
                    aria-hidden
                  >
                    ×
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative flex flex-col rounded-2xl border-2 border-jade bg-jade/8 p-6 sm:p-8 md:-my-1 md:px-8">
            <h3 className="font-display text-lg font-semibold text-ink">{WITH.label}</h3>
            <ul className="mt-5 flex-1 space-y-3.5">
              {WITH.points.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-muted"
                >
                  <span
                    className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-jade/15 text-xs font-bold text-jade"
                    aria-hidden
                  >
                    ✓
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-xs leading-relaxed text-ink-muted">
          Aligned to HSK Level 3 (GF0025-2021). Not affiliated with Hanban.{" "}
          <Link href="/hsk-2-vs-3" className="font-medium text-jade hover:text-jade-light">
            Exam guide
          </Link>
          {" · "}
          <a
            href="https://www.chinesetest.cn"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-jade hover:text-jade-light"
          >
            chinesetest.cn
          </a>
        </p>
      </div>
    </section>
  );
}
