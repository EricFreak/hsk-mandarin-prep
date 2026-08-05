import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  event: z.string().min(1).max(64),
  props: z
    .record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()]))
    .optional()
    .default({}),
});

/**
 * Funnel sink: structured server log with user_id when authed.
 * No third-party analytics vendor.
 */
export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
    }

    const { event, props } = parsed.data;
    let userId: string | null = null;
    try {
      if (
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ) {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        userId = user?.id ?? null;
      }
    } catch {
      // analytics must never fail the product
    }

    const anonId =
      typeof props.anon_id === "string" && props.anon_id.length > 0
        ? props.anon_id
        : null;

    console.info(
      JSON.stringify({
        type: "funnel",
        event,
        props: {
          ...props,
          user_id: userId,
          anon_id: anonId,
        },
        ts: new Date().toISOString(),
      }),
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
