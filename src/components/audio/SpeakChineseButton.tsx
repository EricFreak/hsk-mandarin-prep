"use client";

import { useCallback, useEffect, useState } from "react";

type SpeakChineseButtonProps = {
  text: string;
  className?: string;
};

export default function SpeakChineseButton({
  text,
  className = "",
}: SpeakChineseButtonProps) {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);

  const speak = useCallback(() => {
    if (!supported || !text.trim()) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-CN";
    utterance.rate = 0.9;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [supported, text]);

  if (!supported || !text.trim()) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={speak}
      aria-label={`Play pronunciation for ${text}`}
      title="Play pronunciation"
      className={`ml-2 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-blue-700 transition hover:bg-blue-100 disabled:opacity-60 ${className}`}
      disabled={speaking}
    >
      <span aria-hidden="true" className="text-sm">
        {speaking ? "…" : "🔊"}
      </span>
    </button>
  );
}
