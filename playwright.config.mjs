import { defineConfig } from "@playwright/test";
import { existsSync } from "node:fs";
const executablePath =
  process.env.CHROMIUM_PATH ||
  (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined);
export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.mjs",
  fullyParallel: true,
  workers: 2,
  reporter: "list",
  use: {
    browserName: "chromium",
    launchOptions: { executablePath, args: ["--no-sandbox"] },
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "v2",
      testMatch: "**/v2-*.spec.mjs",
      use: { baseURL: "http://127.0.0.1:3110" },
    },
    {
      name: "classic",
      testIgnore: "**/v2-*.spec.mjs",
      use: { baseURL: "http://127.0.0.1:3111" },
    },
  ],
  webServer: [
    {
      command: "node server.mjs --port 3110",
      url: "http://127.0.0.1:3110",
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "node server.mjs --port 3111 --legacy",
      url: "http://127.0.0.1:3111",
      reuseExistingServer: !process.env.CI,
    },
  ],
});
