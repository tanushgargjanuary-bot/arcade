import { test, expect } from "@playwright/test";

const WORKER_ORIGIN = "http://127.0.0.1:8787";
const ROOM = "robust-room-01";

async function createPlayer(browser, displayName) {
  const context = await browser.newContext();
  await context.route("**/src/multiplayer-config.js", (route) => route.fulfill({
    status: 200,
    contentType: "application/javascript",
    body: `export const MULTIPLAYER_ENDPOINT = "${WORKER_ORIGIN}";`
  }));
  const page = await context.newPage();
  await page.goto("/realm.html");
  await page.locator("#player-name").fill(displayName);
  await page.locator("#room-code").fill(ROOM);
  await page.getByRole("button", { name: /join realm/i }).click();
  await expect(page.locator("#connection-status")).toContainText("Connected to room " + ROOM, { timeout: 15000 });
  return { context, page };
}

test("two browsers share server-authoritative presence, movement, chat and leave state", async ({ browser }) => {
  const first = await createPlayer(browser, "Alpha");
  const second = await createPlayer(browser, "Beta");
  const { page: alpha } = first;
  const { page: beta } = second;

  await expect(alpha.locator("#player-count")).toHaveText("2 PLAYERS");
  await expect(beta.locator("#player-count")).toHaveText("2 PLAYERS");
  await expect(beta.locator("#players-list")).toContainText("Alpha");
  await expect(alpha.locator("#players-list")).toContainText("Beta");

  await alpha.locator("#chat-input").fill("server checked message");
  await alpha.locator("#chat-form button").click();
  await expect(beta.locator("#chat-log")).toContainText("Alpha: server checked message");

  await alpha.keyboard.press("Space");
  await expect(alpha.locator("#chat-log")).toContainText("Move closer to the Moss Titan.");

  const alphaEntry = beta.locator('#players-list li').filter({ hasText: "Alpha" });
  const beforeX = Number(await alphaEntry.getAttribute("data-x"));
  await alpha.keyboard.down("ArrowRight");
  await alpha.waitForTimeout(440);
  await alpha.keyboard.up("ArrowRight");
  await expect.poll(async () => Number(await alphaEntry.getAttribute("data-x"))).toBeGreaterThan(beforeX);

  await alpha.locator("#leave").click();
  await expect(beta.locator("#player-count")).toHaveText("1 PLAYER");
  await expect(beta.locator("#chat-log")).toContainText("Alpha left the realm.");
  await first.context.close();
  await second.context.close();
});

test("server rejects spoofed state messages and limits chat", async ({ browser }) => {
  const player = await createPlayer(browser, "Owner");
  const { page } = player;

  const spoofResult = await page.evaluate((workerOrigin) => new Promise((resolve, reject) => {
    const url = new URL("/room", workerOrigin);
    url.protocol = "ws:";
    url.searchParams.set("room", "robust-spoof-room");
    url.searchParams.set("name", "BadActor");
    const ws = new WebSocket(url);
    const timeout = setTimeout(() => reject(new Error("No server response")), 5000);
    ws.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "welcome") {
        ws.send(JSON.stringify({ type: "attack", damage: 999999, xp: 999999 }));
      } else if (message.type === "error") {
        clearTimeout(timeout);
        ws.close();
        resolve(message.code);
      }
    });
    ws.addEventListener("error", () => {
      clearTimeout(timeout);
      reject(new Error("Raw test socket failed"));
    });
  }), WORKER_ORIGIN);
  expect(spoofResult).toBe("invalid_message");

  for (let index = 0; index < 6; index += 1) {
    await page.locator("#chat-input").fill("rate test " + index);
    await page.locator("#chat-form button").click();
  }
  await expect(page.locator("#chat-log")).toContainText("Chat limit reached.");
  await player.context.close();
});

test("server rejects missing origins and non-WebSocket room requests", async ({ request }) => {
  const health = await request.get(WORKER_ORIGIN + "/health");
  expect(health.ok()).toBeTruthy();
  expect(await health.json()).toMatchObject({ ok: true, protocol: 1 });

  const noOrigin = await request.get(WORKER_ORIGIN + "/room?room=abc&name=Guest");
  expect(noOrigin.status()).toBe(403);

  const noUpgrade = await request.get(WORKER_ORIGIN + "/room?room=abc&name=Guest", {
    headers: { Origin: "http://127.0.0.1:4173" }
  });
  expect(noUpgrade.status()).toBe(426);
});

test("Realm explains when the project server endpoint is not configured", async ({ page }) => {
  await page.goto("/realm.html");
  await expect(page.locator("#connection-status")).toContainText("server is not configured");
  await page.getByRole("button", { name: /join realm/i }).click();
  await expect(page.locator("#connection-status")).toContainText("server is not configured");
});
