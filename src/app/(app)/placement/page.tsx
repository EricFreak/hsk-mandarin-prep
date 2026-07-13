import MockExamSession from "@/components/mock-exam/MockExamSession";
import {
  HSK3_PLACEMENT_EXAM,
  HSK3_PLACEMENT_MCQ_COUNT,
  HSK3_PLACEMENT_TEMPLATE_ID,
  HSK3_PLACEMENT_TEMPLATE_VERSION,
} from "@/data/placement/hsk3-placement";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export default async function PlacementPage() {
  if (!hasSupabaseEnv()) {
    return (
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">
          HSK 3 Placement
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Supabase is not configured. Set environment variables to take the
          placement exam.
        </p>
      </div>
    );
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=%2Fplacement");
  }

  return (
    <div>
      <div className="mb-8">
        <p className="section-eyebrow">Placement</p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-ink">
          HSK 3 level check
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          A short diagnostic to calibrate your study plan. Answer{" "}
          {HSK3_PLACEMENT_MCQ_COUNT} multiple-choice questions — about 10
          minutes.
        </p>
      </div>

      <MockExamSession
        plan="free"
        exam={{
          questions: HSK3_PLACEMENT_EXAM,
          templateId: HSK3_PLACEMENT_TEMPLATE_ID,
          templateVersion: HSK3_PLACEMENT_TEMPLATE_VERSION,
          mcqCount: HSK3_PLACEMENT_MCQ_COUNT,
        }}
        completePrimaryHref="/dashboard"
        completePrimaryLabel="View dashboard"
        hideReviewLink
      />
    </div>
  );
}
