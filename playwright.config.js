import { defineConfig } from "@playwright/test";

const reuse = !process.env.CI;
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 45000,
  expect: { timeout: 10000 },
  fullyParallel: false,
  workers: process.env.CI ? 2 : undefined,
  use: {
    baseURL: "http://127.0.0.1:4173",
    headless: true,
    trace: "retain-on-failure",
    screenshot: "only-on-failure"
  },
  webServer: [
    {
      command: "python3 -m http.server 4173 --bind 127.0.0.1",
      url: "http://127.0.0.1:4173",
      reuseExistingServer: reuse,
      timeout: 10000
    },
    {
      command: "npx wrangler dev --config worker/wrangler.toml --local --ip 127.0.0.1 --port 8787 --log-level error",
      url: "http://127.0.0.1:8787/health",
      reuseExistingServer: reuse,
      timeout: 60000
    }
  ]
});
