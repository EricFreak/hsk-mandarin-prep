import { requireJourneyRoute } from "@/lib/auth/continue-destination";
import { createClient } from "@/lib/supabase/server";
import { CoachPackPicker } from "@/components/quote/CoachPackPicker";
import { CustomPlanConfigurator } from "@/components/quote/CustomPlanConfigurator";
import { SprintPanel } from "@/components/quote/SprintPanel";

export const dynamic = "force-dynamic";

export default async function QuotePage() {
  const { userId } = await requireJourneyRoute({ intent: "/plan/quote" });
  const supabase = createClient();
  const { data: learner } = await supabase
    .from("learner_profiles")
    .select(
      "service_intent, target_exam_date, minutes_per_day, free_sprint_used_at",
    )
    .eq("user_id", userId)
    .maybeSingle();

  const intent = learner?.service_intent ?? "coach";

  return (
    <div className="mx-auto max-w-2xl">
      <p className="section-eyebrow">Plan</p>
      <h1 className="mt-2 font-display text-2xl font-semibold text-ink">
        Your plan, one transparent price
      </h1>
      <p className="mt-2 text-sm text-ink-muted">
        Pay once for a defined amount of work. Same rate for everyone — no
        urgency premium.
      </p>

      <div className="mt-6">
        {intent === "exam_custom" ? (
          <CustomPlanConfigurator
            examDate={learner?.target_exam_date ?? null}
            minutesPerDay={learner?.minutes_per_day ?? null}
          />
        ) : intent === "sprint" ? (
          <SprintPanel freeUsed={Boolean(learner?.free_sprint_used_at)} />
        ) : (
          <CoachPackPicker />
        )}
      </div>

      <a
        href="/onboarding"
        className="mt-6 inline-block text-sm text-link"
      >
        Switch service type
      </a>
    </div>
  );
}
