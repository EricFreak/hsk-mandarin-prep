import Link from "next/link";
import PricingTable from "@/components/marketing/PricingTable";

const VALUE_PROPS = [
  {
    title: "Official HSK 3.0 syllabus",
    description:
      "Practice with vocabulary, grammar, and characters aligned to the GF0025-2021 standard — not outdated HSK 2.0 materials.",
  },
  {
    title: "AI adaptive practice",
    description:
      "Get fresh cloze and reading questions generated from your level's word list. The engine targets your weak spots automatically.",
  },
  {
    title: "Real mock exam format",
    description:
      "Take a full HSK 3 mock exam with instant scoring and a weakness summary — free on signup.",
  },
];

export default function LandingPage() {
  return (
    <>
      <section className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 sm:py-24">
        <p className="text-sm font-medium uppercase tracking-wide text-blue-600">
          HSK exam preparation
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          AI-powered HSK 3.0 prep
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
          Master HSK 1–3 with spaced-repetition flashcards, AI-generated
          practice, and an official-format mock exam — start free, upgrade when
          you&apos;re ready.
        </p>
        <div className="mt-10">
          <Link
            href="/mock-exam"
            className="inline-flex items-center rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700"
          >
            Take free HSK 3 mock exam
          </Link>
        </div>
      </section>

      <section className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <h2 className="text-center text-2xl font-semibold text-gray-900">
            Why learners choose us
          </h2>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {VALUE_PROPS.map((prop) => (
              <div key={prop.title} className="text-center sm:text-left">
                <h3 className="text-lg font-semibold text-gray-900">
                  {prop.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600">{prop.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-gray-200">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
          <h2 className="text-center text-2xl font-semibold text-gray-900">
            Simple, transparent pricing
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-sm text-gray-600">
            Start free. Upgrade to Pro when you need unlimited practice, all
            mock exams, and AI writing feedback.
          </p>
          <div className="mt-12">
            <PricingTable />
          </div>
        </div>
      </section>

      <section className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Not sure which HSK version to study?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-gray-600">
            China switched from HSK 2.0 to HSK 3.0 in 2021. Read our guide to
            understand the differences and what to take in 2026.
          </p>
          <Link
            href="/hsk-2-vs-3"
            className="mt-6 inline-flex text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            HSK 2.0 vs 3.0 guide →
          </Link>
        </div>
      </section>

      <section className="border-t border-gray-200">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Ready to see where you stand?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-gray-600">
            Take a free HSK 3 mock exam and get an instant score with a
            weakness summary — no credit card required.
          </p>
          <Link
            href="/mock-exam"
            className="mt-8 inline-flex items-center rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700"
          >
            Take free HSK 3 mock exam
          </Link>
        </div>
      </section>
    </>
  );
}
