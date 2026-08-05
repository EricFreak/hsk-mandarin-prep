import ProgressView from "@/components/dashboard/ProgressView";
import { requireJourneyRoute } from "@/lib/auth/continue-destination";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardProgressPage() {
  await requireJourneyRoute({ intent: "/dashboard/progress", allowDiagnosisHome: true });

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard" className="text-sm text-link">
          ← Dashboard
        </Link>
        <h1 className="mt-3 font-display text-2xl font-semibold text-ink">Progress</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Multi-dimensional trends from your AI coach reports over time.
        </p>
      </div>
      <ProgressView />
    </div>
  );
}
