import { defineConfig } from "@playwright/test";
const reuse = !process.env.CI;
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30000,
  use: { baseURL: "http://127.0.0.1:4173", headless: true },
  webServer: [
    { command: "python3 -m http.server 4173 --bind 127.0.0.1", port: 4173, reuseExistingServer: reuse },
    {
      command: "npx wrangler dev --config worker/wrangler.toml --ip 127.0.0.1 --port 8787 --var ALLOWED_ORIGINS:http://127.0.0.1:4173",
      url: "http://127.0.0.1:8787/health",
      reuseExistingServer: reuse,
      timeout: 120000
    }
  ]
});
