"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const SKILLS = [
  { label: "Listening", value: 72, color: "bg-jade" },
  { label: "Reading", value: 88, color: "bg-jade-light" },
  { label: "Vocabulary", value: 65, color: "bg-seal" },
  { label: "Grammar", value: 91, color: "bg-ink/80" },
];

function BuiltInScoreCard() {
  return (
    <div className="surface-card relative overflow-hidden p-6 shadow-lift">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-jade/10" />
      <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-seal/10" />
      <p className="section-eyebrow">HSK 3 mock result</p>
      <div className="mt-4 flex items-end gap-3">
        <span className="font-display text-6xl font-semibold text-ink">82</span>
        <span className="mb-2 text-2xl font-medium text-ink-muted">%</span>
      </div>
      <p className="mt-1 text-sm text-ink-muted">Indicative score · beta</p>
      <div className="mt-6 space-y-3">
        {SKILLS.map((skill) => (
          <div key={skill.label}>
            <div className="mb-1 flex justify-between text-xs font-medium text-ink-muted">
              <span>{skill.label}</span>
              <span>{skill.value}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-paper-dark">
              <div
                className={`h-full rounded-full ${skill.color}`}
                style={{ width: `${skill.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-6 rounded-lg bg-paper px-3 py-2 text-center text-xs font-medium text-jade">
        Practice weak areas →
      </p>
    </div>
  );
}

/** Lovart hero: drop file at public/brand/hero-mockup.png */
export default function HeroVisual() {
  const [lovartReady, setLovartReady] = useState(false);

  useEffect(() => {
    fetch("/brand/hero-mockup.png", { method: "HEAD" })
      .then((response) => setLovartReady(response.ok))
      .catch(() => setLovartReady(false));
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-jade/10 via-transparent to-seal/10" />
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
