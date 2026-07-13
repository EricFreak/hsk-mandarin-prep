import DashboardView from "@/components/dashboard/DashboardView";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export default async function DashboardPage() {
  if (!hasSupabaseEnv()) {
    return (
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Dashboard</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Supabase is not configured. Connect your database to see progress.
        </p>
      </div>
    );
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("learner_profiles")
    .select("target_exam_date, journey_started_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile?.target_exam_date && !profile?.journey_started_at) {
    redirect("/onboarding");
  }

  return <DashboardView />;
}
