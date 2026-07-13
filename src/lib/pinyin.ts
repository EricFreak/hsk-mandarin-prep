const TONED_VOWELS = "āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ";
const PLAIN_VOWELS = "aeiouüv";

function findToneIndices(text: string): number[] {
  const indices: number[] = [];
  for (let i = 0; i < text.length; i += 1) {
    if (TONED_VOWELS.includes(text[i])) indices.push(i);
  }
  return indices;
}

function findSyllableStart(text: string, toneIndex: number, minPos: number): number {
  let start = toneIndex;
  while (start > minPos) {
    if (start >= 2) {
      const digraph = text.slice(start - 2, start).toLowerCase();
      if (digraph === "zh" || digraph === "ch" || digraph === "sh") {
        return start - 2;
      }
    }

    const previous = text[start - 1].toLowerCase();
    if ("bpmfdtnlgkhjqxrzcsyw".includes(previous)) {
      return start - 1;
    }

    if (PLAIN_VOWELS.includes(previous)) {
      start -= 1;
      continue;
    }

    break;
  }

  return Math.max(minPos, start);
}

function findSyllableEnd(text: string, toneIndex: number): number {
  let end = toneIndex + 1;
  while (end < text.length && PLAIN_VOWELS.includes(text[end].toLowerCase())) {
    end += 1;
  }

  const remainder = text.slice(end).toLowerCase();
  if (remainder.startsWith("ng")) end += 2;
  else if (remainder.startsWith("n") || remainder.startsWith("r")) end += 1;

  return end;
}

function splitSegment(segment: string): string {
  const toneIndices = findToneIndices(segment);
  if (toneIndices.length === 0) return segment;

  const syllables: string[] = [];
  let position = 0;

  for (const toneIndex of toneIndices) {
    const start = findSyllableStart(segment, toneIndex, position);
    const end = findSyllableEnd(segment, toneIndex);

    if (position < start) {
      syllables.push(segment.slice(position, start));
    }

    syllables.push(segment.slice(start, end));
    position = end;
  }

  if (position < segment.length) {
    syllables.push(segment.slice(position));
  }

  return syllables.join(" ");
}

/** Format pinyin with a space between each syllable (e.g. bànfǎ → bàn fǎ). */
export function formatPinyinSpaced(pinyin: string): string {
  return pinyin
    .trim()
    .split(/\s+/)
    .map(splitSegment)
    .join(" ");
}
