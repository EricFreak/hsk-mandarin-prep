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
    expect(canStartPractice("free", false, 19)).toBe(true);
    expect(canStartPractice("free", false, 20)).toBe(false);
  });

  it("pro user has unlimited practice", () => {
    expect(canStartPractice("pro", false, 999)).toBe(true);
  });

  it("full-access user (paid order / free sprint) bypasses the practice cap", () => {
    // plan='free' but access from lp_orders — the new paying-customer path.
    expect(canStartPractice("free", true, 999)).toBe(true);
    // free limits unchanged for access-null users
    expect(canStartPractice("free", false, 20)).toBe(false);
  });

  it("free user gets one mock exam", () => {
    expect(canTakeMockExam("free", false, 0)).toBe(true);
    expect(canTakeMockExam("free", false, 1)).toBe(false);
  });

  it("pro user gets unlimited mock exams", () => {
    expect(canTakeMockExam("pro", false, 5)).toBe(true);
  });

  it("full-access user bypasses the mock-exam cap", () => {
    expect(canTakeMockExam("free", true, 5)).toBe(true);
    expect(canTakeMockExam("free", false, 1)).toBe(false);
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
