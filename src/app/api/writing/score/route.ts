import { fetchAccess } from "@/lib/lp/access-server";
import { hasFullAccess } from "@/lib/lp/access";
import { scoreWriting } from "@/lib/openai/writing-score";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

async function getAuthenticatedUser() {
  if (!hasSupabaseEnv()) {
    return {
      error: NextResponse.json(
        { error: "Supabase is not configured" },
        { status: 503 },
      ),
    };
  }

  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { supabase, user };
}

const requestSchema = z.object({
  prompt: z.string().min(1),
  userText: z.string(),
});

export async function POST(request: Request) {
  const auth = await getAuthenticatedUser();
  if ("error" in auth) return auth.error;

  const { supabase, user } = auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const access = await fetchAccess(supabase, user.id);
    const paid = hasFullAccess(access);

    let consumeFreeWriting = false;
    if (!paid) {
      const { data: learner } = await supabase
        .from("learner_profiles")
        .select("free_writing_review_used_at")
        .eq("user_id", user.id)
        .maybeSingle();

      if (learner?.free_writing_review_used_at) {
        return NextResponse.json(
          { upgrade: true, reason: "free_writing_used" },
          { status: 403 },
        );
      }
      consumeFreeWriting = true;
    }

    const result = await scoreWriting(parsed.data.prompt, parsed.data.userText);

    if (consumeFreeWriting) {
      const now = new Date().toISOString();
      const admin = createAdminClient();
      if (!admin) {
        console.error("Admin client unavailable; free writing stamp skipped");
      } else {
        const { error: stampError } = await admin
          .from("learner_profiles")
          .update({ free_writing_review_used_at: now, updated_at: now })
          .eq("user_id", user.id)
          .is("free_writing_review_used_at", null);

        if (stampError) {
          console.error("Failed to stamp free writing review:", stampError);
        }
      }
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("Writing score failed:", err);
    return NextResponse.json(
      { error: "Failed to score writing response" },
      { status: 500 },
    );
  }
}
