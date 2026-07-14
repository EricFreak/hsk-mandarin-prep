import JourneyPageClient from "@/components/dashboard/JourneyPageClient";
import { requireJourneyRoute } from "@/lib/auth/continue-destination";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardJourneyPage() {
  await requireJourneyRoute({
    intent: "/dashboard/journey",
    allowDiagnosisHome: true,
  });

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard" className="text-sm text-link">
          ← Dashboard
        </Link>
        <h1 className="mt-3 font-display text-2xl font-semibold text-ink">Full journey</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Theme-level outline for every week. Locked weeks show what&apos;s ahead — tasks unlock
          one week at a time after mastery.
        </p>
      </div>
      <JourneyPageClient />
    </div>
  );
}
