import ContinueCta from "@/components/marketing/ContinueCta";
import ProblemFrame from "@/components/marketing/ProblemFrame";
import HowItWorksShowcase from "@/components/marketing/HowItWorksShowcase";
import HomeServiceCards from "@/components/marketing/HomeServiceCards";
import MarketingFaq from "@/components/marketing/MarketingFaq";
import JadeDotDivider from "@/components/marketing/JadeDotDivider";

/**
 * IA · Trust funnel (2026-07-20 revision toward conversion)
 * Hero → Before you pay (3 steps) → Why-us → Plans → FAQ → CTA
 * Canonical demo persona: mock 72% · readiness 68% · L58 R78 V85 G72
 */
const PERSONA = {
  readinessPct: 68,
  listening: 58,
  reading: 78,
  vocab: 85,
} as const;

export default function LandingPage() {
  return (
    <>
      <section>
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-14 lg:py-24">
          <div>
            <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
              See What&apos;s Still Between You And Passing HSK Level 3
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted">
              About 20 minutes. Free diagnosis with listening and reading — then your
              gaps, an exam-dated outline, and a real sample of the work. Continue only if
              you want the coach path; pay once, no subscription.
            </p>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-muted">
              No credit card. Mapped to the current Level 3 syllabus — not another word
              list.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <ContinueCta className="btn-primary px-6 py-3 text-base">
                Start with a free diagnosis
              </ContinueCta>
              <a
                href="#before-you-pay"
                className="text-sm font-medium text-jade hover:text-jade-light"
              >
                See the free chain
              </a>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-mist bg-white shadow-card">
            <div className="border-b border-mist bg-paper-dark/60 px-4 py-2.5">
              <p className="text-xs font-medium text-ink-muted">
                Sample diagnosis · same numbers as the previews below
              </p>
            </div>
            <div className="space-y-4 p-5 sm:p-6">
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-sm font-medium text-ink">Exam readiness</p>
                  <p className="text-[11px] text-ink-muted">
                    If you follow this week&apos;s tasks
                  </p>
                </div>
                <p className="font-display text-2xl font-semibold tabular-nums text-jade">
                  {PERSONA.readinessPct}%
                </p>
              </div>
              {(
                [
                  { skill: "Listening", pct: PERSONA.listening },
                  { skill: "Reading", pct: PERSONA.reading },
                  { skill: "Vocabulary", pct: PERSONA.vocab },
                ] as const
              ).map((row) => (
                <div key={row.skill}>
                  <div className="mb-1 flex justify-between text-xs text-ink-muted">
                    <span>{row.skill}</span>
                    <span className="tabular-nums">{row.pct}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-mist">
                    <div
                      className={`h-full rounded-full ${
                        row.skill === "Listening" ? "bg-seal/70" : "bg-jade"
                      }`}
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                </div>
              ))}
              <p className="text-xs text-ink-muted">
                Top gap highlighted — your plan aims here first.
              </p>
            </div>
          </div>
        </div>
      </section>

      <JadeDotDivider />
      <HowItWorksShowcase />

      <JadeDotDivider />
      <ProblemFrame />

      <JadeDotDivider />
      <section id="plans" aria-labelledby="plans-heading">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <h2
            id="plans-heading"
            className="text-center font-display text-3xl font-semibold text-ink"
          >
            How Paid Work Is Shaped
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-sm text-ink-muted">
            After diagnosis you pick an outcome. Until then, one path: free diagnosis.
          </p>
          <div className="mt-10">
            <HomeServiceCards />
          </div>
        </div>
      </section>

      <JadeDotDivider />
      <MarketingFaq />

      <JadeDotDivider />
      <section>
        <div className="mx-auto max-w-6xl px-4 py-12 text-center sm:px-6 sm:py-14">
          <h2 className="font-display text-3xl font-semibold text-ink">
            Get Your Free Diagnosis
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-ink-muted">
            No credit card. See your report, outline, and a real sample — including one
            AI writing review — before you pay once.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <ContinueCta className="btn-primary px-8 py-3 text-base">
              Start with a free diagnosis
            </ContinueCta>
          </div>
        </div>
      </section>
    </>
  );
}
