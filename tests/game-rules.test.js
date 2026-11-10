import test from "node:test";
import assert from "node:assert/strict";
import {
  validRoomId, cleanPlayerName, cleanChatMessage, parseClientMessage,
  clampPosition, movePlayer, canAttack, newEnemy, MAX_PLAYERS,
  MAX_RAW_MESSAGE_LENGTH, MAX_MESSAGE_LENGTH
} from "../worker/src/game-rules.js";

test("room IDs reject malformed and oversized values", () => {
  assert.equal(validRoomId("lobby_01"), true);
  assert.equal(validRoomId("ab"), false);
  assert.equal(validRoomId("bad room"), false);
  assert.equal(validRoomId("x".repeat(25)), false);
  assert.equal(validRoomId(null), false);
});

test("player names are trimmed and constrained", () => {
  assert.equal(cleanPlayerName("  Tanush   7 "), "Tanush 7");
  assert.equal(cleanPlayerName("x"), null);
  assert.equal(cleanPlayerName("<script>"), null);
  assert.equal(cleanPlayerName("a".repeat(17)), null);
  assert.equal(cleanPlayerName(null), null);
});

test("chat rejects blank and oversized input and strips controls", () => {
  assert.equal(cleanChatMessage("hello\u0000 world"), "hello world");
  assert.equal(cleanChatMessage("  "), null);
  assert.equal(cleanChatMessage("x".repeat(MAX_MESSAGE_LENGTH + 1)), null);
  assert.equal(cleanChatMessage("x".repeat(MAX_MESSAGE_LENGTH)).length, MAX_MESSAGE_LENGTH);
});

test("protocol parser rejects malformed, oversized and unknown payloads", () => {
  assert.equal(parseClientMessage("{"), null);
  assert.equal(parseClientMessage("x".repeat(MAX_RAW_MESSAGE_LENGTH + 1)), null);
  assert.equal(parseClientMessage(JSON.stringify({ type: "admin", value: true })), null);
  assert.equal(parseClientMessage(JSON.stringify({ type: "attack", damage: 999 })), null);
  assert.equal(parseClientMessage(JSON.stringify({ type: "chat", text: "hello", name: "spoofed" })), null);
  assert.equal(parseClientMessage(JSON.stringify({ type: "move", dx: 99, dy: 0 })), null);
  assert.equal(parseClientMessage(JSON.stringify({ type: "move", dx: NaN, dy: 0 })), null);
  assert.deepEqual(parseClientMessage(JSON.stringify({ type: "attack" })), { type: "attack" });
  assert.deepEqual(parseClientMessage(JSON.stringify({ type: "move", dx: 1, dy: 0 })), { type: "move", dx: 1, dy: 0 });
  assert.deepEqual(parseClientMessage(JSON.stringify({ type: "chat", text: "hello" })), { type: "chat", text: "hello" });
  assert.deepEqual(parseClientMessage(JSON.stringify({ type: "ping" })), { type: "ping" });
});

test("movement is normalised and clamped to world bounds", () => {
  assert.deepEqual(clampPosition(-100, 900), { x: 12, y: 468 });
  const next = movePlayer({ x: 100, y: 100 }, 1, 0);
  assert.equal(next.x, 118);
  assert.equal(next.y, 100);
  const diagonal = movePlayer({ x: 100, y: 100 }, 1, 1);
  assert.ok(Math.abs(Math.hypot(diagonal.x - 100, diagonal.y - 100) - 18) < 0.001);
  assert.deepEqual(movePlayer({ x: 100, y: 100 }, 2, 0), { x: 100, y: 100 });
  assert.deepEqual(movePlayer({ x: 100, y: 100 }, NaN, 0), { x: 100, y: 100 });
});

test("attacks require server-side range validation", () => {
  const enemy = newEnemy();
  assert.equal(canAttack({ x: 510, y: 240 }, enemy), true);
  assert.equal(canAttack({ x: 100, y: 100 }, enemy), false);
  assert.equal(enemy.hp, 100);
});

test("room capacity remains bounded", () => {
  assert.ok(Number.isInteger(MAX_PLAYERS));
  assert.ok(MAX_PLAYERS >= 2 && MAX_PLAYERS <= 32);
});
