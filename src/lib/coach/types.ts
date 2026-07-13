import type { Plan } from "@/lib/entitlements";

export type CoachTrigger =
  | "mock_exam_completed"
  | "manual_refresh"
  | "scheduled"
  | "post_tutoring";

export type CoachTaskType =
  | "practice"
  | "flashcards"
  | "mock_section"
  | "review_mistakes"
  | "rest";

export type CoachTaskStatus = "pending" | "done" | "skipped";

export type SnapshotMockExam = {
  id: string;
  score: number;
  date: string;
  weaknesses: { skill: string; wrongCount: number }[];
  writingSample?: string;
};

export type LearnerSnapshot = {
  userId: string;
  plan: Plan;
  targetLevel: number;
  targetExamDate?: string | null;
  minutesPerDay: number | null;
  mockExams: SnapshotMockExam[];
  practiceLast30d: {
    bySkill: Record<string, { answered: number; correct: number }>;
  };
  srsDueCount: number;
  mistakeHotspots: { skill: string; count: number }[];
  previousReportId?: string;
};

export type CoachStrength = {
  skill: string;
  evidence: string;
};

export type CoachGap = {
  skill: string;
  severity: "low" | "medium" | "high";
  evidence: string;
  subtopics?: string[];
};

export type GeneratedReport = {
  readinessScore: number;
  summaryMarkdown: string;
  strengths: CoachStrength[];
  gaps: CoachGap[];
  metrics: Record<string, unknown>;
};

export type GeneratedPlanTask = {
  dayOffset: number;
  taskType: CoachTaskType;
  skill: string | null;
  targetCount: number | null;
  title: string;
};

export type GeneratedPlan = {
  focusSkills: string[];
  tasks: GeneratedPlanTask[];
};

export type CoachReportRow = {
  id: string;
  user_id: string;
  trigger: CoachTrigger;
  source_attempt_id: string | null;
  previous_report_id: string | null;
  readiness_score: number | null;
  summary_markdown: string;
  strengths: CoachStrength[];
  gaps: CoachGap[];
  metrics: Record<string, unknown>;
  model: string | null;
  version: number;
  created_at: string;
};

export type CoachPlanTaskRow = {
  id: string;
  plan_id: string;
  user_id: string;
  day_offset: number;
  task_type: CoachTaskType;
  skill: string | null;
  target_count: number | null;
  attempted_count?: number;
  title: string;
  status: CoachTaskStatus;
  completed_at: string | null;
};

export type CoachStudyPlanRow = {
  id: string;
  user_id: string;
  report_id: string;
  status: "active" | "completed" | "superseded";
  week_start: string;
  focus_skills: string[];
  created_at: string;
};
