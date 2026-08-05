"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics/track";

/** Fire a funnel event once on mount (for server-rendered destinations). */
export default function FunnelBeacon({
  event,
  props,
}: {
  event: string;
  props?: Record<string, string | number | boolean | null | undefined>;
}) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    track(event, props);
    // Intentionally once-per-mount; ignore prop identity churn.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);

  return null;
}
