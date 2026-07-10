/** Hero right column — brand atmosphere only, no user data or product UI. */
export default function HeroBrandVisual() {
  return (
    <div
      className="relative mx-auto flex aspect-[4/3] w-full max-w-md items-center justify-center lg:max-w-none"
      aria-hidden
    >
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-jade/15 via-paper to-seal/10 shadow-lift" />
      <div className="absolute inset-6 rounded-2xl border border-white/60 bg-white/40 backdrop-blur-sm" />
      <div className="relative text-center">
        <p className="font-display text-8xl font-semibold leading-none text-seal/20 sm:text-9xl">
          考
        </p>
        <p className="mt-4 text-sm font-medium tracking-wide text-ink-muted">
          HSK 3.0 · AI prep
        </p>
      </div>
    </div>
  );
}
