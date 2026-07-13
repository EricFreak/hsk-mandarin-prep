import Link from "next/link";
import HeroBrandVisual from "@/components/marketing/HeroBrandVisual";
import HowItWorksShowcase from "@/components/marketing/HowItWorksShowcase";
import PricingTable from "@/components/marketing/PricingTable";

const TRUST_BADGES = [
  "AI Learning Coach",
  "HSK 3.0 aligned",
  "Your data is private",
];

export default function LandingPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(45,106,106,0.12),_transparent_55%),radial-gradient(ellipse_at_bottom_left,_rgba(61,138,138,0.08),_transparent_50%)]" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-paper via-paper to-paper-dark/40" />

        <div className="relative z-[2] mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:py-20">
          <div>
            <p className="section-eyebrow">AI Coach · HSK Level 3</p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
              Your AI coach for HSK Level 3
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted">
              Set your exam date, take a placement mock, and get a journey plan to exam day —
              with weekly tasks that target your gaps.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/login?next=%2Fmock-exam" className="btn-primary px-6 py-3 text-base">
                Start with free mock exam
              </Link>
              <a href="#how-it-works" className="btn-secondary px-6 py-3 text-base">
                See the AI coach loop
              </a>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-muted">
              {TRUST_BADGES.map((badge) => (
                <li key={badge} className="flex items-center gap-2">
                  <span className="text-jade" aria-hidden="true">
                    ✓
                  </span>
                  {badge}
                </li>
              ))}
            </ul>
          </div>
          <HeroBrandVisual />
        </div>
      </section>

      <HowItWorksShowcase />

      <section id="pricing" className="border-t border-mist bg-paper">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-center font-display text-3xl font-semibold text-ink">
            Simple, transparent pricing
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-sm text-ink-muted">
            Start free. Upgrade when you need the full AI coach report and study plan.
          </p>
          <div className="mt-12">
            <PricingTable />
          </div>
        </div>
      </section>

      <section className="border-t border-mist bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
          <h2 className="font-display text-3xl font-semibold text-ink">
            Ready for your AI coach?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-ink-muted">
            One free HSK 3 mock exam unlocks your first AI summary — no credit card.
          </p>
          <Link href="/login?next=%2Fmock-exam" className="btn-primary mt-8 px-8 py-3 text-base">
            Start with free mock exam
          </Link>
        </div>
      </section>
    </>
  );
}
