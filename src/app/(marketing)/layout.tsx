import Link from "next/link";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import LearnerAvatars from "@/components/marketing/LearnerAvatars";

const FOOTER_LINKS = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/hsk-2-vs-3", label: "HSK exam guide" },
] as const;

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-paper">
      <MarketingHeader />
      <main>{children}</main>
      <footer>
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-between">
            <div className="text-center sm:text-left">
              <p className="font-display text-base font-semibold text-ink">HSK Prep</p>
              <p className="mt-1 text-xs text-ink-muted">AI Coach for HSK Level 3</p>
            </div>
            <LearnerAvatars />
          </div>

          <nav
            aria-label="Footer"
            className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm"
          >
            {FOOTER_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="font-medium text-ink-muted transition hover:text-ink"
              >
                {label}
              </Link>
            ))}
          </nav>

          <p className="mt-6 text-center text-xs leading-relaxed text-ink-muted">
            Aligned with the official HSK Level 3 syllabus (GF0025-2021). Not affiliated with
            Hanban or chinesetest.cn.
          </p>
        </div>
      </footer>
    </div>
  );
}
