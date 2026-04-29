import { defineConfig } from "@playwright/test";

/**
 * Playwright configuration for Electron UI smoke tests.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "./test-results/playwright",
  timeout: 30_000,
  expect: {
    timeout: 5_000
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "playwright-report" }]
  ],
  use: {
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "retain-on-failure"
  }
});
