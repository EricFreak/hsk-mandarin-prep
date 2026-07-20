import TrackedContinueLink from "@/components/marketing/TrackedContinueLink";
import { resolveVisitorContinueHref } from "@/lib/auth/continue-destination";

type Props = {
  children: React.ReactNode;
  className?: string;
  intent?: string;
  /** Funnel dimension: hero | footer | plans | … */
  placement?: string;
};

/** Server CTA that respects auth + journey stage. */
export default async function ContinueCta({
  children,
  className,
  intent = "/onboarding",
  placement = "unknown",
}: Props) {
  const href = await resolveVisitorContinueHref(intent);

  return (
    <TrackedContinueLink
      href={href}
      className={className}
      placement={placement}
      intent={intent}
    >
      {children}
    </TrackedContinueLink>
  );
}
