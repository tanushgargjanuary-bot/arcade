import { test, expect } from "@playwright/test";

async function useLocalWorker(page) {
  await page.route("**/src/multiplayer-config.js", (route) => route.fulfill({
    contentType: "application/javascript",
    body: 'export const MULTIPLAYER_ENDPOINT = "http://127.0.0.1:8787";'
  }));
}

async function moveToward(page, playerLocator, axis, target) {
  const attribute = axis === "x" ? "data-x" : "data-y";
  const current = Number(await playerLocator.getAttribute(attribute));
  const delta = target - current;
  if (Math.abs(delta) < 20) return;
  const key = axis === "x" ? (delta > 0 ? "ArrowRight" : "ArrowLeft") : (delta > 0 ? "ArrowDown" : "ArrowUp");
  await page.keyboard.down(key);
  await page.waitForTimeout(Math.abs(delta) / 300 * 1000 + 220);
  await page.keyboard.up(key);
}

test("two browser clients share presence, movement, chat and boss combat", async ({ browser }) => {
  const contextA = await browser.newContext();
  const contextB = await browser.newContext();
  const pageA = await contextA.newPage();
  const pageB = await contextB.newPage();
  await useLocalWorker(pageA);
  await useLocalWorker(pageB);
  let contextAClosed = false;

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

    const playerOnA = pageA.locator("#players-list li").filter({ hasText: "Player One" });
    const playerOnB = pageB.locator("#players-list li").filter({ hasText: "Player One" });
    const before = Number(await playerOnB.getAttribute("data-x"));
    await pageA.keyboard.down("ArrowRight");
    await pageA.waitForTimeout(500);
    await pageA.keyboard.up("ArrowRight");
    await expect.poll(async () => Number(await playerOnB.getAttribute("data-x"))).toBeGreaterThan(before);

    await moveToward(pageA, playerOnA, "x", 570);
    await moveToward(pageA, playerOnA, "y", 240);
    await expect.poll(async () => {
      const x = Number(await playerOnA.getAttribute("data-x"));
      const y = Number(await playerOnA.getAttribute("data-y"));
      return Math.hypot(x - 570, y - 240);
    }).toBeLessThan(55);
    await pageA.keyboard.press("Space");
    await expect(pageB.locator("#boss-hp")).toHaveText("BOSS HP 90/100", { timeout: 5000 });

    await contextA.close();
    contextAClosed = true;
    await expect(pageB.locator("#player-count")).toHaveText("1 PLAYER");
    await expect(pageB.locator("#chat-log")).toContainText("Player One left the realm.");
  } finally {
    if (!contextAClosed) await contextA.close();
    await contextB.close();
  }
});
