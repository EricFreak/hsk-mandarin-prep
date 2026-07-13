import JourneyPageClient from "@/components/dashboard/JourneyPageClient";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export default async function DashboardJourneyPage() {
  if (!hasSupabaseEnv()) {
    return (
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Journey</h1>
        <p className="mt-2 text-sm text-ink-muted">Supabase is not configured.</p>
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

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard" className="text-sm text-link">
          ← Dashboard
        </Link>
        <h1 className="mt-3 font-display text-2xl font-semibold text-ink">Full journey</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Theme-level outline for every week. Locked weeks show what&apos;s ahead — tasks unlock
          one week at a time after mastery.
        </p>
      </div>
      <JourneyPageClient />
    </div>
  );
}
