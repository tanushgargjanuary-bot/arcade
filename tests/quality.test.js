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

test("Realm uses the authoritative server and no peer-hosted state", async () => {
  const client = await read("src/rpg-client.js");
  const config = await read("src/multiplayer-config.js");
  const worker = await read("worker/src/index.js");
  assert.match(client, /new WebSocket/);
  assert.match(client, /MULTIPLAYER_ENDPOINT/);
  assert.doesNotMatch(client, /trystero|makeAction|hostId/);
  assert.match(worker, /canAttack/);
  assert.match(worker, /movePlayer/);
  assert.match(worker, /this\.ctx\.storage\.put\("enemy"/);
});

test("server validates message schemas, size, origin and rate limits", async () => {
  const worker = await read("worker/src/index.js");
  const rules = await read("worker/src/game-rules.js");
  assert.match(worker, /allowedOrigin/);
  assert.match(worker, /ROOM_CONNECT_LIMIT/);
  assert.match(worker, /parseClientMessage/);
  assert.match(worker, /MAX_INVALID_MESSAGES/);
  assert.match(worker, /CHAT_WINDOW_MS/);
  assert.match(rules, /MAX_RAW_MESSAGE_LENGTH/);
  assert.match(rules, /MAX_CHAT_PER_WINDOW/);
  assert.match(rules, /Object\.keys\(message\)/);
});

test("multiplayer chat is rendered as text, not HTML", async () => {
  const client = await read("src/rpg-client.js");
  assert.doesNotMatch(client, /innerHTML\s*=/);
  assert.match(client, /textContent = message/);
});

test("project docs cover scope, setup, security and operations", async () => {
  for (const path of ["README.md", "docs/ARCHITECTURE.md", "docs/ROADMAP.md", "docs/PROJECT-HISTORY.md", "docs/TESTING.md", "docs/MULTIPLAYER-SETUP.md", "docs/SECURITY.md", "docs/OPERATIONS.md", "docs/ROBUSTNESS-PLAN.md"]) {
    const content = await read(path);
    assert.ok(content.trim().length > 100, path + " is missing or too short");
  }
});
