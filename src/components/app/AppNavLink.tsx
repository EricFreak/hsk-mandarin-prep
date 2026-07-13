"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const PREFETCH_APIS: Record<string, string> = {
  "/dashboard": "/api/dashboard",
};

type AppNavLinkProps = {
  href: string;
  label: string;
};

export default function AppNavLink({ href, label }: AppNavLinkProps) {
  const pathname = usePathname();

  const active = pathname === href || pathname.startsWith(`${href}/`);

  useEffect(() => {
    const api = PREFETCH_APIS[href];
    if (api) {
      void fetch(api, { credentials: "same-origin" });
    }
  }, [href]);

  return (
    <Link
      href={href}
      prefetch
      onMouseEnter={() => {
        const api = PREFETCH_APIS[href];
        if (api) {
          void fetch(api, { credentials: "same-origin" });
        }
      }}
      className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
        active
          ? "bg-jade/10 text-jade"
          : "text-ink-muted hover:bg-paper-dark hover:text-ink"
      }`}
    >
      {label}
    </Link>
  );
}
