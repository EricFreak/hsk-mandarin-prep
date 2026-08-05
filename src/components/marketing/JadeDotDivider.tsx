/**
 * Short mid-page punctuation for Single plane (E).
 * Three jade lozenges — never full-bleed.
 */
export default function JadeDotDivider() {
  return (
    <div className="flex items-center justify-center gap-2.5 py-2" aria-hidden="true">
      <span className="h-2 w-2 rotate-45 bg-jade/50" />
      <span className="h-2 w-2 rotate-45 bg-jade/50" />
      <span className="h-2 w-2 rotate-45 bg-jade/50" />
    </div>
  );
}
