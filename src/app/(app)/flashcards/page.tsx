import FlashcardReview from "@/components/flashcards/FlashcardReview";
import { requireJourneyRoute } from "@/lib/auth/continue-destination";

export const dynamic = "force-dynamic";

export default async function FlashcardsPage() {
  await requireJourneyRoute({ intent: "/flashcards" });

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-ink">Flashcards</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Review HSK Level 3 vocabulary with spaced repetition. Flip the card, then rate how
          well you remembered it.
        </p>
      </div>
      <FlashcardReview />
    </div>
  );
}
