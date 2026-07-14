import MockExamSession from "@/components/mock-exam/MockExamSession";
import {
  HSK3_DIAGNOSIS_EXAM,
  HSK3_DIAGNOSIS_MCQ_COUNT,
  HSK3_DIAGNOSIS_TEMPLATE_ID,
  HSK3_DIAGNOSIS_TEMPLATE_VERSION,
} from "@/data/diagnosis/hsk3-diagnosis";
import { requireJourneyRoute } from "@/lib/auth/continue-destination";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DiagnosisPage() {
  const { stage } = await requireJourneyRoute({
    intent: "/diagnosis",
    allowIncomplete: true,
  });

  if (stage === "needs_exam_prefs") {
    redirect("/onboarding");
  }

  if (stage === "diagnosis_done" || stage === "complete") {
    redirect("/dashboard");
  }

  return (
    <div>
      <div className="mb-8">
        <p className="section-eyebrow">Diagnosis</p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-ink">
          HSK Level 3 level check
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          A short diagnostic to calibrate your study plan. Answer{" "}
          {HSK3_DIAGNOSIS_MCQ_COUNT} multiple-choice questions — about 10
          minutes.
        </p>
      </div>

      <MockExamSession
        plan="free"
        exam={{
          questions: HSK3_DIAGNOSIS_EXAM,
          templateId: HSK3_DIAGNOSIS_TEMPLATE_ID,
          templateVersion: HSK3_DIAGNOSIS_TEMPLATE_VERSION,
          mcqCount: HSK3_DIAGNOSIS_MCQ_COUNT,
        }}
        completePrimaryHref="/dashboard"
        completePrimaryLabel="Open dashboard"
        hideReviewLink
        setupFlow
      />
    </div>
  );
}
