import OnboardingForm from "@/components/onboarding/OnboardingForm";
import { requireJourneyRoute } from "@/lib/auth/continue-destination";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const { stage } = await requireJourneyRoute({
    intent: "/onboarding",
    allowIncomplete: true,
  });

  if (stage === "complete" || stage === "diagnosis_done") {
    redirect("/dashboard");
  }
  if (stage === "needs_diagnosis") {
    redirect("/diagnosis");
  }

  return <OnboardingForm />;
}
