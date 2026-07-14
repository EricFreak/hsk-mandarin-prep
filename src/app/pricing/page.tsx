import MarketingHeader from "@/components/marketing/MarketingHeader";
import PricingCheckout from "@/components/paywall/PricingCheckout";
import { resolveVisitorContinueHref } from "@/lib/auth/continue-destination";

export const metadata = {
  title: "Pricing — HSK Prep",
  description:
    "Start free with full Week 1 on your HSK Level 3 coach journey. Upgrade to Pro after Week 1 to continue to exam day.",
};

export default async function PricingPage() {
  const accountHref = await resolveVisitorContinueHref("/dashboard");
  const accountLabel = accountHref.startsWith("/login") ? "Login" : "Dashboard";
  const freeCtaHref = await resolveVisitorContinueHref("/onboarding");

  return (
    <div className="min-h-screen bg-paper">
      <MarketingHeader accountHref={accountHref} accountLabel={accountLabel} />

      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <p className="section-eyebrow">Plans</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Simple, transparent pricing
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-ink-muted">
            Start free with full Week 1. Upgrade after Week 1 to continue your coach journey
            to exam day — full reports, unlimited mocks, and plan-driven practice.
          </p>
        </div>

        <div className="mt-12">
          <PricingCheckout freeCtaHref={freeCtaHref} />
        </div>
      </main>

      <footer className="border-t border-mist bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 text-center text-sm text-ink-muted sm:px-6">
          <p>
            Aligned with the official HSK Level 3 syllabus (GF0025-2021). Not
            affiliated with Hanban or chinesetest.cn.
          </p>
        </div>
      </footer>
    </div>
  );
}
