import { test, expect } from "@playwright/test";

test("Realm starts without a provider account or dedicated server", async ({ page }) => {
  await page.route("https://esm.sh/trystero@0.25.4", (route) => route.fulfill({
    status: 200,
    contentType: "application/javascript",
    body: `
      export const selfId = "mock-peer";
      export function joinRoom() {
        return {
          getPeers: () => ({}),
          makeAction: () => ({ send() {}, onMessage: null }),
          leave() {},
          onPeerJoin: null,
          onPeerLeave: null
        };
      }
    `
  }));

  await page.goto("/realm.html");
  await expect(page.getByRole("heading", { name: /enter the realm/i })).toBeVisible();
  await expect(page.locator("#connection-status")).toContainText(/no account|peer network/i);

  await page.locator("#player-name").fill("Player One");
  await page.locator("#room-code").fill("test-room");
  await page.getByRole("button", { name: /join realm/i }).click();

  await expect(page.locator("#connection-status")).toContainText("Connected to room test-room");
  await expect(page.locator("#player-count")).toHaveText("1 PLAYER");
  await expect(page.locator("#realm-layout")).toBeVisible();

  await page.locator("#chat-input").fill("local smoke test");
  await page.locator("#chat-form button").click();
  await expect(page.locator("#chat-log")).toContainText("local smoke test");

  await page.locator("#leave").click();
  await expect(page.locator("#connection-status")).toContainText("Disconnected");
});
