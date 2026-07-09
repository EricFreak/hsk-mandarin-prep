import Link from "next/link";
import HeroVisual from "@/components/marketing/HeroVisual";
import PricingTable from "@/components/marketing/PricingTable";
import ProductShowcase from "@/components/marketing/ProductShowcase";

const TRUST_BADGES = [
  "Official HSK 3.0 aligned",
  "AI evaluation",
  "Your data is private",
];

const STEPS = [
  {
    step: "1",
    title: "Take a mock exam",
    description: "Full-length exams under real conditions.",
  },
  {
    step: "2",
    title: "Get AI grading & analysis",
    description: "Instant scores and personalized weakness reports.",
  },
  {
    step: "3",
    title: "Practice smarter",
    description: "Target weak areas with AI-recommended practice.",
  },
];

export default function LandingPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-16 top-8 font-display text-[12rem] font-semibold leading-none text-seal/[0.06] sm:text-[16rem]">
          考
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-jade/10 via-paper to-paper" />
        <div className="absolute bottom-0 right-0 h-64 w-64 bg-gradient-to-tl from-jade/5 to-transparent sm:h-96 sm:w-96" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-20">
          <div>
            <p className="section-eyebrow">HSK 3.0 · GF0025-2021</p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
              AI-powered HSK 3.0 prep
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted">
              Realistic mock exams, instant AI grading. Personalized weakness report.
              Smarter practice.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/mock-exam" className="btn-primary px-6 py-3 text-base">
                Take free mock exam
              </Link>
              <a href="#how-it-works" className="btn-secondary px-6 py-3 text-base">
                See how it works
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
          <HeroVisual />
        </div>
      </section>

      <section id="how-it-works" className="border-y border-mist bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-semibold text-ink">How it works</h2>
            <div className="mx-auto mt-4 h-px w-24 bg-brush-rule" />
          </div>
          <ol className="mt-12 grid gap-8 md:grid-cols-3">
            {STEPS.map((item) => (
              <li key={item.step} className="surface-card p-6 text-center md:text-left">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-seal/10 font-display text-lg font-semibold text-seal">
                  {item.step}
                </span>
                <h3 className="mt-4 font-display text-xl font-semibold text-ink">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {item.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <ProductShowcase />

      <section id="pricing" className="border-t border-mist bg-paper">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-center font-display text-3xl font-semibold text-ink">
            Simple, transparent pricing
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-sm text-ink-muted">
            Start free. Upgrade when you need unlimited practice and full reports.
          </p>
          <div className="mt-12">
            <PricingTable />
          </div>
        </div>
      </section>

      <section className="border-t border-mist bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
          <h2 className="font-display text-3xl font-semibold text-ink">
            Ready to see where you stand?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-ink-muted">
            One free HSK 3 mock exam. Instant score and weakness summary — no credit
            card.
          </p>
          <Link href="/mock-exam" className="btn-primary mt-8 px-8 py-3 text-base">
            Start free mock exam
          </Link>
        </div>
      </section>
    </>
  );
}
