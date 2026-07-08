import Link from "next/link";
import PricingCheckout from "@/components/paywall/PricingCheckout";

export const metadata = {
  title: "Pricing — HSK Mandarin Prep",
  description:
    "Start free with HSK flashcards and one mock exam. Upgrade to Pro for unlimited AI practice and all mock exams.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="text-lg font-semibold text-gray-900">
            HSK Mandarin Prep
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Dashboard
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

      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Simple, transparent pricing
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-gray-600">
            Start free. Upgrade to Pro when you need unlimited practice, all
            mock exams, and AI writing feedback.
          </p>
        </div>

        <div className="mt-12">
          <PricingCheckout />
        </div>
      </main>

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
