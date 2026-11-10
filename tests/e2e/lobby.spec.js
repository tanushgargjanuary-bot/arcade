import { test, expect } from "@playwright/test";

test("lobby renders all games and category filters work", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /play something/i })).toBeVisible();
  await expect(page.locator(".card")).toHaveCount(5);
  await page.getByRole("button", { name: "Puzzle" }).click();
  await expect(page.locator(".card")).toHaveCount(1);
  await expect(page.locator(".card h3")).toHaveText("2048");
  await page.getByRole("button", { name: "Multiplayer" }).click();
  await expect(page.locator(".card h3")).toHaveText("Realm RPG");
});

test("Snake starts and returns to the lobby", async ({ page }) => {
  await page.goto("/");
  await page.locator('[data-play="snake"]').click();
  await expect(page).toHaveURL(/#\/game\/snake$/);
  await expect(page.locator("canvas.game-canvas")).toBeVisible();
  await page.getByRole("button", { name: /back to lobby/i }).click();
  await expect(page).toHaveURL(/#\/$/);
});

test("2048 and Minesweeper render playable boards", async ({ page }) => {
  await page.goto("/");
  await page.locator('[data-play="2048"]').click();
  await expect(page.locator(".tile")).toHaveCount(16);
  await page.keyboard.press("ArrowLeft");
  await page.getByRole("button", { name: /back to lobby/i }).click();
  await page.locator('[data-play="minesweeper"]').click();
  await expect(page.locator(".mine")).toHaveCount(81);
});


test("lobby remains usable on a narrow mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator(".card")).toHaveCount(5);
  await expect(page.locator(".card").first()).toBeVisible();
  await expect(page.locator("#search")).toBeVisible();
});
