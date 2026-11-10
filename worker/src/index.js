import { DurableObject } from "cloudflare:workers";
import {
  validRoomId, cleanPlayerName, parseClientMessage, movePlayer, canAttack,
  newEnemy, publicPlayer, MAX_PLAYERS, MOVE_INTERVAL_MS, ATTACK_COOLDOWN_MS,
  CHAT_WINDOW_MS, MAX_CHAT_PER_WINDOW, MAX_INVALID_MESSAGES
} from "./game-rules.js";

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "x-content-type-options": "nosniff"
};
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });

function allowedOrigin(request, env) {
  const origin = request.headers.get("Origin");
  if (!origin) return false;
  return (env.ALLOWED_ORIGINS || "").split(",").map((item) => item.trim()).filter(Boolean).includes(origin);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/health" && request.method === "GET") {
      return json({ ok: true, service: "arcade-realm-api", protocol: 1 });
    }
    if (url.pathname !== "/room" || request.method !== "GET") return json({ error: "Not found" }, 404);
    if (!allowedOrigin(request, env)) return json({ error: "Origin not allowed" }, 403);
    if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket") {
      return json({ error: "WebSocket upgrade required" }, 426);
    }

    const roomId = url.searchParams.get("room") || "";
    const name = cleanPlayerName(url.searchParams.get("name") || "");
    if (!validRoomId(roomId)) return json({ error: "Room code must contain 3–24 letters, numbers, underscores or hyphens." }, 400);
    if (!name) return json({ error: "Player name must contain 2–16 letters, numbers, spaces, underscores or hyphens." }, 400);

    const id = env.REALM_ROOMS.idFromName(roomId.toLowerCase());
    return env.REALM_ROOMS.get(id).fetch(request);
  }
};

export class RealmRoom extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.ctx = ctx;
    this.env = env;
    this.messageQueue = Promise.resolve();
  }

  enqueue(task) {
    const next = this.messageQueue.then(task, task);
    this.messageQueue = next.catch(() => {});
    return next;
  }

  activeSockets() {
    return this.ctx.getWebSockets().filter((ws) => {
      const player = ws.deserializeAttachment();
      return player && !player.left && ws.readyState === 1;
    });
  }

  async fetch(request) {
    const url = new URL(request.url);
    const name = cleanPlayerName(url.searchParams.get("name") || "");
    if (!name) return json({ error: "Invalid player name." }, 400);
    const enemy = await this.getEnemy();

    // Recheck after storage I/O. No await occurs between this check and acceptWebSocket.
    if (this.activeSockets().length >= MAX_PLAYERS) {
      return json({ error: "This room is full. Try another room." }, 429);
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    const player = {
      id: crypto.randomUUID(),
      name,
      x: 90 + Math.random() * 100,
      y: 100 + Math.random() * 260,
      hp: 100,
      xp: 0,
      lastMoveAt: 0,
      lastAttackAt: 0,
      chatWindowAt: Date.now(),
      chatCount: 0,
      invalidMessages: 0,
      left: false
    };

    this.ctx.acceptWebSocket(server);
    server.serializeAttachment(player);
    this.send(server, {
      type: "welcome",
      protocol: 1,
      player: publicPlayer(player),
      players: this.getPlayers(),
      enemy
    });
    this.broadcast({ type: "system", text: player.name + " entered the realm." }, server);
    await this.broadcastState();
    return new Response(null, { status: 101, webSocket: client });
  }

  async getEnemy() {
    let enemy = await this.ctx.storage.get("enemy");
    if (!enemy) {
      enemy = newEnemy();
      await this.ctx.storage.put("enemy", enemy);
    }
    return enemy;
  }

  getPlayers() {
    return this.activeSockets().map((ws) => publicPlayer(ws.deserializeAttachment()));
  }

  send(ws, payload) {
    if (ws.readyState !== 1) return false;
    try {
      ws.send(JSON.stringify(payload));
      return true;
    } catch {
      return false;
    }
  }

  broadcast(payload, except = null) {
    for (const ws of this.activeSockets()) {
      if (ws === except) continue;
      if (!this.send(ws, payload)) {
        try { ws.close(1011, "Delivery failed"); } catch { /* Already closed. */ }
      }
    }
  }

  async broadcastState() {
    const enemy = await this.getEnemy();
    this.broadcast({ type: "state", players: this.getPlayers(), enemy });
  }

  rejectMessage(ws, player, code, message) {
    player.invalidMessages += 1;
    ws.serializeAttachment(player);
    this.send(ws, { type: "error", code, message });
    if (player.invalidMessages >= MAX_INVALID_MESSAGES) {
      try { ws.close(1008, "Too many invalid messages"); } catch { /* Already closed. */ }
    }
  }

  webSocketMessage(ws, raw) {
    return this.enqueue(() => this.handleMessage(ws, raw));
  }

  async handleMessage(ws, raw) {
    const player = ws.deserializeAttachment();
    if (!player || player.left) return;
    const message = parseClientMessage(raw);
    if (!message) {
      this.rejectMessage(ws, player, "invalid_message", "Message rejected.");
      return;
    }

    const now = Date.now();
    if (message.type === "ping") {
      this.send(ws, { type: "pong", at: now });
      return;
    }

    if (message.type === "leave") {
      player.left = true;
      ws.serializeAttachment(player);
      this.broadcast({ type: "system", text: player.name + " left the realm." }, ws);
      await this.broadcastState();
      try { ws.close(1000, "Player left"); } catch { /* Already closed. */ }
      return;
    }

    if (message.type === "move") {
      if (now - player.lastMoveAt < MOVE_INTERVAL_MS) return;
      const position = movePlayer(player, message.dx, message.dy);
      player.x = position.x;
      player.y = position.y;
      player.lastMoveAt = now;
      ws.serializeAttachment(player);
      await this.broadcastState();
      return;
    }

    if (message.type === "chat") {
      if (now - player.chatWindowAt >= CHAT_WINDOW_MS) {
        player.chatWindowAt = now;
        player.chatCount = 0;
      }
      if (player.chatCount >= MAX_CHAT_PER_WINDOW) {
        this.send(ws, { type: "error", code: "chat_rate_limited", message: "Chat limit reached. Wait before sending more messages." });
        return;
      }
      player.chatCount += 1;
      ws.serializeAttachment(player);
      this.broadcast({ type: "chat", id: crypto.randomUUID(), name: player.name, text: message.text, at: now });
      return;
    }

    if (message.type === "attack") {
      if (now - player.lastAttackAt < ATTACK_COOLDOWN_MS) return;
      player.lastAttackAt = now;
      const enemy = await this.getEnemy();
      if (!canAttack(player, enemy)) {
        ws.serializeAttachment(player);
        this.send(ws, { type: "error", code: "out_of_range", message: "Move closer to the Moss Titan." });
        return;
      }

      enemy.hp = Math.max(0, enemy.hp - 10);
      let defeated = false;
      if (enemy.hp === 0) {
        player.xp += 25;
        enemy.hp = enemy.maxHp;
        defeated = true;
      }
      ws.serializeAttachment(player);
      await this.ctx.storage.put("enemy", enemy);
      if (defeated) {
        this.broadcast({ type: "system", text: player.name + " defeated the Moss Titan and earned 25 XP. The Titan returned." });
      }
      await this.broadcastState();
    }
  }

  webSocketClose(ws) {
    return this.enqueue(async () => {
      const player = ws.deserializeAttachment();
      if (player && !player.left) {
        player.left = true;
        ws.serializeAttachment(player);
        this.broadcast({ type: "system", text: player.name + " left the realm." }, ws);
      }
      await this.broadcastState();
    });
  }

  webSocketError(ws) {
    try { ws.close(1011, "Connection error"); } catch { /* Already closed. */ }
  }
}
