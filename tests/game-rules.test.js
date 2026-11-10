import test from "node:test";
import assert from "node:assert/strict";
import { validRoomId, cleanPlayerName, cleanChatMessage, clampPosition, movePlayer, canAttack, newEnemy, MAX_PLAYERS } from "../worker/src/game-rules.js";
test("room IDs reject malformed and oversized values", () => {
  assert.equal(validRoomId("lobby_01"), true);
  assert.equal(validRoomId("ab"), false);
  assert.equal(validRoomId("bad room"), false);
  assert.equal(validRoomId("x".repeat(25)), false);
});
test("player names are trimmed and constrained", () => {
  assert.equal(cleanPlayerName("  Tanush   7 "), "Tanush 7");
  assert.equal(cleanPlayerName("x"), null);
  assert.equal(cleanPlayerName("<script>"), null);
  assert.equal(cleanPlayerName("a".repeat(17)), null);
});
test("chat strips control characters and enforces length", () => {
  assert.equal(cleanChatMessage("hello\u0000 world"), "hello world");
  assert.equal(cleanChatMessage("  "), null);
  assert.equal(cleanChatMessage("x".repeat(220)).length, 180);
});
test("movement is clamped to world bounds and normalised", () => {
  assert.deepEqual(clampPosition(-100, 900), { x: 12, y: 468 });
  const next = movePlayer({ x: 100, y: 100 }, 100, 0);
  assert.equal(next.x, 118);
  assert.equal(next.y, 100);
});
test("attacks require range and cooldown", () => {
  const enemy = newEnemy();
  assert.equal(canAttack({ x: 510, y: 240 }, enemy, 1000, 0), true);
  assert.equal(canAttack({ x: 100, y: 100 }, enemy, 1000, 0), false);
  assert.equal(canAttack({ x: 570, y: 240 }, enemy, 400, 0), false);
});
test("room capacity is bounded", () => assert.equal(MAX_PLAYERS, 20));
