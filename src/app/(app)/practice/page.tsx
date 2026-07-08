import PracticeSession from "@/components/practice/PracticeSession";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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
        <h1 className="text-2xl font-semibold text-gray-900">AI Practice</h1>
        <p className="mt-2 text-sm text-gray-600">
          Answer adaptive HSK questions powered by AI. Free accounts get 20 questions
          per day.
        </p>
      </div>
      <PracticeSession />
    </div>
  );
}
