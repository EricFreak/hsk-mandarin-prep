import Link from "next/link";
import { resolveVisitorContinueHref } from "@/lib/auth/continue-destination";

type Props = {
  children: React.ReactNode;
  className?: string;
  intent?: string;
};

/** Server CTA that respects auth + journey stage. */
export default async function ContinueCta({
  children,
  className,
  intent = "/onboarding",
}: Props) {
  const href = await resolveVisitorContinueHref(intent);

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
