"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import BrandLogo from "@/components/marketing/BrandLogo";

const NAV_LINKS = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
] as const;

type Props = {
  accountHref: string;
  accountLabel: string;
};

export default function MarketingHeader({ accountHref, accountLabel }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  function resolveHref(href: string) {
    if (href === "/#how-it-works" && pathname === "/") {
      return "#how-it-works";
    }
    return href;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-mist/80 bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <BrandLogo />

        <nav className="hidden items-center gap-8 sm:flex">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={resolveHref(href)}
              className="text-sm font-medium text-ink-muted transition hover:text-ink"
            >
              {label}
            </Link>
          ))}
          <Link href={accountHref} className="btn-primary text-sm">
            {accountLabel}
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:hidden">
          <Link href={accountHref} className="btn-primary text-sm">
            {accountLabel}
          </Link>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-mist bg-white text-ink"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span aria-hidden="true" className="text-lg leading-none">
              {menuOpen ? "×" : "☰"}
            </span>
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav
          id="mobile-nav"
          className="border-t border-mist bg-paper px-4 py-4 sm:hidden"
        >
          <ul className="space-y-2">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={resolveHref(href)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink-muted hover:bg-paper-dark hover:text-ink"
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
