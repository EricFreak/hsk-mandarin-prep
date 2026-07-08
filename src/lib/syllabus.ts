import hsk1 from "@/data/syllabus/hsk1.json";
import hsk2 from "@/data/syllabus/hsk2.json";
import hsk3 from "@/data/syllabus/hsk3.json";

export type HskWord = {
  id: string;
  hanzi: string;
  pinyin: string;
  english: string;
};

type LevelData = {
  level: number;
  meta: { syllables: number; characters: number; vocabulary: number; grammar: number };
  words: HskWord[];
};

const BY_LEVEL: Record<number, LevelData> = {
  1: hsk1 as LevelData,
  2: hsk2 as LevelData,
  3: hsk3 as LevelData,
};

export function getLevelMeta(level: 1 | 2 | 3) {
  return BY_LEVEL[level].meta;
}

export function getWordsForLevel(level: 1 | 2 | 3): HskWord[] {
  return BY_LEVEL[level].words;
}
