import ContinueCta from "@/components/marketing/ContinueCta";
import ProblemFrame from "@/components/marketing/ProblemFrame";
import BeforeYouPaySection from "@/components/marketing/BeforeYouPaySection";
import HomeServiceCards from "@/components/marketing/HomeServiceCards";
import MarketingFaq from "@/components/marketing/MarketingFaq";
import JadeDotDivider from "@/components/marketing/JadeDotDivider";

/**
 * IA · Trust funnel (2026-07-17) + cross-review fixes (2026-07-20)
 * Hero → Before you pay → Plans (orientation) → Why-us → FAQ → CTA
 * Hero is copy + one proof card; plans are not a chooser.
 */
export default function LandingPage() {
  return (
    <>
      <section>
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:py-24">
          <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
            See what&apos;s still between you and HSK Level 3
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted">
            About 20 minutes. Free diagnosis with listening and reading — then your
            gaps, an exam-dated outline, and a real sample of the work. Pay once only
            if you continue.
          </p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-muted">
            No credit card. Mapped to the current Level 3 syllabus — not another word
            list.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <ContinueCta className="btn-primary px-6 py-3 text-base">
              Start with a free diagnosis
            </ContinueCta>
            <a href="#before-you-pay" className="btn-secondary px-6 py-3 text-base">
              See what&apos;s free
            </a>
          </div>

          <div className="mt-12 max-w-md overflow-hidden rounded-2xl border border-mist bg-white shadow-card">
            <div className="border-b border-mist bg-paper-dark/60 px-4 py-2.5">
              <p className="text-xs font-medium text-ink-muted">
                Sample diagnosis · what you&apos;ll see
              </p>
            </div>
            <div className="space-y-3 p-5">
              <div className="flex items-baseline justify-between">
                <p className="text-sm font-medium text-ink">Readiness</p>
                <p className="font-display text-xl font-semibold tabular-nums text-jade">
                  72
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs text-ink-muted">
                <div className="rounded-lg bg-paper-dark/50 px-2 py-2">
                  <p className="font-medium text-ink">62%</p>
                  <p>Listening</p>
                </div>
                <div className="rounded-lg bg-paper-dark/50 px-2 py-2">
                  <p className="font-medium text-ink">81%</p>
                  <p>Reading</p>
                </div>
                <div className="rounded-lg bg-seal/10 px-2 py-2">
                  <p className="font-medium text-seal">54%</p>
                  <p>Writing</p>
                </div>
              </div>
              <p className="text-xs text-ink-muted">
                Top gap highlighted — your plan aims here first.
              </p>
            </div>
          </div>
        </div>
      </section>

      <JadeDotDivider />
      <BeforeYouPaySection />

      <JadeDotDivider />
      <section id="plans" aria-labelledby="plans-heading">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <h2
            id="plans-heading"
            className="text-center font-display text-3xl font-semibold text-ink"
          >
            How paid work is shaped
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
      <ProblemFrame />

      <JadeDotDivider />
      <MarketingFaq />

      <JadeDotDivider />
      <section>
        <div className="mx-auto max-w-6xl px-4 py-12 text-center sm:px-6 sm:py-14">
          <h2 className="font-display text-3xl font-semibold text-ink">
            Get your free diagnosis
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-ink-muted">
            No credit card. See your report, outline, and a real sample — including one
            AI writing review — before you pay.
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
