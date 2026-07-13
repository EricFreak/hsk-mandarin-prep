import Image from "next/image";
import Link from "next/link";

type BrandLogoProps = {
  href?: string;
  title?: string;
  size?: "sm" | "md";
};

export default function BrandLogo({
  href = "/",
  title = "HSK Prep",
  size = "md",
}: BrandLogoProps) {
  const dimension = size === "sm" ? 32 : 36;

  return (
    <Link href={href} className="group flex items-center gap-2">
      <Image
        src="/brand/logo-seal.png"
        alt=""
        width={dimension}
        height={dimension}
        className={size === "sm" ? "h-8 w-8 shrink-0" : "h-9 w-9 shrink-0"}
        priority
      />
      <span className="font-display text-lg font-semibold text-ink group-hover:text-jade">
        {title}
      </span>
    </Link>
  );
}
