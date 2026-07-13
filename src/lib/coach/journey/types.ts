export type JourneyStageId = "diagnose" | "foundation" | "skills" | "sprint";

export type StageWindow = {
  stage: JourneyStageId;
  startDate: string; // YYYY-MM-DD
  endDate: string;
};

export type WeekOutlineRow = {
  weekIndex: number;
  stage: JourneyStageId;
  theme: string;
  skillFocus: string[];
  status: "locked" | "available" | "passed";
};
