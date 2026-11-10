export const ROOM_ID_PATTERN = /^[a-zA-Z0-9_-]{3,24}$/;
export const PLAYER_NAME_PATTERN = /^[\p{L}\p{N} _-]{2,16}$/u;
export const MAX_PLAYERS = 16;
export const MAX_MESSAGE_LENGTH = 180;
export const MAX_RAW_MESSAGE_LENGTH = 2048;
export const MOVE_INTERVAL_MS = 50;
export const ATTACK_COOLDOWN_MS = 650;
export const CHAT_WINDOW_MS = 10000;
export const MAX_CHAT_PER_WINDOW = 5;
export const MAX_INVALID_MESSAGES = 5;
export const MESSAGE_WINDOW_MS = 10000;
export const MAX_MESSAGES_PER_WINDOW = 240;
export const ROOM_IDLE_TTL_MS = 60000;
export const WORLD = Object.freeze({ width: 760, height: 480, playerRadius: 12, moveStep: 18, enemyRadius: 24 });

const ALLOWED_KEYS = Object.freeze({
  move: ["type", "dx", "dy"],
  attack: ["type"],
  chat: ["type", "text"],
  leave: ["type"],
  ping: ["type"]
});

export function validRoomId(value) {
  return typeof value === "string" && ROOM_ID_PATTERN.test(value);
}

export function cleanPlayerName(value) {
  if (typeof value !== "string") return null;
  const name = value.trim().replace(/\s+/g, " ");
  return PLAYER_NAME_PATTERN.test(name) ? name : null;
}

export function cleanChatMessage(value) {
  if (typeof value !== "string" || value.length > MAX_MESSAGE_LENGTH) return null;
  const message = value.replace(/[\u0000-\u001f\u007f]/g, "").trim();
  return message.length > 0 && message.length <= MAX_MESSAGE_LENGTH ? message : null;
}

export function parseClientMessage(raw) {
  if (typeof raw !== "string" || raw.length === 0 || raw.length > MAX_RAW_MESSAGE_LENGTH) return null;
  let message;
  try { message = JSON.parse(raw); } catch { return null; }
  if (!message || typeof message !== "object" || Array.isArray(message) || typeof message.type !== "string") return null;
  const allowed = ALLOWED_KEYS[message.type];
  if (!allowed || Object.keys(message).some((key) => !allowed.includes(key))) return null;
  if (message.type === "move") {
    if (!Number.isFinite(message.dx) || !Number.isFinite(message.dy)) return null;
    if (Math.abs(message.dx) > 1 || Math.abs(message.dy) > 1 || (!message.dx && !message.dy)) return null;
    return { type: "move", dx: message.dx, dy: message.dy };
  }
  if (message.type === "chat") {
    const text = cleanChatMessage(message.text);
    return text ? { type: "chat", text } : null;
  }
  return { type: message.type };
}

export function clampPosition(x, y) {
  const min = WORLD.playerRadius;
  return {
    x: Math.max(min, Math.min(WORLD.width - min, Number.isFinite(x) ? x : WORLD.width / 2)),
    y: Math.max(min, Math.min(WORLD.height - min, Number.isFinite(y) ? y : WORLD.height / 2))
  };
}

export function movePlayer(player, dx, dy) {
  if (!Number.isFinite(dx) || !Number.isFinite(dy) || Math.abs(dx) > 1 || Math.abs(dy) > 1) return { x: player.x, y: player.y };
  const length = Math.hypot(dx, dy) || 1;
  return clampPosition(player.x + (dx / length) * WORLD.moveStep, player.y + (dy / length) * WORLD.moveStep);
}

export function canAttack(player, enemy) {
  return Math.hypot(player.x - enemy.x, player.y - enemy.y) <= WORLD.enemyRadius + 44;
}

export function newEnemy() {
  return { id: "moss-titan", name: "Moss Titan", x: 570, y: 240, hp: 100, maxHp: 100 };
}

export function publicPlayer(player) {
  return { id: player.id, name: player.name, x: player.x, y: player.y, hp: player.hp, xp: player.xp };
}
