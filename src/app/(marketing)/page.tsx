import Link from "next/link";
import HeroVisual from "@/components/marketing/HeroVisual";
import PricingTable from "@/components/marketing/PricingTable";

const STEPS = [
  {
    step: "01",
    title: "Take a mock exam",
    description:
      "A scaled HSK 3 practice test with listening, reading, and writing — get an instant score.",
  },
  {
    step: "02",
    title: "See your weaknesses",
    description:
      "We break down mistakes by skill — listening, vocabulary, grammar — so you know what to fix.",
  },
  {
    step: "03",
    title: "Practice what matters",
    description:
      "AI generates questions from your level's word list, focused on the skills you missed.",
  },
];

const STATS = [
  { value: "3.0", label: "Official syllabus" },
  { value: "AI", label: "Adaptive practice" },
  { value: "Free", label: "Mock exam to start" },
];

export default function LandingPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-jade/5 via-paper to-paper" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="section-eyebrow">HSK 3.0 · GF0025-2021</p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl lg:text-[3.25rem]">
              Know what to study next for HSK 3
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted">
              Mock exam, weakness report, and AI practice — aligned to the new HSK
              3.0 standard. Built for international learners with an English-first
              experience.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/mock-exam" className="btn-primary px-6 py-3 text-base">
                Take free mock exam
              </Link>
              <Link href="/hsk-2-vs-3" className="btn-secondary px-6 py-3 text-base">
                HSK 2.0 vs 3.0
              </Link>
            </div>
            <dl className="mt-12 grid grid-cols-3 gap-4 border-t border-mist pt-8">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <dt className="font-display text-2xl font-semibold text-ink">
                    {stat.value}
                  </dt>
                  <dd className="mt-1 text-xs font-medium text-ink-muted">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>
          <HeroVisual />
        </div>
      </section>

      <section className="border-y border-mist bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-semibold text-ink">
              How it works
            </h2>
            <div className="mx-auto mt-4 h-px w-24 bg-brush-rule" />
            <p className="mt-4 text-ink-muted">
              Not another endless question bank — a diagnose → practice loop.
            </p>
          </div>
          <ol className="mt-12 grid gap-8 md:grid-cols-3">
            {STEPS.map((item) => (
              <li key={item.step} className="surface-card p-6">
                <span className="font-display text-3xl font-semibold text-seal/30">
                  {item.step}
                </span>
                <h3 className="mt-3 font-display text-xl font-semibold text-ink">
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

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {[
            {
              title: "Official HSK 3.0 syllabus",
              body: "Vocabulary and tasks aligned to GF0025-2021 — not outdated HSK 2.0 lists.",
            },
            {
              title: "AI adaptive practice",
              body: "Fresh cloze and reading questions from your level's word list, with daily free tier.",
            },
            {
              title: "Real mock exam format",
              body: "Listening, reading, and writing sections with instant scoring and skill breakdown.",
            },
          ].map((prop) => (
            <div
              key={prop.title}
              className="rounded-2xl border border-mist bg-paper-dark/50 p-6"
            >
              <h3 className="font-display text-lg font-semibold text-ink">
                {prop.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{prop.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-mist bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-center font-display text-3xl font-semibold text-ink">
            Simple, transparent pricing
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-sm text-ink-muted">
            Start free. Upgrade when you need unlimited practice and full mock exams.
          </p>
          <div className="mt-12">
            <PricingTable />
          </div>
        </div>
      </section>

      <section className="border-t border-mist">
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
