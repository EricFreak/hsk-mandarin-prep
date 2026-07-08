import Link from "next/link";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="text-lg font-semibold text-gray-900">
            HSK Mandarin Prep
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/hsk-2-vs-3"
              className="hidden text-sm text-gray-600 hover:text-gray-900 sm:inline"
            >
              HSK 2.0 vs 3.0
            </Link>
            <Link
              href="/login"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Login
            </Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-8 text-center text-sm text-gray-500 sm:px-6">
          <p>
            Aligned with the official HSK 3.0 syllabus (GF0025-2021). Not
            affiliated with Hanban or chinesetest.cn.
          </p>
        </div>
      </footer>
    </div>
  );
}
