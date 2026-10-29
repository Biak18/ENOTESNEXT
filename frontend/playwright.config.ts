import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:5180",
    permissions: ["clipboard-read", "clipboard-write"],
    trace: "off",
  },
  webServer: {
    command: "npm run dev -- --port 5180 --strictPort --host 127.0.0.1",
    url: "http://127.0.0.1:5180",
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
