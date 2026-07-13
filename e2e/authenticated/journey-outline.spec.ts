import { test, expect } from "@playwright/test";
import { resetCoachJourney, seedJourneyCoachState } from "../helpers/journey";
import { createAdminClient, getEnv } from "../helpers/supabase";

const proEmail = getEnv().E2E_EMAIL ?? "657696471@qq.com";

test.describe("JNY-OUT — Journey outline (Pro)", () => {
  test.beforeEach(async () => {
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .eq("email", proEmail)
      .maybeSingle();

    if (!profile) {
      throw new Error(`Pro E2E user missing: ${proEmail}. Run global-setup.`);
    }

    await resetCoachJourney(admin, profile.id);
    await seedJourneyCoachState(admin, profile.id, {
      currentWeekIndex: 1,
      planWeekIndex: 1,
      taskCount: 4,
    });
  });

  test("JNY-OUT-001: dashboard shows Journey strip", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { level: 1, name: /dashboard/i })).toBeVisible();
    await expect(page.getByText(/journey · foundation · week 1/i)).toBeVisible({
      timeout: 45_000,
    });
    await expect(page.getByRole("link", { name: /full journey outline/i })).toBeVisible();
  });

  test("JNY-OUT-002: journey page shows week outline with locked weeks", async ({
    page,
  }) => {
    await page.goto("/dashboard/journey");
    await expect(page.getByRole("heading", { level: 1, name: /full journey/i })).toBeVisible();

    await expect(page.getByText(/current stage/i)).toBeVisible({ timeout: 45_000 });
    await expect(page.getByText(/^foundation$/i).first()).toBeVisible();

    const week1 = page.locator("li").filter({ hasText: /Week 1/i });
    await expect(week1.getByText(/^available$/i)).toBeVisible();

    const week2 = page.locator("li").filter({ hasText: /Week 2/i });
    await expect(week2.getByText(/^locked$/i)).toBeVisible();
    await expect(week2.getByText(/grammar focus · vocabulary support/i)).toBeVisible();

    const week3 = page.locator("li").filter({ hasText: /Week 3/i });
    await expect(week3.getByText(/^locked$/i)).toBeVisible();
  });
});
