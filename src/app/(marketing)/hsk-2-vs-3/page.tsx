import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "HSK 2.0 vs 3.0: Which Exam Should You Take in 2026?",
  description:
    "Compare HSK 2.0 and HSK 3.0 level structures, vocabulary counts, and difficulty. Learn which Chinese proficiency test to prepare for in 2026.",
};

const HSK20_LEVELS = [
  { level: "HSK 1", vocab: 150, description: "Beginner" },
  { level: "HSK 2", vocab: 300, description: "Elementary" },
  { level: "HSK 3", vocab: 600, description: "Intermediate" },
  { level: "HSK 4", vocab: 1200, description: "Intermediate" },
  { level: "HSK 5", vocab: 2500, description: "Advanced" },
  { level: "HSK 6", vocab: 5000, description: "Advanced" },
];

const HSK30_LEVELS = [
  { level: "Level 1", tier: "Elementary", vocab: 500, syllables: 269, characters: 300 },
  { level: "Level 2", tier: "Elementary", vocab: 1272, syllables: 468, characters: 600 },
  { level: "Level 3", tier: "Elementary", vocab: 2245, syllables: 608, characters: 900 },
  { level: "Level 4", tier: "Intermediate", vocab: 3245, syllables: 724, characters: 1200 },
  { level: "Level 5", tier: "Intermediate", vocab: 4316, syllables: 822, characters: 1500 },
  { level: "Level 6", tier: "Intermediate", vocab: 5456, syllables: 908, characters: 1800 },
  { level: "Level 7–9", tier: "Advanced", vocab: 11092, syllables: 1110, characters: 3000 },
];

export default function Hsk2Vs3Page() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <header>
        <p className="section-eyebrow">Guide</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          HSK 2.0 vs 3.0: Which Exam Should You Take in 2026?
        </h1>
        <p className="mt-4 text-lg text-ink-muted">
          China&apos;s official Chinese proficiency test was overhauled in 2021.
          Here&apos;s what changed and how to choose the right version for your
          goals.
        </p>
      </header>

      <div className="mt-10 max-w-none">
        <h2 className="font-display text-xl font-semibold text-ink">
          What is the HSK?
        </h2>
        <p className="mt-3 text-ink-muted">
          The HSK (Hànyǔ Shuǐpíng Kǎoshì) is China&apos;s standardized test of
          Mandarin Chinese proficiency, administered by Hanban through{" "}
          <a
            href="https://www.chinesetest.cn/hsk"
            target="_blank"
            rel="noopener noreferrer"
            className="text-link"
          >
            chinesetest.cn
          </a>
          . Universities, employers, and visa programs use HSK scores to assess
          Chinese ability.
        </p>

        <h2 className="mt-10 text-xl font-semibold text-ink">
          Key differences at a glance
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-ink-muted">
          <li>
            <strong>HSK 2.0</strong> (pre-2021): 6 levels, max ~5,000 words at
            HSK 6.
          </li>
          <li>
            <strong>HSK 3.0</strong> (GF0025-2021): 9 levels grouped into three
            tiers (elementary, intermediate, advanced), max ~11,092 words.
          </li>
          <li>
            HSK 3.0 Level 3 is significantly harder than HSK 2.0 Level 3 — it
            requires 2,245 cumulative words vs. 600.
          </li>
          <li>
            HSK 3.0 adds syllable and character count requirements alongside
            vocabulary.
          </li>
        </ul>

        <h2 className="mt-10 text-xl font-semibold text-ink">
          HSK 2.0 level structure
        </h2>
        <p className="mt-3 text-ink-muted">
          The original HSK had six levels. Vocabulary counts below are cumulative
          (total words known at each level).
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[400px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-mist bg-paper-dark">
                <th className="px-4 py-3 text-left font-semibold text-ink">
                  Level
                </th>
                <th className="px-4 py-3 text-left font-semibold text-ink">
                  Cumulative vocabulary
                </th>
                <th className="px-4 py-3 text-left font-semibold text-ink">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {HSK20_LEVELS.map((row) => (
                <tr key={row.level} className="border-b border-mist">
                  <td className="px-4 py-3 text-ink">{row.level}</td>
                  <td className="px-4 py-3 text-ink-muted">
                    {row.vocab.toLocaleString()} words
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{row.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="mt-10 text-xl font-semibold text-ink">
          HSK 3.0 level structure
        </h2>
        <p className="mt-3 text-ink-muted">
          The new standard, published in 2021 as GF0025-2021, expands to nine
          levels across three tiers. Counts are cumulative.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[500px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-mist bg-paper-dark">
                <th className="px-4 py-3 text-left font-semibold text-ink">
                  Level
                </th>
                <th className="px-4 py-3 text-left font-semibold text-ink">
                  Tier
                </th>
                <th className="px-4 py-3 text-left font-semibold text-ink">
                  Vocabulary
                </th>
                <th className="px-4 py-3 text-left font-semibold text-ink">
                  Syllables
                </th>
                <th className="px-4 py-3 text-left font-semibold text-ink">
                  Characters
                </th>
              </tr>
            </thead>
            <tbody>
              {HSK30_LEVELS.map((row) => (
                <tr key={row.level} className="border-b border-mist">
                  <td className="px-4 py-3 text-ink">{row.level}</td>
                  <td className="px-4 py-3 text-ink-muted">{row.tier}</td>
                  <td className="px-4 py-3 text-ink-muted">
                    {row.vocab.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">
                    {row.syllables.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">
                    {row.characters.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="mt-10 text-xl font-semibold text-ink">
          Level mapping: rough equivalents
        </h2>
        <p className="mt-3 text-ink-muted">
          There is no official 1:1 mapping, but these approximations help if
          you&apos;re transitioning study materials:
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[300px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-mist bg-paper-dark">
                <th className="px-4 py-3 text-left font-semibold text-ink">
                  HSK 2.0
                </th>
                <th className="px-4 py-3 text-left font-semibold text-ink">
                  Rough HSK 3.0 equivalent
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-mist">
                <td className="px-4 py-3 text-ink">HSK 1–2</td>
                <td className="px-4 py-3 text-ink-muted">Level 1</td>
              </tr>
              <tr className="border-b border-mist">
                <td className="px-4 py-3 text-ink">HSK 3</td>
                <td className="px-4 py-3 text-ink-muted">Level 2</td>
              </tr>
              <tr className="border-b border-mist">
                <td className="px-4 py-3 text-ink">HSK 4</td>
                <td className="px-4 py-3 text-ink-muted">Level 4</td>
              </tr>
              <tr className="border-b border-mist">
                <td className="px-4 py-3 text-ink">HSK 5</td>
                <td className="px-4 py-3 text-ink-muted">Level 5–6</td>
              </tr>
              <tr className="border-b border-mist">
                <td className="px-4 py-3 text-ink">HSK 6</td>
                <td className="px-4 py-3 text-ink-muted">Level 7–9</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 className="mt-10 text-xl font-semibold text-ink">
          Which exam should you take in 2026?
        </h2>
        <p className="mt-3 text-ink-muted">
          As of 2026, China is gradually rolling out HSK 3.0 exams, but HSK 2.0
          tests are still offered in many test centers worldwide during the
          transition period. Here&apos;s our recommendation:
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-ink-muted">
          <li>
            <strong>New learners:</strong> Start with HSK 3.0 materials. The
            new syllabus is the long-term standard, and prep apps using outdated
            HSK 2.0 word lists will leave gaps.
          </li>
          <li>
            <strong>University or visa applicants:</strong> Check your target
            institution&apos;s current requirement. Many still accept HSK 2.0
            scores, but requirements are shifting to 3.0.
          </li>
          <li>
            <strong>Already studying HSK 2.0:</strong> You don&apos;t need to
            restart. Finish your current level, then transition using the
            mapping table above.
          </li>
          <li>
            <strong>Test registration:</strong> Confirm which version your local
            test center offers before booking. Visit{" "}
            <a
              href="https://www.chinesetest.cn/hsk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-link"
            >
              chinesetest.cn
            </a>{" "}
            for official sample papers and registration.
          </li>
        </ul>

        <h2 className="mt-10 text-xl font-semibold text-ink">
          Prepare with HSK 3.0-aligned tools
        </h2>
        <p className="mt-3 text-ink-muted">
          Most commercial apps still use HSK 2.0 vocabulary lists. HSK Mandarin
          Prep is built on the official GF0025-2021 syllabus with AI-generated
          practice and a free HSK 3 mock exam.
        </p>
        <div className="mt-6">
          <Link
            href="/mock-exam"
            className="btn-primary px-5 py-2.5 text-sm"
          >
            Take free HSK 3 mock exam
          </Link>
        </div>
      </div>
    </article>
  );
}
