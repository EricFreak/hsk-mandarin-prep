import OnboardingForm from "@/components/onboarding/OnboardingForm";
import { requireJourneyRoute } from "@/lib/auth/continue-destination";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: { edit?: string };
}) {
  const { stage } = await requireJourneyRoute({
    intent: "/onboarding",
    allowIncomplete: true,
  });

  const editingService = searchParams.edit === "service";

  if (stage === "complete" && !editingService) {
    redirect("/dashboard");
  }
  if (stage === "diagnosis_done") {
    redirect("/dashboard");
  }
  if (stage === "needs_diagnosis") {
    redirect("/diagnosis");
  }

  return <OnboardingForm returnHref={editingService ? "/plan/quote" : undefined} />;
}
