import { defineConfig, devices } from "@playwright/test";
import path from "path";

const proAuthFile = path.join(__dirname, "e2e/.auth/pro.json");
const freeAuthFile = path.join(__dirname, "e2e/.auth/free.json");

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never", outputFolder: "e2e-report" }]],
  timeout: 120_000,
  expect: { timeout: 30_000 },
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "public", testMatch: /public\/.*\.spec\.ts/ },
    {
      name: "authenticated",
      testMatch: /authenticated\/.*\.spec\.ts/,
      dependencies: ["public"],
      use: {
        ...devices["Desktop Chrome"],
        storageState: proAuthFile,
      },
    },
    {
      name: "free-user",
      testMatch: /free\/.*\.spec\.ts/,
      dependencies: ["public"],
      use: {
        ...devices["Desktop Chrome"],
        storageState: freeAuthFile,
      },
    },
  ],
  globalSetup: "./e2e/global-setup.ts",
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
