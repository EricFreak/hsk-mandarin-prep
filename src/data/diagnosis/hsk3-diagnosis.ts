import {
  HSK3_MOCK_EXAM,
  type MockExamQuestion,
} from "@/lib/mock-exam/hsk3-template";

/** Canonical template id for the Level 3 diagnosis paper. */
export const HSK3_DIAGNOSIS_TEMPLATE_ID = "hsk3-diagnosis";

/** Legacy id kept for attempts stored before the rename. */
export const HSK3_DIAGNOSIS_TEMPLATE_ID_LEGACY = "hsk3-placement";

export const HSK3_DIAGNOSIS_TEMPLATE_VERSION = 1;

/** Shortened HSK Level 3 diagnostic: MCQ-only subset of the mock exam template. */
export const HSK3_DIAGNOSIS_EXAM: MockExamQuestion[] = HSK3_MOCK_EXAM.filter(
  (question) => question.section !== "writing",
);

export const HSK3_DIAGNOSIS_MCQ_COUNT = HSK3_DIAGNOSIS_EXAM.length;

export function isDiagnosisTemplateId(templateId: string | null | undefined): boolean {
  return (
    templateId === HSK3_DIAGNOSIS_TEMPLATE_ID ||
    templateId === HSK3_DIAGNOSIS_TEMPLATE_ID_LEGACY
  );
}

/** @deprecated Use HSK3_DIAGNOSIS_* names */
export const HSK3_PLACEMENT_TEMPLATE_ID = HSK3_DIAGNOSIS_TEMPLATE_ID_LEGACY;
/** @deprecated Use HSK3_DIAGNOSIS_* names */
export const HSK3_PLACEMENT_TEMPLATE_VERSION = HSK3_DIAGNOSIS_TEMPLATE_VERSION;
/** @deprecated Use HSK3_DIAGNOSIS_* names */
export const HSK3_PLACEMENT_EXAM = HSK3_DIAGNOSIS_EXAM;
/** @deprecated Use HSK3_DIAGNOSIS_* names */
export const HSK3_PLACEMENT_MCQ_COUNT = HSK3_DIAGNOSIS_MCQ_COUNT;
