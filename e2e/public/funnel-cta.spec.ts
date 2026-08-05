import { test, expect } from "@playwright/test";

test.describe("FUNNEL — Marketing CTA instrumentation", () => {
  test("FUN-001: hero CTA fires lp_cta_click", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("link", { name: /start with a free diagnosis/i }).first(),
    ).toBeVisible();

    // Prevent navigation so in-memory funnel buffer stays on this document.
    await page.evaluate(() => {
      document.addEventListener(
        "click",
        (event) => {
          const target = event.target as HTMLElement | null;
          if (target?.closest("a")) event.preventDefault();
        },
        true,
      );
    });

    const analyticsPromise = page.waitForRequest(
      (req) =>
        req.url().includes("/api/analytics") &&
        req.method() === "POST" &&
        (req.postData() ?? "").includes("lp_cta_click"),
      { timeout: 10_000 },
    );

    await page
      .getByRole("link", { name: /start with a free diagnosis/i })
      .first()
      .click();

    const req = await analyticsPromise;
    expect(req.postData() ?? "").toContain("lp_cta_click");
    expect(req.postData() ?? "").toContain("anon_id");

    const events = await page.evaluate(
      () => window.__hskFunnelEvents?.map((e) => e.event) ?? [],
    );
    expect(events).toContain("lp_view");
    expect(events).toContain("lp_cta_click");
  });
});
