import MarketingHeader from "@/components/marketing/MarketingHeader";

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
        <div className="mx-auto max-w-6xl px-4 py-10 text-center text-sm text-ink-muted sm:px-6">
          <p>
            Aligned with the official HSK 3.0 syllabus (GF0025-2021). Not affiliated
            with Hanban or chinesetest.cn.
          </p>
        </div>
      </footer>
    </div>
  );
}
