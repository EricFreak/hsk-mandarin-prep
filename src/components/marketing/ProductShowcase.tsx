import type { ReactNode } from "react";

function MiniBrowser({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-mist bg-white shadow-card">
      <div className="flex items-center gap-2 border-b border-mist bg-paper-dark/60 px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-seal/40" />
        <span className="h-2 w-2 rounded-full bg-jade/40" />
        <span className="h-2 w-2 rounded-full bg-mist" />
        <span className="ml-2 truncate text-xs font-medium text-ink-muted">{title}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export default function ProductShowcase() {
  return (
    <section className="border-y border-mist bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-semibold text-ink">
            Built for HSK 3.0 success
          </h2>
          <p className="mt-3 text-ink-muted">
            Listening, vocabulary, and study planning — in one English-first workspace.
          </p>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          <MiniBrowser title="Listening Practice">
            <div className="flex items-center gap-2 rounded-lg bg-jade/10 px-3 py-2 text-xs font-medium text-jade">
              <span aria-hidden="true">🔊</span> Play audio
            </div>
            <p className="mt-3 text-sm font-medium text-ink">
              你明天几点去学校？
            </p>
            <ul className="mt-3 space-y-2 text-xs text-ink-muted">
              <li className="rounded-md border border-mist px-2 py-1.5">A. 八点</li>
              <li className="rounded-md border border-mist px-2 py-1.5">B. 明天</li>
            </ul>
          </MiniBrowser>

          <MiniBrowser title="Vocabulary Practice">
            <p className="text-center font-display text-3xl font-semibold text-ink">提供</p>
            <p className="mt-1 text-center text-xs text-jade">tí gōng</p>
            <ul className="mt-4 space-y-2 text-xs">
              <li className="rounded-md border border-jade bg-jade/10 px-2 py-1.5 text-jade">
                ✓ to provide
              </li>
              <li className="rounded-md border border-mist px-2 py-1.5 text-ink-muted">
                to protect
              </li>
            </ul>
          </MiniBrowser>

          <MiniBrowser title="Study Plan">
            <ul className="space-y-2 text-xs">
              <li className="flex items-center justify-between rounded-md bg-paper px-2 py-2">
                <span className="text-ink">Listening · Short conversations</span>
                <span className="text-ink-muted">15m</span>
              </li>
              <li className="flex items-center justify-between rounded-md bg-paper px-2 py-2">
                <span className="text-ink">Vocabulary · High frequency</span>
                <span className="text-ink-muted">20m</span>
              </li>
              <li className="flex items-center justify-between rounded-md bg-paper px-2 py-2">
                <span className="text-ink">Mock exam review</span>
                <span className="text-ink-muted">10m</span>
              </li>
            </ul>
          </MiniBrowser>
        </div>
      </div>
    </section>
  );
}
