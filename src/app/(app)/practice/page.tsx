import PracticeSession from "@/components/practice/PracticeSession";
import { requireJourneyRoute } from "@/lib/auth/continue-destination";
import { createClient } from "@/lib/supabase/server";
import { planLabel, type Plan } from "@/lib/entitlements";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function PracticePage() {
  const { userId } = await requireJourneyRoute({ intent: "/practice" });

  let plan: Plan = "free";
  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    const supabase = createClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", userId)
      .maybeSingle();
    plan = profile?.plan === "pro" ? "pro" : "free";
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-ink">AI Practice</h1>
        <p className="mt-2 text-sm text-ink-muted">
          {plan === "pro"
            ? `Adaptive HSK Level 3 practice for your ${planLabel(plan)} plan — unlimited AI questions.`
            : "Adaptive HSK Level 3 practice powered by AI. Free accounts get 20 questions per day."}
        </p>
      </div>
      <Suspense fallback={null}>
        <PracticeSession userPlan={plan} />
      </Suspense>
    </div>
  );
}
