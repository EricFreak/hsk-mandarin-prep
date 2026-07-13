"use client";

import Link from "next/link";
import {
  formatStageLabel,
  JOURNEY_STAGES,
  stageDotIndex,
} from "@/lib/coach/journey/journey-summary";
import type { JourneyStageId } from "@/lib/coach/journey/types";

type Props = {
  stage: JourneyStageId | string | null;
  daysToExam: number | null;
  weekIndex: number;
};

export default function JourneyStrip({ stage, daysToExam, weekIndex }: Props) {
  if (!stage) return null;

  const activeIndex = stageDotIndex(stage as JourneyStageId);

  return (
    <div className="rounded-xl border border-mist bg-white px-4 py-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-muted">
            Journey · {formatStageLabel(stage)} · Week {weekIndex}
          </p>
          <div className="mt-2 flex items-center gap-2">
            {JOURNEY_STAGES.map((stageId, index) => {
              const filled = index <= activeIndex;
              return (
                <span
                  key={stageId}
                  className={
                    filled
                      ? "h-2 w-2 rounded-full bg-jade"
                      : "h-2 w-2 rounded-full border border-mist bg-paper"
                  }
                  title={formatStageLabel(stageId)}
                  aria-hidden
                />
              );
            })}
            <span className="ml-auto text-sm text-ink-muted">
              {daysToExam != null ? `${daysToExam} days to exam` : "Set exam date"}
            </span>
          </div>
        </div>
      </div>
      <Link href="/dashboard/journey" className="text-link mt-2 inline-block text-xs">
        Full journey outline →
      </Link>
    </div>
  );
}
