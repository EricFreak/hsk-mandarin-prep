import PricingPlans from "@/components/marketing/PricingPlans";
import { resolveVisitorContinueHref } from "@/lib/auth/continue-destination";

/** Homepage pricing block — checkout-ready (no hop to /pricing). */
export default async function PricingTable() {
  const freeCtaHref = await resolveVisitorContinueHref("/onboarding");
  return <PricingPlans mode="checkout" freeCtaHref={freeCtaHref} />;
}
