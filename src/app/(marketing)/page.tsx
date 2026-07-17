import ContinueCta from "@/components/marketing/ContinueCta";
import HeroBrandVisual from "@/components/marketing/HeroBrandVisual";
import ProblemFrame from "@/components/marketing/ProblemFrame";
import HowItWorksShowcase from "@/components/marketing/HowItWorksShowcase";
import HomeServiceCards from "@/components/marketing/HomeServiceCards";
import MarketingFaq from "@/components/marketing/MarketingFaq";
import JadeDotDivider from "@/components/marketing/JadeDotDivider";

/**
 * IA · Trust funnel (2026-07-17)
 * Hero → Before you pay → Plans → Why-us → FAQ → CTA
 */
export default function LandingPage() {
  return (
    <>
      <section>
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:py-24">
          <div>
            <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
              Your AI coach for HSK Level 3
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted">
              Built for your first real HSK — diagnose the gaps, aim at exam day, and
              practice what still matters. Not another endless word bank.
            </p>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-muted">
              One track. Current Level 3 syllabus. A coach that plans the journey —
              then walks it with you week by week.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <ContinueCta className="btn-primary px-6 py-3 text-base">
                Start with a free diagnosis
              </ContinueCta>
              <a href="#before-you-pay" className="btn-secondary px-6 py-3 text-base">
                See how it works
              </a>
            </div>
          </div>
          <HeroBrandVisual />
        </div>
      </section>

      <JadeDotDivider />
      <HowItWorksShowcase />

      <JadeDotDivider />
      <section id="plans" aria-labelledby="plans-heading">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <h2
            id="plans-heading"
            className="text-center font-display text-3xl font-semibold text-ink"
          >
            Choose how you want to prepare
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-sm text-ink-muted">
            Same rate for every plan. You pick the outcome — system-led, you-led, or
            emergency.
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
            <a href="#plans" className="btn-secondary px-6 py-3 text-base">
              See plans
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
