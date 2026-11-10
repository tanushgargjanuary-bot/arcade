export const ROOM_ID_PATTERN = /^[a-zA-Z0-9_-]{3,24}$/;
export const PLAYER_NAME_PATTERN = /^[\p{L}\p{N} _-]{2,16}$/u;
export const MAX_PLAYERS = 20;
export const MAX_MESSAGE_LENGTH = 180;
export const WORLD = { width: 760, height: 480, playerRadius: 12, moveStep: 18, enemyRadius: 24 };

export function validRoomId(value) {
  return typeof value === "string" && ROOM_ID_PATTERN.test(value);
}
export function cleanPlayerName(value) {
  if (typeof value !== "string") return null;
  const name = value.trim().replace(/\s+/g, " ");
  return PLAYER_NAME_PATTERN.test(name) ? name : null;
}
export function cleanChatMessage(value) {
  if (typeof value !== "string") return null;
  const message = value.trim().replace(/[\u0000-\u001f\u007f]/g, "").slice(0, MAX_MESSAGE_LENGTH);
  return message.length ? message : null;
}
export function clampPosition(x, y) {
  const min = WORLD.playerRadius;
  return {
    x: Math.max(min, Math.min(WORLD.width - min, Number.isFinite(x) ? x : WORLD.width / 2)),
    y: Math.max(min, Math.min(WORLD.height - min, Number.isFinite(y) ? y : WORLD.height / 2))
  };
}
export function movePlayer(player, dx, dy) {
  if (!Number.isFinite(dx) || !Number.isFinite(dy)) return player;
  const length = Math.hypot(dx, dy) || 1;
  const scale = Math.min(1, 1 / length);
  return clampPosition(player.x + dx * scale * WORLD.moveStep, player.y + dy * scale * WORLD.moveStep);
}
export function canAttack(player, enemy, now, lastAttackAt) {
  return now - lastAttackAt >= 650 && Math.hypot(player.x - enemy.x, player.y - enemy.y) <= WORLD.enemyRadius + 44;
}
export function newEnemy() {
  return { id: "moss-titan", name: "Moss Titan", x: 570, y: 240, hp: 100, maxHp: 100 };
}
