import { sm2 } from "@/lib/srs";
import { getWordById, getWordsForLevel } from "@/lib/syllabus";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

type SrsRow = {
  id: string;
  word_id: string;
  level: number;
  interval_days: number;
  repetitions: number;
  ease_factor: number;
  due_at: string;
};

function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

function serializeCard(row: SrsRow) {
  return {
    id: row.id,
    wordId: row.word_id,
    level: row.level,
    intervalDays: row.interval_days,
    repetitions: row.repetitions,
    easeFactor: Number(row.ease_factor),
    dueAt: row.due_at,
  };
}

function serializeWord(wordId: string) {
  const word = getWordById(wordId);
  if (!word) return null;
  return {
    hanzi: word.hanzi,
    pinyin: word.pinyin,
    english: word.english,
  };
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

async function fetchDueCard(
  supabase: ReturnType<typeof createClient>,
  userId: string,
) {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("srs_cards")
    .select("*")
    .eq("user_id", userId)
    .lte("due_at", now)
    .order("due_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as SrsRow | null;
}

async function seedHsk1Cards(
  supabase: ReturnType<typeof createClient>,
  userId: string,
) {
  const words = getWordsForLevel(1);
  const dueAt = new Date().toISOString();

  const rows = words.map((word) => ({
    user_id: userId,
    word_id: word.id,
    level: 1,
    interval_days: 1,
    repetitions: 0,
    ease_factor: 2.5,
    due_at: dueAt,
  }));

  const { error } = await supabase.from("srs_cards").insert(rows);
  if (error) {
    throw error;
  }
}

export async function GET() {
  const auth = await getAuthenticatedUser();
  if ("error" in auth) return auth.error;

  const { supabase, user } = auth;

  try {
    let row = await fetchDueCard(supabase, user.id);

    if (!row) {
      const { count, error: countError } = await supabase
        .from("srs_cards")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (countError) {
        throw countError;
      }

      if ((count ?? 0) === 0) {
        await seedHsk1Cards(supabase, user.id);
        row = await fetchDueCard(supabase, user.id);
      }
    }

    if (!row) {
      return NextResponse.json({
        card: null,
        word: null,
        showAnswer: false,
      });
    }

    return NextResponse.json({
      card: serializeCard(row),
      word: serializeWord(row.word_id),
      showAnswer: false,
    });
  } catch (err) {
    console.error("SRS review GET failed:", err);
    return NextResponse.json(
      { error: "Failed to load review card" },
      { status: 500 },
    );
  }
}

const postSchema = z.object({
  wordId: z.string().min(1),
  quality: z.number().int().min(1).max(5),
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

  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { wordId, quality } = parsed.data;

  try {
    const { data: row, error: fetchError } = await supabase
      .from("srs_cards")
      .select("*")
      .eq("user_id", user.id)
      .eq("word_id", wordId)
      .maybeSingle();

    if (fetchError) {
      throw fetchError;
    }

    if (!row) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    const card = row as SrsRow;
    const result = sm2(
      {
        interval: card.interval_days,
        repetitions: card.repetitions,
        easeFactor: Number(card.ease_factor),
      },
      quality,
    );

    const { data: updated, error: updateError } = await supabase
      .from("srs_cards")
      .update({
        interval_days: result.interval,
        repetitions: result.repetitions,
        ease_factor: result.easeFactor,
        due_at: result.dueAt.toISOString(),
      })
      .eq("id", card.id)
      .select("*")
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      card: serializeCard(updated as SrsRow),
    });
  } catch (err) {
    console.error("SRS review POST failed:", err);
    return NextResponse.json(
      { error: "Failed to update review card" },
      { status: 500 },
    );
  }
}
