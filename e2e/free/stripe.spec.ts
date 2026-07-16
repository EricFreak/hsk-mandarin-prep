import { test, expect } from "@playwright/test";
import {
  createAdminClient,
  getEnv,
  seedMockExamAttempt,
} from "../helpers/supabase";

const freeEmail =
  getEnv().E2E_FREE_EMAIL ?? "hsk-e2e-free@test.hskprep.app";

test.describe("PAY — Free user upgrade flow", () => {
  test("PAY-009: mock paywall routes to the quote hub (no Pro checkout modal)", async ({
    page,
  }) => {
    const admin = createAdminClient();
    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .eq("email", freeEmail)
      .single();

    await seedMockExamAttempt(admin, profile!.id);

    await page.goto("/mock-exam");
    await expect(page.getByText(/mock exam limit reached/i)).toBeVisible();

    // The limit page now links to /plan/quote instead of opening a Pro checkout modal.
    const quoteCta = page.getByRole("link", { name: /see my quote/i });
    await expect(quoteCta).toBeVisible();
    await quoteCta.click();
    await expect(page).toHaveURL(/\/plan\/quote/, { timeout: 30_000 });
  });
});
