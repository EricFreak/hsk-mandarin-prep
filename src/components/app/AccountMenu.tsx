"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AccountMenu({ compact }: { compact?: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [planLabel, setPlanLabel] = useState<"Free" | "Pro">("Free");
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    void (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email ?? null);
      const { data } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .maybeSingle();
      setPlanLabel(data?.plan === "pro" ? "Pro" : "Free");
    })();
  }, []);

  const shortEmail = email
    ? email.length > 22
      ? `${email.slice(0, 10)}…${email.slice(-8)}`
      : email
    : "Account";

  async function handleSignOut() {
    setSigningOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } finally {
      setSigningOut(false);
      setOpen(false);
    }
  }

  if (!email) {
    return null;
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-lg border border-mist bg-white px-2.5 py-1.5 text-left text-xs text-ink transition hover:border-jade/40"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="max-w-[9rem] truncate font-medium sm:max-w-[12rem]">
          {shortEmail}
        </span>
        <span
          className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
            planLabel === "Pro"
              ? "bg-jade/10 text-jade"
              : "bg-paper-dark text-ink-muted"
          }`}
        >
          {planLabel}
        </span>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-52 rounded-xl border border-mist bg-white p-2 shadow-card"
        >
          {!compact ? (
            <p className="truncate px-2 py-1.5 text-xs text-ink-muted">{email}</p>
          ) : null}
          <button
            type="button"
            role="menuitem"
            disabled={signingOut}
            onClick={() => void handleSignOut()}
            className="w-full rounded-lg px-2 py-2 text-left text-sm font-medium text-seal hover:bg-seal/5 disabled:opacity-60"
          >
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
