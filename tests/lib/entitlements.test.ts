import { describe, it, expect } from "vitest";
import {
  FREE_DAILY_PRACTICE_LIMIT,
  canTakeMockExam,
  canStartPractice,
  canViewWeaknessDetail,
  planLabel,
} from "@/lib/entitlements";

describe("entitlements", () => {
  it("free user gets 20 practice questions per day", () => {
    expect(FREE_DAILY_PRACTICE_LIMIT).toBe(20);
    expect(canStartPractice("free", 19)).toBe(true);
    expect(canStartPractice("free", 20)).toBe(false);
  });

  it("pro user has unlimited practice", () => {
    expect(canStartPractice("pro", 999)).toBe(true);
  });

  it("free user gets one mock exam", () => {
    expect(canTakeMockExam("free", 0)).toBe(true);
    expect(canTakeMockExam("free", 1)).toBe(false);
  });

  it("pro user gets unlimited mock exams", () => {
    expect(canTakeMockExam("pro", 5)).toBe(true);
  });

  it("labels plans for UI", () => {
    expect(planLabel("free")).toBe("Free");
    expect(planLabel("pro")).toBe("Pro");
  });

  it("shows weakness detail for every plan (free report is complete)", () => {
    expect(canViewWeaknessDetail("free")).toBe(true);
    expect(canViewWeaknessDetail("pro")).toBe(true);
  });
});
