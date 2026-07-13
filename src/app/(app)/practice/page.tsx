import PracticeSession from "@/components/practice/PracticeSession";
import { createClient } from "@/lib/supabase/server";
import { planLabel, type Plan } from "@/lib/entitlements";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function PracticePage() {
  let plan: Plan = "free";

  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .maybeSingle();

    plan = profile?.plan === "pro" ? "pro" : "free";
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-ink">AI Practice</h1>
        <p className="mt-2 text-sm text-ink-muted">
          {plan === "pro"
            ? `Adaptive HSK 3 practice for your ${planLabel(plan)} plan — unlimited AI questions from the full HSK 3.0 word list.`
            : "Adaptive HSK 3 practice powered by AI. Free accounts get 20 questions per day."}
        </p>
      </div>
      <Suspense fallback={null}>
        <PracticeSession userPlan={plan} />
      </Suspense>
    </div>
  );
}
