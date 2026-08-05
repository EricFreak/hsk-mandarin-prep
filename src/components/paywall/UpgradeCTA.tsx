"use client";

import Link from "next/link";

type UpgradeCTAProps = {
  title: string;
  description: string;
  className?: string;
};

export default function UpgradeCTA({
  title,
  description,
  className = "",
}: UpgradeCTAProps) {
  return (
    <div
      className={`rounded-xl border border-jade/20 bg-jade/5 p-6 text-center ${className}`}
    >
      <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
      <p className="mt-2 text-sm text-ink-muted">{description}</p>
      <Link href="/plan/quote" className="mt-4 inline-block btn-primary">
        See my quote
      </Link>
    </div>
  );
}
