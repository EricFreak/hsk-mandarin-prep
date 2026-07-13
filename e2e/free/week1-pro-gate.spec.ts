import { test, expect } from "@playwright/test";
import { resetCoachJourney, seedJourneyCoachState } from "../helpers/journey";
import {
  createAdminClient,
  getEnv,
  resetUserProgress,
  setUserPlan,
} from "../helpers/supabase";

const freeEmail =
  getEnv().E2E_FREE_EMAIL ?? "hsk-e2e-free@test.hskprep.app";

test.describe("FREE-JNY — Week 1 execution & Week 2 gate", () => {
  test.beforeEach(async () => {
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("id, email")
      .eq("email", freeEmail)
      .maybeSingle();

    if (!profile) {
      throw new Error(`Free E2E user missing: ${freeEmail}. Run global-setup.`);
    }

    await setUserPlan(admin, profile.id, profile.email, "free");
    await resetUserProgress(admin, profile.id);
    await resetCoachJourney(admin, profile.id);
  });

  test("FREE-JNY-001: Week 1 shows full task list (beyond legacy 3-task cap)", async ({
    page,
  }) => {
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .eq("email", freeEmail)
      .single();

    await seedJourneyCoachState(admin, profile!.id, {
      currentWeekIndex: 1,
      planWeekIndex: 1,
      taskCount: 4,
    });

    await page.goto("/dashboard");
    await expect(page.getByText(/this week · week 1/i)).toBeVisible({ timeout: 45_000 });
    await expect(page.getByText(/listening drills/i)).toBeVisible();
    await expect(page.getByText(/vocabulary review/i)).toBeVisible();
    await expect(page.getByText(/grammar practice/i)).toBeVisible();
    await expect(page.getByText(/flashcard sprint/i)).toBeVisible();
    await expect(page.getByText(/week 2 is locked/i)).not.toBeVisible();
  });

  test("FREE-JNY-002: Week 2 execution gated with Pro upgrade CTA", async ({
    page,
  }) => {
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .eq("email", freeEmail)
      .single();

    const { week2Theme } = await seedJourneyCoachState(admin, profile!.id, {
      currentWeekIndex: 2,
      planWeekIndex: 2,
      taskCount: 4,
    });

    await page.goto("/dashboard");
    await expect(page.getByText(/week 2 is locked/i)).toBeVisible({ timeout: 45_000 });
    await expect(
      page.getByText(/free includes full week 1 execution/i),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /unlock week 2 and your full journey/i }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /upgrade to pro/i })).toBeVisible();

    await page.goto("/dashboard/journey");
    const week2 = page.locator("li").filter({ hasText: /Week 2/i });
    await expect(week2.getByText(new RegExp(week2Theme, "i"))).toBeVisible({
      timeout: 45_000,
    });
    await expect(week2.getByText(/^available$/i)).toBeVisible();
  });

  test("FREE-JNY-003: Week 1 cleared shows Pro CTA for full journey", async ({
    page,
  }) => {
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .eq("email", freeEmail)
      .single();

    await seedJourneyCoachState(admin, profile!.id, {
      currentWeekIndex: 1,
      planWeekIndex: 1,
      taskCount: 4,
      allTasksDone: true,
    });

    await page.goto("/dashboard");
    await expect(
      page.getByRole("heading", { name: /week 1 complete — unlock your full journey/i }),
    ).toBeVisible({ timeout: 45_000 });
  });
});
