"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const WEAKNESSES = [
  { label: "Listening", value: 60, tag: "Weak", color: "bg-seal" },
  { label: "Vocabulary", value: 82, tag: "Strong", color: "bg-jade" },
];

function BuiltInScoreCard() {
  return (
    <div className="surface-card relative overflow-hidden p-6 shadow-lift">
      <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-jade/10" />
      <p className="text-center text-sm font-semibold text-ink">Mock Exam Result</p>
      <div className="relative mx-auto mt-5 flex h-36 w-36 items-center justify-center">
        <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke="#E8E4DF" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="#2D6A6A"
            strokeWidth="8"
            strokeDasharray={`${78 * 2.64} 264`}
            strokeLinecap="round"
          />
        </svg>
        <div className="text-center">
          <p className="font-display text-4xl font-semibold text-ink">78%</p>
        </div>
      </div>
      <p className="mt-2 text-center text-sm text-ink-muted">
        Score: <span className="font-semibold text-ink">234</span>/300
      </p>
      <p className="mt-1 text-center text-xs font-medium text-jade">Top 28%</p>
      <div className="mt-6 border-t border-mist pt-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Weakness Report
        </p>
        <div className="mt-3 space-y-3">
          {WEAKNESSES.map((item) => (
            <div key={item.label}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium text-ink">{item.label}</span>
                <span
                  className={
                    item.tag === "Weak"
                      ? "font-semibold text-seal"
                      : "font-semibold text-jade"
                  }
                >
                  {item.tag}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-paper-dark">
                <div
                  className={`h-full rounded-full ${item.color}`}
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Drop Lovart crop at public/brand/hero-mockup.png to override */
export default function HeroVisual() {
  const [lovartReady, setLovartReady] = useState(false);

  useEffect(() => {
    fetch("/brand/hero-mockup.png", { method: "HEAD" })
      .then((response) => setLovartReady(response.ok))
      .catch(() => setLovartReady(false));
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-jade/10 via-transparent to-seal/5" />
      <div className="relative">
        {lovartReady ? (
          <Image
            src="/brand/hero-mockup.png"
            alt="HSK mock exam score and weakness breakdown"
            width={560}
            height={420}
            className="w-full rounded-2xl shadow-lift"
            priority
          />
        ) : (
          <BuiltInScoreCard />
        )}
      </div>
    </div>
  );
}
