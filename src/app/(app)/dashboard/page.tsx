import DashboardView from "@/components/dashboard/DashboardView";
import { requireJourneyRoute } from "@/lib/auth/continue-destination";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // Allow diagnosis_done: Dashboard owns coach pending/error (durable home).
  await requireJourneyRoute({
    intent: "/dashboard",
    allowDiagnosisHome: true,
  });
  return <DashboardView />;
}
