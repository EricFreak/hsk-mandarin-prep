const ANON_KEY = "hsk_anon_id";

/** Stable anon id for stitching funnel events across pages. */
export function getOrCreateAnonId(): string {
  if (typeof window === "undefined") return "anon_ssr";
  try {
    const existing = window.localStorage.getItem(ANON_KEY);
    if (existing) return existing;
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `anon_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    window.localStorage.setItem(ANON_KEY, id);
    return id;
  } catch {
    return "anon_ephemeral";
  }
}

export function readAnonId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(ANON_KEY);
  } catch {
    return null;
  }
}
