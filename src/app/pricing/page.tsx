import MarketingHeader from "@/components/marketing/MarketingHeader";
import PricingPlans from "@/components/marketing/PricingPlans";
import {
  resolvePricingCtas,
  resolveVisitorContinueHref,
} from "@/lib/auth/continue-destination";

export const metadata = {
  title: "Pricing — HSK Prep",
  description:
    "Three services, one transparent rate. Coach packages, custom exam plans, and emergency sprints — pay once for exactly the work you schedule.",
};

export default async function PricingPage() {
  const accountHref = await resolveVisitorContinueHref("/dashboard");
  const accountLabel = accountHref.startsWith("/login") ? "Login" : "Dashboard";
  const { freeCtaHref, serviceCtaHref, serviceCtaLabel } = await resolvePricingCtas();

  return (
    <div className="min-h-screen bg-paper">
      <MarketingHeader accountHref={accountHref} accountLabel={accountLabel} />

      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <p className="section-eyebrow">Pricing</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Three Services, One Transparent Rate
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-ink-muted">
            Pay once for a defined amount of work. Coach packages, custom exam plans, and
            emergency sprints are all priced the same way — no subscriptions, no urgency
            premium.
          </p>
        </div>

        <div className="mt-12">
          <PricingPlans
            freeCtaHref={freeCtaHref}
            serviceCtaHref={serviceCtaHref}
            serviceCtaLabel={serviceCtaLabel}
          />
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
