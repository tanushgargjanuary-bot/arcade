import { test, expect } from "@playwright/test";
test("lobby renders the game catalogue and filters", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /play something/i })).toBeVisible();
  await expect(page.locator(".card")).toHaveCount(5);
  await page.getByRole("button", { name: "Puzzle" }).click();
  await expect(page.locator(".card")).toHaveCount(1);
  await expect(page.locator(".card h3")).toHaveText("2048");
});
test("game route starts Snake and returns to lobby", async ({ page }) => {
  await page.goto("/");
  await page.locator('[data-play="snake"]').click();
  await expect(page).toHaveURL(/#\/game\/snake$/);
  await expect(page.locator("canvas.game-canvas")).toBeVisible();
  await page.getByRole("button", { name: /back to lobby/i }).click();
  await expect(page).toHaveURL(/#\/$/);
});
test("Realm RPG explains missing server configuration without crashing", async ({ page }) => {
  await page.goto("/realm.html");
  await expect(page.getByRole("heading", { name: /enter the realm/i })).toBeVisible();
  await expect(page.locator("#connection-status")).toContainText("Server not configured");
  await page.getByRole("button", { name: /join realm/i }).click();
  await expect(page.locator("#connection-status")).toContainText("not deployed yet");
});
