import PricingPlans from "@/components/marketing/PricingPlans";
import { resolvePricingCtas } from "@/lib/auth/continue-destination";

/** Homepage pricing block — renders the three-service model with auth-aware CTAs. */
export default async function PricingTable() {
  const { freeCtaHref, serviceCtaHref, serviceCtaLabel } = await resolvePricingCtas();
  return (
    <PricingPlans
      freeCtaHref={freeCtaHref}
      serviceCtaHref={serviceCtaHref}
      serviceCtaLabel={serviceCtaLabel}
    />
  );
}
