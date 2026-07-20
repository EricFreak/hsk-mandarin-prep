import ContinueCta from "@/components/marketing/ContinueCta";

const FREE_CHAIN = [
  {
    step: "1",
    title: "Free Diagnosis",
    body: "Level 3 listening and reading — sized to open your report, not burn a mock quota.",
  },
  {
    step: "2",
    title: "Full AI Report",
    body: "Complete weakness report — not truncated.",
  },
  {
    step: "3",
    title: "Outline + One Quote",
    body: "Full outline, total workload, and a one-time quote.",
  },
  {
    step: "4",
    title: "Sample Taste + Writing AI",
    body: "Multi-skill sample including one full AI writing review.",
  },
  {
    step: "5",
    title: "Locked Task Previews",
    body: "See later work you can open after you pay — look, don’t do.",
  },
] as const;

/** Static free-inventory section — no autoplay product tour. */
export default function BeforeYouPaySection() {
  return (
    <section id="before-you-pay" aria-labelledby="before-you-pay-heading">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <h2
          id="before-you-pay-heading"
          className="text-center font-display text-3xl font-semibold text-ink"
        >
          What You Get Before You Pay
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-sm text-ink-muted">
          Full diagnosis, a clear quote, and a real multi-skill sample — including one AI
          writing review.
        </p>

        <ol className="mx-auto mt-10 max-w-2xl space-y-5">
          {FREE_CHAIN.map((item) => (
            <li key={item.step} className="flex gap-4">
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-jade/10 font-display text-xs font-semibold text-jade">
                {item.step}
              </span>
              <div>
                <h3 className="font-display text-base font-semibold text-ink">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">{item.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mx-auto mt-10 max-w-md overflow-hidden rounded-2xl border border-mist bg-white shadow-card">
          <div className="border-b border-mist bg-paper-dark/60 px-4 py-2.5">
            <p className="text-xs font-medium text-ink-muted">
              Diagnosis preview · sample
            </p>
          </div>
          <div className="space-y-4 p-5">
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-display text-sm font-semibold text-ink">
                HSK Level 3 readiness
              </p>
              <p className="font-display text-2xl font-semibold tabular-nums text-jade">
                72
              </p>
            </div>
            {(
              [
                { skill: "Listening", pct: 62 },
                { skill: "Reading", pct: 81 },
                { skill: "Writing", pct: 54 },
              ] as const
            ).map((row) => (
              <div key={row.skill}>
                <div className="mb-1 flex justify-between text-xs text-ink-muted">
                  <span>{row.skill}</span>
                  <span className="tabular-nums">{row.pct}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-mist">
                  <div
                    className={`h-full rounded-full ${
                      row.skill === "Writing" ? "bg-seal/70" : "bg-jade"
                    }`}
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
              </div>
            ))}
            <p className="text-xs leading-relaxed text-ink-muted">
              Top gap: Writing — practice aims here first after you pay.
            </p>
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <ContinueCta className="btn-primary px-6 py-3 text-base">
            Start with a free diagnosis
          </ContinueCta>
        </div>
      </div>
    </section>
  );
}
