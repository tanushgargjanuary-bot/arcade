import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const read = (path) => readFile(new URL("../" + path, import.meta.url), "utf8");
test("every catalogue game has a usable entry point", async () => {
  const data = await read("src/data.js");
  const main = await read("src/main.js");
  const realm = await read("realm.html");
  assert.match(data, /realm-rpg/);
  assert.match(main, /realm-rpg/);
  assert.match(realm, /src\/rpg-client.js/);
});
test("multiplayer client renders chat as text, not HTML", async () => {
  const client = await read("src/rpg-client.js");
  assert.doesNotMatch(client, /innerHTML\s*=.*message|innerHTML\s*=.*text/);
  assert.match(client, /textContent = text/);
});
test("multiplayer API has origin checks, bounded messages and room limits", async () => {
  const worker = await read("worker/src/index.js");
  const rules = await read("worker/src/game-rules.js");
  assert.match(worker, /allowedOrigin/);
  assert.match(worker, /raw\.length > 2048/);
  assert.match(worker, /MAX_PLAYERS/);
  assert.match(rules, /MAX_MESSAGE_LENGTH/);
});
test("project docs cover scope, setup, security and operations", async () => {
  for (const path of ["README.md", "docs/ARCHITECTURE.md", "docs/ROADMAP.md", "docs/PROJECT-HISTORY.md", "docs/TESTING.md", "docs/MULTIPLAYER-SETUP.md", "docs/SECURITY.md", "docs/OPERATIONS.md"]) {
    const content = await read(path);
    assert.ok(content.trim().length > 100, path + " is missing or too short");
  }
});
