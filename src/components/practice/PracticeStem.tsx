"use client";

import SpeakChineseButton from "@/components/audio/SpeakChineseButton";
import { splitStemByScript } from "@/lib/chinese-text";

type PracticeStemProps = {
  stem: string;
};

export default function PracticeStem({ stem }: PracticeStemProps) {
  const segments = splitStemByScript(stem);

  return (
    <p className="mt-4 text-2xl font-medium leading-relaxed text-gray-900">
      {segments.map((segment, index) =>
        segment.type === "hanzi" ? (
          <span key={`${segment.text}-${index}`} className="inline-flex items-center">
            <span>{segment.text}</span>
            <SpeakChineseButton text={segment.text} />
          </span>
        ) : (
          <span key={`${segment.text}-${index}`}>{segment.text}</span>
        ),
      )}
    </p>
  );
}
