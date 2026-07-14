import PricingPlans from "@/components/marketing/PricingPlans";

/** Homepage pricing block — checkout-ready (no hop to /pricing). */
export default function PricingTable() {
  return <PricingPlans mode="checkout" />;
}
