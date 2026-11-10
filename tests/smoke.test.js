import test, { beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { recordRun, readLocal, stats, exportData, importData } from "../src/storage.js";

const read = (path) => readFile(new URL("../" + path, import.meta.url), "utf8");
let values;

beforeEach(() => {
  values = new Map();
  globalThis.localStorage = {
    getItem: (key) => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key)
  };
});

afterEach(() => {
  delete globalThis.localStorage;
});

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
    assert.ok(new RegExp('id:\\s*"' + id + '"').test(data) && games.includes('id==="' + id + '"'));
  }
  assert.ok(data.includes("neon-dodge"));
});

test("local-first app has no cloud account dependencies", async () => {
  const main = await read("src/main.js");
  const html = await read("index.html");
  assert.doesNotMatch(main + html, /supabase|sign in|create account|cloud sync/i);
});

test("recordRun stores valid statistics", () => {
  localStorage.setItem("neon-dodge-best", "900");
  recordRun("snake", 25, 12);
  recordRun("snake", 10, 8);
  const data = readLocal();
  assert.deepEqual(data.games.snake, { best: 25, plays: 2, totalSeconds: 20 });
  assert.deepEqual(stats(data), { played: 2, best: 900, seconds: 20 });
});

test("export and import preserve progress and do not lower existing records", () => {
  localStorage.setItem("neon-dodge-best", "900");
  recordRun("snake", 40, 30);
  const backup = exportData();
  recordRun("snake", 60, 45);
  recordRun("2048", 128, 90);
  importData(backup);
  const data = readLocal();
  assert.equal(data.games.snake.best, 60);
  assert.equal(data.games.snake.plays, 2);
  assert.equal(data.games["2048"].best, 128);
  assert.equal(data.neonDodgeBest, 900);
  assert.equal(localStorage.getItem("neon-dodge-best"), "900");
});

test("import rejects unknown versions and malformed records", () => {
  assert.throws(() => importData({ format: "arcade-progress", version: 99, data: { games: {} } }), /Unsupported backup/);
  assert.throws(() => importData({ format: "arcade-progress", version: 1, data: { games: { snake: { best: -1 } } } }), /invalid score/);
});

test("backup data is versioned and browser-only", async () => {
  const storage = await read("src/storage.js");
  const security = await read("SECURITY.md");
  assert.match(storage, /format: FORMAT, version: VERSION/);
  assert.match(security, /browser input as untrusted|user-controlled/i);
});
