type LoadingPulseProps = {
  label?: string;
  className?: string;
};

export default function LoadingPulse({
  label = "Loading",
  className = "",
}: LoadingPulseProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
      role="status"
      aria-live="polite"
    >
      <span className="relative flex h-8 w-8 items-center justify-center">
        <span className="absolute h-8 w-8 animate-ping rounded-full bg-jade/20" />
        <span className="relative h-3 w-3 rounded-full bg-jade" />
      </span>
      <span className="text-sm text-ink-muted">{label}</span>
    </div>
  );
}

type AsyncOverlayProps = {
  active: boolean;
  label?: string;
};

export function AsyncOverlay({ active, label = "Updating…" }: AsyncOverlayProps) {
  if (!active) return null;

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/75 backdrop-blur-[2px]">
      <LoadingPulse label={label} />
    </div>
  );
}
