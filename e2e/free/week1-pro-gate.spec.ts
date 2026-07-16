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

test.describe("FREE-JNY — Sample-day gate & quote CTA", () => {
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

  test("FREE-JNY-001: Week 1 — sample day is the only executable task, later days are locked preview cards", async ({
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

    // Day 0 (sample day) is executable — renders as a task row with a Start link.
    const sampleDay = page.locator("li").filter({ hasText: /listening drills/i });
    await expect(sampleDay).toBeVisible();
    await expect(sampleDay.getByRole("link", { name: /^start$/i })).toBeVisible();

    // Day 1+ render as locked preview cards linking to /plan/quote, not task rows.
    const lockedDay = page.locator("li").filter({ hasText: /vocabulary review/i });
    await expect(lockedDay).toBeVisible();
    await expect(lockedDay.getByRole("link", { name: /included in your package/i })).toBeVisible();
    await expect(lockedDay.getByRole("link", { name: /^start$|^open$/i })).toHaveCount(0);

    // No week-level lock message while on the current week.
    await expect(page.getByText(/week 1 is locked/i)).toHaveCount(0);
  });

  test("FREE-JNY-002: a later week is locked with a quote CTA (no Pro checkout)", async ({
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
      planWeekIndex: 2,
      taskCount: 4,
    });

    await page.goto("/dashboard");
    await expect(page.getByText(/week 2 is locked/i)).toBeVisible({ timeout: 45_000 });
    await expect(page.getByText(/free includes the sample day/i)).toBeVisible();

    const quoteCta = page.getByRole("link", { name: /get plan quote/i });
    await expect(quoteCta).toBeVisible();
    await expect(quoteCta).toHaveAttribute("href", "/plan/quote");

    // The old subscription upgrade CTA is gone.
    await expect(page.getByRole("button", { name: /upgrade to pro/i })).toHaveCount(0);
  });

  test("FREE-JNY-003: completing the sample day surfaces the quote CTA", async ({
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
      taskCount: 1,
      allTasksDone: true,
    });

    await page.goto("/dashboard");
    await expect(
      page.getByText(/sample day complete — continue your full journey/i),
    ).toBeVisible({ timeout: 45_000 });

    const quoteCta = page.getByRole("link", { name: /get plan quote/i });
    await expect(quoteCta).toBeVisible();
    await expect(quoteCta).toHaveAttribute("href", "/plan/quote");
  });
});
