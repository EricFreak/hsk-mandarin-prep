"use client";

import JourneyOutlineView from "@/components/dashboard/JourneyOutlineView";
import type { CoachJourneyPayload } from "@/lib/coach/fetch-coach";
import useSWR from "swr";

const journeyFetcher = (url: string) =>
  fetch(url).then((response) => {
    if (!response.ok) {
      throw new Error("Failed to load journey");
    }
    return response.json() as Promise<CoachJourneyPayload>;
  });

export default function JourneyPageClient() {
  const { data, error } = useSWR("/api/coach/journey", journeyFetcher, {
    revalidateOnFocus: true,
  });

  return <JourneyOutlineView data={data} error={error} />;
}
