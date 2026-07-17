import Link from "next/link";

const POINTS = [
  {
    title: "Exam-dated, not endless",
    body: "Your plan aims at your exam date — or a fixed coach cycle — not an infinite streak.",
  },
  {
    title: "HSK Level 3 syllabus (GF0025-2021)",
    body: "Aligned to the current Level 3 map, not older HSK 2.0 word lists.",
  },
  {
    title: "Diagnosis → plan → practice",
    body: "Weaknesses drive what you do next. You see the full outline and quote before you pay.",
  },
] as const;

/**
 * Why-us — compressed single column (trust-funnel IA).
 * No mastery-gate / week-unlock freemium language.
 */
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

        <ul className="mx-auto mt-12 max-w-2xl space-y-8">
          {POINTS.map((point) => (
            <li key={point.title}>
              <h3 className="font-display text-lg font-semibold text-ink">{point.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{point.body}</p>
            </li>
          ))}
        </ul>

        <p className="mx-auto mt-10 max-w-2xl text-center text-xs leading-relaxed text-ink-muted">
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
