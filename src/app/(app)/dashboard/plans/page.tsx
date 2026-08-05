import PastPlansView from "@/components/dashboard/PastPlansView";
import { requireJourneyRoute } from "@/lib/auth/continue-destination";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPlansPage() {
  await requireJourneyRoute({ intent: "/dashboard/plans", allowDiagnosisHome: true });

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard" className="text-sm text-link">
          ← Dashboard
        </Link>
        <h1 className="mt-3 font-display text-2xl font-semibold text-ink">Past plans</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Read-only archive of weekly study plans. The active week stays on your Dashboard.
        </p>
      </div>
      <PastPlansView />
    </div>
  );
}
