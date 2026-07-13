"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PricingPlans from "@/components/marketing/PricingPlans";
import type { PriceType } from "@/lib/payments";

function PricingCheckoutInner() {
  const searchParams = useSearchParams();
  const defaultBilling: PriceType =
    searchParams.get("billing") === "yearly" ? "yearly" : "monthly";

  return <PricingPlans mode="checkout" defaultBilling={defaultBilling} />;
}

export default function PricingCheckout() {
  return (
    <Suspense fallback={<PricingPlans mode="checkout" />}>
      <PricingCheckoutInner />
    </Suspense>
  );
}
