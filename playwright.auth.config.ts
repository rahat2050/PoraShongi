import { defineConfig, devices } from "@playwright/test";

const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: "./tests/e2e-auth",
  fullyParallel: false,
  workers: 1,
  retries: isCI ? 1 : 0,
  forbidOnly: isCI,
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : "list",
  timeout: 45_000,
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    { name: "auth-setup", testMatch: /auth\.setup\.ts/, use: { ...devices["Desktop Chrome"] } },
    {
      name: "authenticated-journeys",
      testIgnore: /auth\.setup\.ts/,
      dependencies: ["auth-setup"],
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: isCI ? "npm run start -- --hostname 0.0.0.0" : "npm run build && npm run start -- --hostname 0.0.0.0",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !isCI,
    timeout: 180_000,
  },
});
