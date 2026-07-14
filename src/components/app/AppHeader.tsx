"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AccountMenu from "@/components/app/AccountMenu";
import AppNavLink from "@/components/app/AppNavLink";
import BrandLogo from "@/components/marketing/BrandLogo";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/flashcards", label: "Flashcards" },
  { href: "/practice", label: "Practice" },
  { href: "/mistakes", label: "Mistakes" },
  { href: "/mock-exam", label: "Mock Exam" },
] as const;

export default function AppHeader() {
  const pathname = usePathname();
  const minimal =
    pathname === "/onboarding" ||
    pathname === "/diagnosis" ||
    pathname.startsWith("/diagnosis/");

  const stepLabel =
    pathname === "/onboarding"
      ? "Step 1 · Exam date"
      : pathname.startsWith("/diagnosis")
        ? "Step 2 · Diagnosis"
        : "Getting started";

  return (
    <header className="sticky top-0 z-50 border-b border-mist/80 bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <BrandLogo
          href={minimal ? "/onboarding" : "/dashboard"}
          title="HSK Prep"
          size="sm"
        />
        {minimal ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink-muted">{stepLabel}</p>
            <AccountMenu compact />
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <nav className="flex flex-wrap items-center gap-1 sm:gap-2">
              {NAV_ITEMS.map(({ href, label }) => (
                <AppNavLink key={href} href={href} label={label} />
              ))}
              <Link
                href="/pricing"
                prefetch
                className="ml-1 rounded-lg px-3 py-2 text-sm font-medium text-ink-muted transition hover:text-seal"
              >
                Pro
              </Link>
            </nav>
            <AccountMenu />
          </div>
        )}
      </div>
    </header>
  );
}
