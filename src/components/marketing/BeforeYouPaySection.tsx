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

/** Static free inventory + one writing-AI proof mock. No autoplay. */
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

        <div className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-12">
          <ol className="space-y-5">
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

          <WritingAiProofCard />
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

function WritingAiProofCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-mist bg-white shadow-card">
      <div className="flex items-center justify-between gap-2 border-b border-mist bg-paper-dark/60 px-4 py-2.5">
        <span className="truncate text-sm font-medium text-ink-muted">
          Sample taste · Writing AI review included
        </span>
        <span className="shrink-0 rounded-full bg-jade/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-jade">
          Free once
        </span>
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-jade">
              DeepSeek writing review · free sample
            </p>
            <p className="mt-1 text-sm text-ink-muted">
              Prompt: 介绍你喜欢的运动，并说明原因（约 80 字）
            </p>
          </div>
          <div className="text-right">
            <p className="font-display text-3xl font-semibold text-jade">72</p>
            <p className="text-[10px] font-semibold uppercase text-ink-muted">/ 100</p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-4 gap-2">
          {[
            { label: "Grammar", score: 70 },
            { label: "Vocab", score: 78 },
            { label: "Task", score: 68 },
            { label: "Flow", score: 74 },
          ].map((row) => (
            <div
              key={row.label}
              className="rounded-lg border border-mist bg-paper-dark/40 px-2 py-1.5 text-center"
            >
              <p className="font-display text-sm font-semibold text-ink">{row.score}</p>
              <p className="text-[10px] text-ink-muted">{row.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-lg border border-mist bg-paper-dark/50 px-3 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
            Your draft
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink">
            我喜欢打篮球。因为篮球很有意思，我每个周末和朋友一起打。运动以后我觉得很开心，
            身体也
            <span className="bg-seal/15 text-seal line-through decoration-seal/60">
              健康的
            </span>
            <span className="ml-1 rounded bg-jade/15 px-1 font-medium text-jade">
              更健康了
            </span>
            。
          </p>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-seal/20 bg-seal/5 px-3 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-seal">
              Grammar
            </p>
            <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-ink-muted">
              <li>
                <span className="font-medium text-ink">了</span> after result: 更健康了
                marks change-of-state better than 健康的.
              </li>
              <li>
                Add <span className="font-medium text-ink">因为…所以…</span> to link reason
                and feeling in one sentence.
              </li>
            </ul>
          </div>
          <div className="rounded-lg border border-jade/25 bg-jade/5 px-3 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-jade">
              Vocabulary · Next
            </p>
            <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-ink-muted">
              <li>Strong: 周末、朋友、开心 — on-level HSK 3.</li>
              <li>
                Try: <span className="font-medium text-ink">锻炼身体</span> /{" "}
                <span className="font-medium text-ink">团队合作</span> for richer sport talk.
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-jade/25 bg-white px-3 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-jade">
            Rewrite to try — model sentence
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink">
            因为打篮球既有意思又能锻炼身体，
            <span className="rounded bg-jade/15 px-1 font-medium text-jade">所以</span>
            我每个周末都和朋友一起打。
          </p>
        </div>

        <p className="mt-4 border-t border-mist pt-3 text-xs leading-relaxed text-ink-muted">
          One full AI review in the free sample. More writing reviews come with your
          package.
        </p>
      </div>
    </div>
  );
}
