import FlashcardReview from "@/components/flashcards/FlashcardReview";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function FlashcardsPage() {
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
        <h1 className="text-2xl font-semibold text-gray-900">Flashcards</h1>
        <p className="mt-2 text-sm text-gray-600">
          Review HSK vocabulary with spaced repetition. Flip the card, then rate
          how well you remembered it.
        </p>
      </div>
      <FlashcardReview />
    </div>
  );
}
