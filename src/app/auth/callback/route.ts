import { ensureProfileWithoutClobberingPlan, fetchLearnerContinueProfile } from "@/lib/auth/continue-destination";
import {
  isSafeIntent,
  resolveContinueHref,
} from "@/lib/auth/resolve-continue-href";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next");
  const intent = isSafeIntent(rawNext) ? rawNext : "/onboarding";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await ensureProfileWithoutClobberingPlan(user.id, user.email);
      }

      const profile = user
        ? await fetchLearnerContinueProfile(user.id)
        : null;
      const dest = resolveContinueHref({
        authenticated: Boolean(user),
        profile,
        intent,
      });

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";
      const base =
        !isLocalEnv && forwardedHost ? `https://${forwardedHost}` : origin;

      return NextResponse.redirect(`${base}${dest}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
