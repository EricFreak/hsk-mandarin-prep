"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PricingPlans from "@/components/marketing/PricingPlans";
import type { PriceType } from "@/lib/payments";

function PricingCheckoutInner({ freeCtaHref }: { freeCtaHref?: string }) {
  const searchParams = useSearchParams();
  const defaultBilling: PriceType =
    searchParams.get("billing") === "yearly" ? "yearly" : "monthly";

  return (
    <PricingPlans
      mode="checkout"
      defaultBilling={defaultBilling}
      freeCtaHref={freeCtaHref}
    />
  );
}

export default function PricingCheckout({
  freeCtaHref,
}: {
  freeCtaHref?: string;
}) {
  return (
    <Suspense fallback={<PricingPlans mode="checkout" freeCtaHref={freeCtaHref} />}>
      <PricingCheckoutInner freeCtaHref={freeCtaHref} />
    </Suspense>
  );
}
