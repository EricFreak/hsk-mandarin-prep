import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding",
    "/placement",
    "/diagnosis",
    "/practice/:path*",
    "/flashcards/:path*",
    "/mock-exam/:path*",
    "/mistakes/:path*",
    "/pricing",
    "/login",
    "/auth/:path*",
    "/api/:path*",
  ],
};
