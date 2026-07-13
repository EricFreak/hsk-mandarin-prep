import {
  HSK3_MOCK_EXAM,
  type MockExamQuestion,
} from "@/lib/mock-exam/hsk3-template";

export const HSK3_PLACEMENT_TEMPLATE_ID = "hsk3-placement";
export const HSK3_PLACEMENT_TEMPLATE_VERSION = 1;

/** Shortened HSK 3 diagnostic: MCQ-only subset of the mock exam template. */
export const HSK3_PLACEMENT_EXAM: MockExamQuestion[] = HSK3_MOCK_EXAM.filter(
  (question) => question.section !== "writing",
);

export const HSK3_PLACEMENT_MCQ_COUNT = HSK3_PLACEMENT_EXAM.length;
