import MarketingHeader from "@/components/marketing/MarketingHeader";

const FOOTER_TRUST = [
  "Designed for international learners",
  "Secure & privacy-focused",
  "Aligned with official HSK 3.0",
];

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-paper">
      <MarketingHeader />
      <main>{children}</main>
      <footer className="border-t border-mist bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="flex flex-col items-center gap-6 border-b border-mist pb-8 sm:flex-row sm:justify-between">
            <div className="text-center sm:text-left">
              <p className="font-display text-lg font-semibold text-ink">
                Trusted by students worldwide
              </p>
              <p className="mt-1 text-sm text-ink-muted">Join our founder beta cohort</p>
            </div>
            <div className="flex items-center gap-2">
              {["A", "B", "C", "D", "E"].map((initial) => (
                <span
                  key={initial}
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-jade/15 text-xs font-semibold text-jade shadow-sm"
                >
                  {initial}
                </span>
              ))}
              <span className="ml-2 rounded-full bg-paper-dark px-3 py-1 text-xs font-medium text-ink-muted">
                Beta
              </span>
            </div>
          </div>
          <ul className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-ink-muted">
            {FOOTER_TRUST.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="text-jade" aria-hidden="true">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-8 text-center text-sm text-ink-muted">
            Aligned with the official HSK 3.0 syllabus (GF0025-2021). Not affiliated
            with Hanban or chinesetest.cn.
          </p>
        </div>
      </footer>
    </div>
  );
}
