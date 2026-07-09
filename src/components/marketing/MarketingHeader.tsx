import Link from "next/link";
import BrandLogo from "@/components/marketing/BrandLogo";

export default function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-mist/80 bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <BrandLogo />
        <nav className="flex items-center gap-4 sm:gap-8">
          <Link
            href="/hsk-2-vs-3"
            className="hidden text-sm font-medium text-ink-muted transition hover:text-ink sm:inline"
          >
            HSK 2 vs 3
          </Link>
          <Link
            href="/pricing"
            className="hidden text-sm font-medium text-ink-muted transition hover:text-ink sm:inline"
          >
            Pricing
          </Link>
          <Link href="/login" className="btn-primary text-sm">
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
}
