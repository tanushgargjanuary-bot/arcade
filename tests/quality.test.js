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
test("Realm uses the pinned Trystero release without a configured server", async () => {
  const client = await read("src/rpg-client.js");
  const config = await read("src/multiplayer-config.js");
  assert.match(client, /https:\/\/esm\.sh\/trystero@0\.25\.4/);
  assert.match(client, /joinRoom/);
  assert.match(client, /makeAction/);
  assert.doesNotMatch(client, /MULTIPLAYER_ENDPOINT|WebSocket\(/);
  assert.match(config, /TRYSTERO_VERSION = "0\.25\.4"/);
});
test("multiplayer chat is rendered as text, not HTML", async () => {
  const client = await read("src/rpg-client.js");
  assert.doesNotMatch(client, /innerHTML\s*=/);
  assert.match(client, /textContent = message/);
});
test("legacy Worker rules remain bounded", async () => {
  const worker = await read("worker/src/index.js");
  const rules = await read("worker/src/game-rules.js");
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
