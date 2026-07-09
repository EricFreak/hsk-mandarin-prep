import DemoVocabularyNotice from "@/components/marketing/DemoVocabularyNotice";
import PracticeSession from "@/components/practice/PracticeSession";
import { PracticeQuestionSkeleton } from "@/components/ui/Skeleton";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function PracticePage() {
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
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-ink">AI Practice</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Answer adaptive HSK questions powered by AI. Free accounts get 20 questions
          per day.
        </p>
        <DemoVocabularyNotice className="mt-4" />
      </div>
      <Suspense fallback={<PracticeQuestionSkeleton />}>
        <PracticeSession />
      </Suspense>
    </div>
  );
}
