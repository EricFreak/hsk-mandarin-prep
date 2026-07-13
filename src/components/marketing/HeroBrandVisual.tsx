import Image from "next/image";

/** Hero right column — AI Coach brand visual (atmosphere only, no live user data). */
export default function HeroBrandVisual() {
  return (
    <div
      className="relative mx-auto aspect-[4/3] w-full max-w-lg overflow-hidden rounded-3xl border border-mist/80 shadow-lift lg:max-w-none"
      aria-hidden
    >
      <Image
        src="/brand/hero-visual.png"
        alt=""
        fill
        priority
        className="object-cover object-center"
        sizes="(max-width: 1024px) 90vw, 560px"
      />
      <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/40" />
    </div>
  );
}
