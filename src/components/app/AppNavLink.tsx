"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type AppNavLinkProps = {
  href: string;
  label: string;
};

export default function AppNavLink({ href, label }: AppNavLinkProps) {
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const active = pathname === href || pathname.startsWith(`${href}/`);
  const pending = pendingHref === href && !active;

  useEffect(() => {
    if (
      pendingHref &&
      (pathname === pendingHref || pathname.startsWith(`${pendingHref}/`))
    ) {
      setPendingHref(null);
    }
  }, [pathname, pendingHref]);

  return (
    <Link
      href={href}
      prefetch
      onClick={() => {
        if (!active) {
          setPendingHref(href);
        }
      }}
      aria-busy={pending}
      className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
        active
          ? "bg-jade/10 text-jade"
          : pending
            ? "bg-paper-dark text-ink opacity-80"
            : "text-ink-muted hover:bg-paper-dark hover:text-ink"
      }`}
    >
      {pending ? (
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-jade/30 border-t-jade" />
          {label}
        </span>
      ) : (
        label
      )}
    </Link>
  );
}
