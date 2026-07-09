import MarketingHeader from "@/components/marketing/MarketingHeader";
import PricingCheckout from "@/components/paywall/PricingCheckout";

export const metadata = {
  title: "Pricing — HSK Mandarin Prep",
  description:
    "Start free with HSK flashcards and one mock exam. Upgrade to Pro for unlimited AI practice and all mock exams.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-paper">
      <MarketingHeader />

      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <p className="section-eyebrow">Plans</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Simple, transparent pricing
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-ink-muted">
            Start free. Upgrade to Pro when you need unlimited practice, all mock
            exams, and AI writing feedback.
          </p>
        </div>

        <div className="mt-12">
          <PricingCheckout />
        </div>
      </main>

      <footer className="border-t border-mist bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 text-center text-sm text-ink-muted sm:px-6">
          <p>
            Aligned with the official HSK 3.0 syllabus (GF0025-2021). Not
            affiliated with Hanban or chinesetest.cn.
          </p>
        </div>
      </footer>
    </div>
  );
}
