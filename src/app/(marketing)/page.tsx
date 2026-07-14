import Link from "next/link";
import HeroBrandVisual from "@/components/marketing/HeroBrandVisual";
import ProblemFrame from "@/components/marketing/ProblemFrame";
import HowItWorksShowcase from "@/components/marketing/HowItWorksShowcase";
import PricingTable from "@/components/marketing/PricingTable";
import MarketingFaq from "@/components/marketing/MarketingFaq";
import JadeDotDivider from "@/components/marketing/JadeDotDivider";

/**
 * IA · Chapter ownership (A)
 * Hero = promise + CTA · Problem = why-us · How it works = mechanism via preview
 * Pricing = freemium · FAQ = operational detail · CTA = action only
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
              Set your exam date, take a placement mock, and follow a weekly plan aimed at
              your gaps — through exam day.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/login?next=%2Fmock-exam" className="btn-primary px-6 py-3 text-base">
                Start with free mock exam
              </Link>
              <a href="#how-it-works" className="btn-secondary px-6 py-3 text-base">
                See how it works
              </a>
            </div>
          </div>
          <HeroBrandVisual />
        </div>
      </section>

      <JadeDotDivider />
      <ProblemFrame />

      <JadeDotDivider />
      <HowItWorksShowcase />

      <JadeDotDivider />
      <section>
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <h2
            id="pricing"
            className="text-center font-display text-3xl font-semibold text-ink"
          >
            Free Week 1. Pro for the rest of the journey.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-sm text-ink-muted">
            One mock and full Week 1 on Free. Clear Week 1, then Pro continues weeks to exam
            day — unlimited mocks and plan-driven practice.
          </p>
          <div className="mt-10">
            <PricingTable />
          </div>
        </div>
      </section>

      <JadeDotDivider />
      <MarketingFaq />

      <JadeDotDivider />
      <section>
        <div className="mx-auto max-w-6xl px-4 py-12 text-center sm:px-6 sm:py-14">
          <h2 className="font-display text-3xl font-semibold text-ink">
            Start with a free mock exam
          </h2>
          <p className="mt-3 text-sm text-ink-muted">No credit card required.</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Link href="/login?next=%2Fmock-exam" className="btn-primary px-8 py-3 text-base">
              Start with free mock exam
            </Link>
            <a href="#pricing" className="btn-secondary px-6 py-3 text-base">
              Compare Free &amp; Pro
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
