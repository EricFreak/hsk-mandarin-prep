export type StemSegment = { type: "hanzi" | "other"; text: string };

/** Split text into Chinese (hanzi) runs and everything else. */
export function splitStemByScript(text: string): StemSegment[] {
  const segments: StemSegment[] = [];
  const regex = /[\u4e00-\u9fff]+/g;
  let lastIndex = 0;
  let match = regex.exec(text);

  while (match !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "other", text: text.slice(lastIndex, match.index) });
    }
    segments.push({ type: "hanzi", text: match[0] });
    lastIndex = match.index + match[0].length;
    match = regex.exec(text);
  }

  if (lastIndex < text.length) {
    segments.push({ type: "other", text: text.slice(lastIndex) });
  }

  return segments.length > 0 ? segments : [{ type: "other", text }];
}

export function extractHanzi(text: string): string {
  return splitStemByScript(text)
    .filter((segment) => segment.type === "hanzi")
    .map((segment) => segment.text)
    .join("");
}
