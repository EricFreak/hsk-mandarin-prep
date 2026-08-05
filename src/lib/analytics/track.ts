"use client";

import {
  FUNNEL_EVENTS,
  type FunnelEventName,
  type FunnelProps,
} from "@/lib/analytics/events";
import { getOrCreateAnonId } from "@/lib/analytics/anon-id";

export { FUNNEL_EVENTS };
export type { FunnelEventName, FunnelProps };

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    __hskFunnelEvents?: Array<{
      event: string;
      props?: FunnelProps;
      ts: number;
    }>;
  }
}

/**
 * Fire a funnel event. Best-effort: never throws into UI flows.
 * Attaches anon_id and POSTs to /api/analytics (structured server log).
 */
export function track(event: FunnelEventName | string, props?: FunnelProps): void {
  if (typeof window === "undefined") return;

  try {
    const anonId = getOrCreateAnonId();
    const enriched: FunnelProps = {
      anon_id: anonId,
      ...props,
    };
    const payload = { event, props: enriched, ts: Date.now() };
    window.__hskFunnelEvents = window.__hskFunnelEvents ?? [];
    window.__hskFunnelEvents.push(payload);
    if (window.__hskFunnelEvents.length > 50) {
      window.__hskFunnelEvents.shift();
    }

    window.dispatchEvent(
      new CustomEvent("hsk:analytics", { detail: payload }),
    );

    if (process.env.NODE_ENV === "development") {
      console.debug("[funnel]", event, enriched);
    }

    window.dataLayer?.push({ event, ...enriched });

    const body = JSON.stringify({ event, props: enriched });
    void fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {
      // swallow
    });
  } catch {
    // never break product flows for analytics
  }
}
