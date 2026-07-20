"use client";

import Link from "next/link";
import { FUNNEL_EVENTS, track } from "@/lib/analytics/track";

type Props = {
  href: string;
  className?: string;
  children: React.ReactNode;
  /** Where on the page the CTA sits — used as funnel dimension. */
  placement?: string;
  intent?: string;
};

/** Client wrapper so server ContinueCta can fire lp_cta_click without becoming a client tree. */
export default function TrackedContinueLink({
  href,
  className,
  children,
  placement = "unknown",
  intent,
}: Props) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => {
        track(FUNNEL_EVENTS.lpCtaClick, {
          placement,
          intent: intent ?? null,
          href,
        });
      }}
    >
      {children}
    </Link>
  );
}
