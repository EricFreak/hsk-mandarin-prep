"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PricingPlans from "@/components/marketing/PricingPlans";

function PricingCheckoutInner({ freeCtaHref }: { freeCtaHref?: string }) {
  const searchParams = useSearchParams();
  const defaultBilling: "monthly" | "yearly" =
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
