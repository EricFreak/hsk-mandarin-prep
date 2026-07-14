"use client";

import BrandLogo from "@/components/marketing/BrandLogo";
import { createClient } from "@/lib/supabase/client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Mode = "magic_link" | "password";

function continuePath(next: string | null): string {
  const intent = next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  return `/auth/continue?next=${encodeURIComponent(intent)}`;
}

export default function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("password");
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    const supabase = createClient();
    const next = new URLSearchParams(window.location.search).get("next");
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next && next.startsWith("/") ? next : "/onboarding")}`;

    const { data, error: signInError } =
      mode === "magic_link"
        ? await supabase.auth.signInWithOtp({
            email,
            options: { emailRedirectTo: redirectTo },
          })
        : isSignUp
          ? await supabase.auth.signUp({
              email,
              password,
              options: { emailRedirectTo: redirectTo },
            })
          : await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    if (mode === "magic_link") {
      setMessage("Check your email for the sign-in link.");
      return;
    }

    if (isSignUp) {
      if (data.session) {
        router.push(continuePath(next ?? "/onboarding"));
        router.refresh();
        return;
      }
      setMessage(
        "Account created. If email confirmation is enabled, confirm via email then sign in.",
      );
      return;
    }

    setMessage("Signed in successfully.");
    router.push(continuePath(next));
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-4 py-12">
      <div className="mb-8">
        <BrandLogo />
      </div>
      <div className="surface-card w-full max-w-md p-8">
        <p className="section-eyebrow">Welcome back</p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-ink">Sign in</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Use password sign-in for beta testing (avoids email rate limits). Magic
          links are still available.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setMode("password")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              mode === "password"
                ? "bg-ink text-white"
                : "bg-paper-dark text-ink-muted hover:bg-mist"
            }`}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => setMode("magic_link")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              mode === "magic_link"
                ? "bg-ink text-white"
                : "bg-paper-dark text-ink-muted hover:bg-mist"
            }`}
          >
            Magic link
          </button>
          <div className="flex-1" />
          {mode === "password" ? (
            <button
              type="button"
              onClick={() => setIsSignUp((v) => !v)}
              className="rounded-lg bg-paper-dark px-3 py-1.5 text-sm font-medium text-ink-muted hover:bg-mist"
            >
              {isSignUp ? "Switch to Sign in" : "Switch to Sign up"}
            </button>
          ) : null}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-ink">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="input-field"
            />
          </div>

          {mode === "password" ? (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ink">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete={isSignUp ? "new-password" : "current-password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className="input-field"
              />
              <p className="mt-1 text-xs text-ink-muted">
                Tip: For beta testing, you can also create a user in Supabase{" "}
                <span className="font-medium">Authentication → Users</span> and
                sign in here.
              </p>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Working..."
              : mode === "magic_link"
                ? "Send magic link"
                : isSignUp
                  ? "Create account"
                  : "Sign in"}
          </button>
        </form>

        {message ? (
          <p className="mt-4 text-sm text-jade">{message}</p>
        ) : null}
        {error ? <p className="mt-4 text-sm text-seal">{error}</p> : null}
      </div>
    </div>
  );
}
