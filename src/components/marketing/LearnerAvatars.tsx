import Image from "next/image";

const AVATARS = [
  { src: "/brand/avatars/avatar-1.png", alt: "East Asian student" },
  { src: "/brand/avatars/avatar-2.png", alt: "South Asian student" },
  { src: "/brand/avatars/avatar-3.png", alt: "Student" },
  { src: "/brand/avatars/avatar-4.png", alt: "Student" },
  { src: "/brand/avatars/avatar-5.png", alt: "Latina student" },
] as const;

export default function LearnerAvatars() {
  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {AVATARS.map(({ src, alt }) => (
          <Image
            key={src}
            src={src}
            alt={alt}
            width={40}
            height={40}
            className="h-10 w-10 rounded-full border-2 border-white object-cover shadow-sm"
          />
        ))}
      </div>
      <span className="ml-3 rounded-full bg-paper-dark px-3 py-1 text-xs font-medium text-ink-muted">
        Founder beta
      </span>
    </div>
  );
}
