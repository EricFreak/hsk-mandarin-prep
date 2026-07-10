import Image from "next/image";
import Link from "next/link";
import HeroBrandVisual from "@/components/marketing/HeroBrandVisual";
import HowItWorksShowcase from "@/components/marketing/HowItWorksShowcase";
import PricingTable from "@/components/marketing/PricingTable";

const TRUST_BADGES = [
  "Official HSK 3.0 aligned",
  "AI evaluation",
  "Your data is private",
];

export default function LandingPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <Image
            src="/brand/hero-bg.png"
            alt=""
            fill
            priority
            className="object-cover object-[70%_center] opacity-40 sm:object-right"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-paper via-paper/95 to-paper/55 sm:via-paper/85 sm:to-transparent" />
        </div>
        <div className="pointer-events-none absolute -left-16 top-8 z-[1] font-display text-[12rem] font-semibold leading-none text-seal/[0.06] sm:text-[16rem]">
          考
        </div>

        <div className="relative z-[2] mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-20">
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
              <Link href="/login?next=%2Fmock-exam" className="btn-primary px-6 py-3 text-base">
                Sign up for free mock exam
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
          <Link href="/login?next=%2Fmock-exam" className="btn-primary mt-8 px-8 py-3 text-base">
            Sign up for free mock exam
          </Link>
        </div>
      </section>
    </>
  );
}
