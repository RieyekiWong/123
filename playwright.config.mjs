import { defineConfig } from "@playwright/test";
import { existsSync } from "node:fs";

const chromiumPath =
  process.env.CHROMIUM_PATH ||
  (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined);
export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.mjs",
  fullyParallel: true,
  workers: 2,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3107",
    browserName: "chromium",
    launchOptions: { executablePath: chromiumPath, args: ["--no-sandbox"] },
    trace: "retain-on-failure",
  },
  webServer: {
    command: "node server.mjs --port 3107",
    url: "http://127.0.0.1:3107",
    reuseExistingServer: !process.env.CI,
  },
});
