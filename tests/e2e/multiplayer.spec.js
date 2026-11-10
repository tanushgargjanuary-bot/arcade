import { test, expect } from "@playwright/test";

async function useLocalWorker(page) {
  await page.route("**/src/multiplayer-config.js", (route) => route.fulfill({
    contentType: "application/javascript",
    body: 'export const MULTIPLAYER_ENDPOINT = "http://127.0.0.1:8787";'
  }));
}

test("two browser clients share room presence, movement and chat", async ({ browser }) => {
  const contextA = await browser.newContext();
  const contextB = await browser.newContext();
  const pageA = await contextA.newPage();
  const pageB = await contextB.newPage();
  await useLocalWorker(pageA);
  await useLocalWorker(pageB);

  try {
    await pageA.goto("/realm.html");
    await pageB.goto("/realm.html");
    await pageA.locator("#player-name").fill("Player One");
    await pageB.locator("#player-name").fill("Player Two");
    await pageA.locator("#room-code").fill("test-room");
    await pageB.locator("#room-code").fill("test-room");
    await pageA.getByRole("button", { name: /join realm/i }).click();
    await expect(pageA.locator("#connection-status")).toContainText("Connected", { timeout: 15000 });
    await pageB.getByRole("button", { name: /join realm/i }).click();
    await expect(pageB.locator("#connection-status")).toContainText("Connected", { timeout: 15000 });
    await expect(pageA.locator("#player-count")).toHaveText("2 PLAYERS");
    await expect(pageB.locator("#player-count")).toHaveText("2 PLAYERS");

    await pageA.locator("#chat-input").fill("hello from player one");
    await pageA.locator("#chat-form button").click();
    await expect(pageB.locator("#chat-log")).toContainText("hello from player one");

    const playerOnB = pageB.locator("#players-list li").filter({ hasText: "Player One" });
    const before = Number(await playerOnB.getAttribute("data-x"));
    await pageA.keyboard.down("ArrowRight");
    await pageA.waitForTimeout(500);
    await pageA.keyboard.up("ArrowRight");
    await expect.poll(async () => Number(await playerOnB.getAttribute("data-x"))).toBeGreaterThan(before);
  } finally {
    await contextA.close();
    await contextB.close();
  }
});
