import { test, expect } from "@playwright/test";

test.describe("API — authenticated contracts", () => {
  test("API-001: GET /api/dashboard", async ({ request }) => {
    const res = await request.get("/api/dashboard");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("plan");
    expect(body).toHaveProperty("attempts");
    expect(body).toHaveProperty("last7Answered");
  });

  test("API-004: GET /api/practice/generate", async ({ request }) => {
    const res = await request.get("/api/practice/generate?level=3&seed=9999");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.questionId).toBeTruthy();
    expect(body.question?.choices?.length).toBeGreaterThanOrEqual(2);
    expect(body.question?.stem).toBeTruthy();

    test.info().annotations.push({
      type: "questionId",
      description: body.questionId,
    });
  });

  test("API-008: POST /api/practice/generate", async ({ request }) => {
    const gen = await request.get("/api/practice/generate?level=3&seed=8888");
    expect(gen.status()).toBe(200);
    const { questionId, question } = await gen.json();

    const res = await request.post("/api/practice/generate", {
      data: {
        questionId,
        correct: true,
        skill: question.skill,
        level: 3,
      },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  test("API-016: GET /api/srs/review", async ({ request }) => {
    const res = await request.get("/api/srs/review");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("card");
    expect(body).toHaveProperty("word");
  });

  test("API-010: POST /api/mock-exam/submit", async ({ request }) => {
    const startedAt = new Date().toISOString();
    const answers = [
      { questionId: "l1", selectedIndex: 0 },
      { questionId: "l2", selectedIndex: 0 },
      { questionId: "l3", selectedIndex: 0 },
      { questionId: "l4", selectedIndex: 0 },
      { questionId: "l5", selectedIndex: 0 },
      { questionId: "r1", selectedIndex: 0 },
      { questionId: "r2", selectedIndex: 0 },
      { questionId: "r3", selectedIndex: 0 },
      { questionId: "r4", selectedIndex: 0 },
      { questionId: "r5", selectedIndex: 1 },
      { questionId: "w1", writingText: "我最喜欢打篮球，因为打篮球可以锻炼身体，也让我交到很多朋友。" },
    ];

    const res = await request.post("/api/mock-exam/submit", {
      data: { answers, startedAt, durationSeconds: 120 },
    });

    const body = await res.json();
    expect(res.status(), JSON.stringify(body)).toBe(200);
    expect(body.attemptId).toBeTruthy();
    expect(typeof body.score).toBe("number");
    expect(body.weaknesses).toBeDefined();

    test.info().annotations.push({
      type: "attemptId",
      description: body.attemptId,
    });
  });
});

test.describe("API — writing score", () => {
  test("API-019: pro user writing score", async ({ request }) => {
    const res = await request.post("/api/writing/score", {
      data: {
        prompt: "写一段话介绍你喜欢的运动",
        userText: "我最喜欢游泳，因为游泳对身体很好，每个周末我都会去游泳池。",
      },
    });
    if (res.status() === 503) {
      test.skip(true, "OpenAI not configured");
    }
    expect([200, 403]).toContain(res.status());
    if (res.status() === 200) {
      const body = await res.json();
      expect(body.score).toBeDefined();
    }
  });
});
