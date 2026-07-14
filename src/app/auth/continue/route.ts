import {
  isSafeIntent,
  resolveContinueHref,
} from "@/lib/auth/resolve-continue-href";
import {
  fetchLearnerContinueProfile,
} from "@/lib/auth/continue-destination";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Post-login bounce: applies journey resolver to `next` intent.
 * Used by the login form after password sign-in/sign-up when a session exists.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const rawNext = searchParams.get("next");
  const intent = isSafeIntent(rawNext) ? rawNext : "/dashboard";

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      `${origin}${resolveContinueHref({ authenticated: false, intent })}`,
    );
  }

  const profile = await fetchLearnerContinueProfile(user.id);
  const dest = resolveContinueHref({
    authenticated: true,
    profile,
    intent,
  });

  return NextResponse.redirect(`${origin}${dest}`);
}
