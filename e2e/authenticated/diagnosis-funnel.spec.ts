import { test, expect } from "@playwright/test";
import {
  createAdminClient,
  getEnv,
  prepareNeedsDiagnosis,
  setUserPlan,
} from "../helpers/supabase";
import { ensureAuthUser } from "../helpers/auth";

test.describe("DIAG — Free diagnosis funnel", () => {
  test("DIAG-001: complete diagnosis and fire funnel events", async ({
    browser,
  }) => {
    const env = getEnv();
    const email = env.E2E_FREE_EMAIL ?? "hsk-e2e-free@test.hskprep.app";
    const password = env.E2E_FREE_PASSWORD ?? "HskE2eFreeTest!2026";
    const admin = createAdminClient();
    const user = await ensureAuthUser(email, password);
    await setUserPlan(admin, user.id, user.email, "free");
    await prepareNeedsDiagnosis(admin, user.id);

    const context = await browser.newContext();
    const page = await context.newPage();

    const analyticsBodies: string[] = [];
    page.on("request", (req) => {
      if (req.url().includes("/api/analytics") && req.method() === "POST") {
        analyticsBodies.push(req.postData() ?? "");
      }
    });

    await page.goto("/login");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: /^sign in$/i }).click();
    await page.waitForURL(/\/(onboarding|diagnosis|dashboard|auth)/, {
      timeout: 30_000,
    });

    // Follow continue hops until diagnosis or dashboard.
    for (let i = 0; i < 5; i += 1) {
      const url = page.url();
      if (url.includes("/diagnosis")) break;
      if (url.includes("/onboarding")) {
        const card = page.getByRole("button", { name: /personal coach|coach/i }).first();
        if (await card.isVisible().catch(() => false)) {
          await card.click();
        } else {
          // ServiceIntentStep may use clickable cards without button role
          const anyCard = page.locator("button, [role='button']").filter({
            hasText: /coach|sprint|custom/i,
          }).first();
          if (await anyCard.isVisible()) await anyCard.click();
        }
        const date = page.locator("#exam-date");
        if (await date.isVisible()) {
          await date.fill("2026-12-01");
          await page
            .getByRole("button", { name: /continue to diagnosis/i })
            .click();
        }
        await page.waitForURL(/\/diagnosis/, { timeout: 30_000 }).catch(() => undefined);
        break;
      }
      if (url.includes("/dashboard")) {
        await page.goto("/diagnosis");
        break;
      }
      await page.waitForTimeout(500);
    }

    if (!page.url().includes("/diagnosis")) {
      await page.goto("/diagnosis");
    }

    await expect(page.getByText(/question 1 of/i)).toBeVisible({
      timeout: 30_000,
    });

    for (let i = 0; i < 20; i += 1) {
      const choice = page.locator("div.grid.gap-3 button").first();
      if (await choice.isVisible()) await choice.click();
      const primary = page.getByRole("button", {
        name: /next question|submit exam/i,
      });
      await expect(primary).toBeEnabled({ timeout: 10_000 });
      const label = (await primary.textContent()) ?? "";
      await primary.click();
      if (/submit exam/i.test(label)) break;
    }

    await expect(page.getByText(/%/).first()).toBeVisible({ timeout: 45_000 });
    await page.waitForTimeout(2000);

    const joined = analyticsBodies.join("\n");
    expect(joined).toContain("diagnosis_started");
    expect(joined).toContain("diagnosis_completed");
    expect(joined).toContain("hsk3-diagnosis");
    expect(joined).toContain("anon_id");

    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
    await expect(page).not.toHaveURL(/\/diagnosis/);

    // Stamp should stick — reload dashboard still stays.
    await page.reload();
    await expect(page).toHaveURL(/\/dashboard/);

    await context.close();
  });
});
