import { DurableObject } from "cloudflare:workers";
import { validRoomId, cleanPlayerName, cleanChatMessage, movePlayer, canAttack, newEnemy, MAX_PLAYERS } from "./game-rules.js";

const JSON_HEADERS = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" };
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
function allowedOrigin(request, env) {
  const origin = request.headers.get("Origin");
  return origin && (env.ALLOWED_ORIGINS || "").split(",").map((item) => item.trim()).includes(origin);
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/health") return json({ ok: true, service: "arcade-realm-api" });
    if (request.method !== "GET" || url.pathname !== "/room") return json({ error: "Not found" }, 404);
    if (!allowedOrigin(request, env)) return json({ error: "Origin not allowed" }, 403);
    if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket") return json({ error: "WebSocket upgrade required" }, 426);
    const roomId = url.searchParams.get("room") || "lobby";
    const name = cleanPlayerName(url.searchParams.get("name") || "Guest");
    if (!validRoomId(roomId)) return json({ error: "Room IDs must be 3–24 letters, numbers, underscores or hyphens." }, 400);
    if (!name) return json({ error: "Name must be 2–16 letters, numbers, spaces, underscores or hyphens." }, 400);
    const id = env.REALM_ROOMS.idFromName(roomId.toLowerCase());
    return env.REALM_ROOMS.get(id).fetch(request);
  }
};

export class RealmRoom extends DurableObject {
  constructor(ctx, env) { super(ctx, env); this.ctx = ctx; this.env = env; }
  async fetch(request) {
    if (this.ctx.getWebSockets().length >= MAX_PLAYERS) return json({ error: "This room is full. Try another room." }, 429);
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    const url = new URL(request.url);
    const player = {
      id: crypto.randomUUID(), name: cleanPlayerName(url.searchParams.get("name")) || "Guest",
      x: 90 + Math.random() * 100, y: 100 + Math.random() * 260, hp: 100, xp: 0,
      lastMoveAt: 0, lastAttackAt: 0, lastChatAt: 0
    };
    this.ctx.acceptWebSocket(server);
    server.serializeAttachment(player);
    const enemy = await this.getEnemy();
    server.send(JSON.stringify({ type: "welcome", playerId: player.id, player, enemy, players: this.getPlayers() }));
    this.broadcast({ type: "system", text: player.name + " entered the realm." }, server);
    await this.broadcastState();
    return new Response(null, { status: 101, webSocket: client });
  }
  async getEnemy() { return (await this.ctx.storage.get("enemy")) || newEnemy(); }
  getPlayers() {
    return this.ctx.getWebSockets().map((ws) => ws.deserializeAttachment()).filter(Boolean)
      .map(({ id, name, x, y, hp, xp }) => ({ id, name, x, y, hp, xp }));
  }
  broadcast(payload, except = null) {
    const data = JSON.stringify(payload);
    for (const ws of this.ctx.getWebSockets()) {
      if (ws === except) continue;
      try { ws.send(data); } catch { /* Runtime removes closed sockets. */ }
    }
  }
  async broadcastState() { this.broadcast({ type: "state", players: this.getPlayers(), enemy: await this.getEnemy() }); }
  async webSocketMessage(ws, raw) {
    const player = ws.deserializeAttachment();
    if (!player || typeof raw !== "string" || raw.length > 2048) return;
    let message;
    try { message = JSON.parse(raw); } catch { return; }
    if (!message || typeof message.type !== "string") return;
    const now = Date.now();
    if (message.type === "move") {
      if (now - player.lastMoveAt < 45) return;
      player.lastMoveAt = now;
      const position = movePlayer(player, Number(message.dx), Number(message.dy));
      player.x = position.x; player.y = position.y;
      ws.serializeAttachment(player);
      await this.broadcastState();
    } else if (message.type === "chat") {
      if (now - player.lastChatAt < 700) return;
      const text = cleanChatMessage(message.text);
      if (!text) return;
      player.lastChatAt = now;
      ws.serializeAttachment(player);
      this.broadcast({ type: "chat", id: crypto.randomUUID(), name: player.name, text, at: now });
    } else if (message.type === "attack") {
      if (now - player.lastAttackAt < 650) return;
      const enemy = await this.getEnemy();
      if (!canAttack(player, enemy, now, player.lastAttackAt)) return;
      player.lastAttackAt = now;
      enemy.hp = Math.max(0, enemy.hp - 10);
      if (enemy.hp === 0) {
        player.xp += 25;
        enemy.hp = enemy.maxHp;
        this.broadcast({ type: "system", text: player.name + " defeated the Moss Titan and earned 25 XP. The Titan returned." });
      }
      ws.serializeAttachment(player);
      await this.ctx.storage.put("enemy", enemy);
      await this.broadcastState();
    }
  }
  webSocketClose(ws) {
    const player = ws.deserializeAttachment();
    if (player) this.broadcast({ type: "system", text: player.name + " left the realm." });
    this.broadcastState();
  }
  webSocketError(ws) { try { ws.close(1011, "Connection error"); } catch { /* Closed socket. */ } }
}
