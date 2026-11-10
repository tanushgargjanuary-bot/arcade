import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL("../" + path, import.meta.url), "utf8");

test("lobby loads app entry point and local data controls", async () => {
  const html = await read("index.html");
  assert.match(html, /src\/main.js/);
  assert.match(html, /id="export-button"/);
  assert.match(html, /id="import-button"/);
  assert.match(html, /id="import-file"/);
});

test("catalogue has a handler for each embedded game", async () => {
  const data = await read("src/data.js");
  const games = await read("src/games.js");
  for (const id of ["snake", "2048", "minesweeper"]) {
    assert.ok(data.includes('id:"' + id + '"') && games.includes('id==="' + id + '"'));
  }
  assert.ok(data.includes("neon-dodge"));
});

test("local-first app has no cloud account dependencies", async () => {
  const main = await read("src/main.js");
  const html = await read("index.html");
  assert.doesNotMatch(main + html, /supabase|sign in|create account|cloud sync/i);
});

test("storage supports versioned export and validated merge import", async () => {
  const storage = await read("src/storage.js");
  assert.match(storage, /exportData/);
  assert.match(storage, /importData/);
  assert.match(storage, /Math\.max\(old\.best, record\.best\)/);
  assert.match(storage, /payload\.version !== VERSION/);
});

test("documentation describes local storage limits and backup flow", async () => {
  const readme = await read("README.md");
  const architecture = await read("docs/ARCHITECTURE.md");
  assert.match(readme, /Export/);
  assert.match(readme, /Clearing site data can remove it/);
  assert.match(architecture, /user-controlled/);
});

test("security policy treats browser scores as untrusted", async () => {
  const security = await read("SECURITY.md");
  assert.match(security, /user-controlled/i);
  assert.match(security, /service_role/i);
});
