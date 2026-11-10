import { MULTIPLAYER_ENDPOINT } from "./multiplayer-config.js";

const $ = (selector) => document.querySelector(selector);
const status = $("#connection-status");
const joinPanel = $("#join-panel");
const layout = $("#realm-layout");
const canvas = $("#realm-world");
const ctx = canvas.getContext("2d");
const keys = new Set();
const WORLD = { width: 760, height: 480, radius: 12 };
const MAX_PLAYERS = 16;
const MAX_CHAT_LINES = 80;
const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 16000];

let socket = null;
let roomCode = "";
let name = "";
let playerId = null;
let players = new Map();
let enemy = { id: "moss-titan", name: "Moss Titan", x: 570, y: 240, hp: 100, maxHp: 100 };
let xp = 0;
let localX = 120;
let localY = 180;
let moveTimer = null;
let animationId = 0;
let heartbeatTimer = null;
let connectTimeout = null;
let reconnectTimer = null;
let reconnectAttempt = 0;
let lastPongAt = 0;
let lastMoveAt = 0;
let lastAttackAt = 0;
let intentionalLeave = false;
let joinedOnce = false;

function setStatus(message) { status.textContent = message; }

function generateRoomCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return "r-" + [...bytes].map((value) => value.toString(16).padStart(2, "0")).join("");
}

const requestedRoomCode = new URLSearchParams(window.location.search).get("room");
$("#room-code").value = requestedRoomCode && /^[a-zA-Z0-9_-]{8,24}$/.test(requestedRoomCode)
  ? requestedRoomCode
  : generateRoomCode();

function addChat(playerName, message, system = false) {
  const line = document.createElement("div");
  line.className = "chat-line" + (system ? " system" : "");
  if (system) {
    line.textContent = message;
  } else {
    const label = document.createElement("strong");
    label.textContent = playerName + ": ";
    line.append(label, document.createTextNode(message));
  }
  $("#chat-log").append(line);
  $("#chat-log").scrollTop = $("#chat-log").scrollHeight;
  while ($("#chat-log").children.length > MAX_CHAT_LINES) $("#chat-log").firstElementChild.remove();
}

function send(payload) {
  if (!socket || socket.readyState !== WebSocket.OPEN) return false;
  try {
    socket.send(JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

function validPlayer(player) {
  return player && typeof player.id === "string" &&
    typeof player.name === "string" && player.name.length <= 16 &&
    Number.isFinite(player.x) && Number.isFinite(player.y) &&
    Number.isFinite(player.hp) && Number.isFinite(player.xp);
}

function applyPlayers(list) {
  if (!Array.isArray(list) || list.length > MAX_PLAYERS) return;
  const next = new Map();
  for (const player of list) {
    if (!validPlayer(player)) continue;
    next.set(player.id, {
      id: player.id,
      name: player.name,
      x: Math.max(WORLD.radius, Math.min(WORLD.width - WORLD.radius, player.x)),
      y: Math.max(WORLD.radius, Math.min(WORLD.height - WORLD.radius, player.y)),
      hp: Math.max(0, Math.min(100, player.hp)),
      xp: Math.max(0, Math.min(100000, player.xp))
    });
  }
  players = next;
  const own = players.get(playerId);
  if (own) {
    localX = own.x;
    localY = own.y;
    xp = own.xp;
  }
  updateHud();
}

function applyEnemy(value) {
  if (!value || value.id !== "moss-titan" ||
      !Number.isFinite(value.hp) || !Number.isFinite(value.maxHp) ||
      !Number.isFinite(value.x) || !Number.isFinite(value.y) ||
      value.maxHp !== 100 || value.hp < 0 || value.hp > value.maxHp) return;
  enemy = { ...enemy, ...value };
}

function updateHud() {
  const list = [...players.values()].sort((a, b) => a.name.localeCompare(b.name));
  $("#realm-label").textContent = "ROOM: " + roomCode.toUpperCase();
  $("#player-count").textContent = list.length + " PLAYER" + (list.length === 1 ? "" : "S");
  $("#players-list").replaceChildren();
  for (const player of list) {
    const item = document.createElement("li");
    item.dataset.playerId = player.id;
    item.dataset.x = String(player.x);
    item.dataset.y = String(player.y);
    const label = document.createElement("strong");
    label.textContent = player.name;
    item.append(label, document.createTextNode(" · HP " + player.hp + " · XP " + player.xp));
    $("#players-list").append(item);
  }
  $("#player-xp").textContent = "XP " + xp;
  $("#boss-hp").textContent = "BOSS HP " + enemy.hp + "/" + enemy.maxHp;
}

function handleMessage(raw) {
  if (typeof raw !== "string" || raw.length > 8192) return;
  let message;
  try { message = JSON.parse(raw); } catch { return; }
  if (!message || typeof message !== "object" || Array.isArray(message)) return;

  if (message.type === "welcome") {
    if (message.protocol !== 1 || !validPlayer(message.player) || typeof message.player.id !== "string") {
      setStatus("The server sent an unsupported response. Update the game client.");
      socket?.close(1002, "Unsupported protocol");
      return;
    }
    playerId = message.player.id;
    applyEnemy(message.enemy);
    applyPlayers(message.players);
    if (!players.has(playerId)) applyPlayers([...players.values(), message.player]);
    joinedOnce = true;
    reconnectAttempt = 0;
    joinPanel.hidden = true;
    layout.hidden = false;
    setStatus("Connected to room " + roomCode + ".");
    addChat("Realm", "Connected. Move with WASD or arrows. Press Space near the Moss Titan.", true);
    startMovement();
    startHeartbeat();
    return;
  }

  if (message.type === "state") {
    applyEnemy(message.enemy);
    applyPlayers(message.players);
    return;
  }

  if (message.type === "chat") {
    if (typeof message.name === "string" && typeof message.text === "string" &&
        message.name.length <= 16 && message.text.length <= 180) {
      addChat(message.name, message.text);
    }
    return;
  }

  if (message.type === "system") {
    if (typeof message.text === "string" && message.text.length <= 240) addChat("Realm", message.text, true);
    return;
  }

  if (message.type === "pong") {
    lastPongAt = Date.now();
    return;
  }

  if (message.type === "error") {
    const text = typeof message.message === "string" ? message.message.slice(0, 180) : "The server rejected that action.";
    addChat("Realm", text, true);
  }
}

function buildSocketUrl() {
  const endpoint = new URL("/room", MULTIPLAYER_ENDPOINT);
  endpoint.protocol = endpoint.protocol === "https:" ? "wss:" : "ws:";
  endpoint.searchParams.set("room", roomCode);
  endpoint.searchParams.set("name", name);
  return endpoint;
}

function startHeartbeat() {
  stopHeartbeat();
  lastPongAt = Date.now();
  heartbeatTimer = setInterval(() => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    if (Date.now() - lastPongAt > 50000) {
      socket.close(4000, "Heartbeat timeout");
      return;
    }
    send({ type: "ping" });
  }, 20000);
}

function stopHeartbeat() {
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  heartbeatTimer = null;
}

function scheduleReconnect() {
  if (intentionalLeave || reconnectTimer || reconnectAttempt >= RECONNECT_DELAYS.length) {
    if (!intentionalLeave && reconnectAttempt >= RECONNECT_DELAYS.length) {
      setStatus("Connection lost. Reconnect limit reached. Leave and join again.");
    }
    return;
  }
  const delay = RECONNECT_DELAYS[reconnectAttempt++];
  setStatus("Connection lost. Reconnecting in " + Math.ceil(delay / 1000) + "s…");
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    openSocket();
  }, delay);
}

function openSocket() {
  if (intentionalLeave) return;
  if (!MULTIPLAYER_ENDPOINT) {
    setStatus("Multiplayer server is not configured. See docs/MULTIPLAYER-SETUP.md.");
    return;
  }
  let current;
  try {
    current = new WebSocket(buildSocketUrl());
    socket = current;
  } catch (error) {
    setStatus("Could not create the connection: " + (error?.message || "invalid server URL"));
    scheduleReconnect();
    return;
  }

  if (connectTimeout) clearTimeout(connectTimeout);
  connectTimeout = setTimeout(() => {
    if (current.readyState === WebSocket.CONNECTING) current.close(4001, "Connection timeout");
  }, 12000);

  current.addEventListener("open", () => {
    if (current !== socket) return;
    if (connectTimeout) clearTimeout(connectTimeout);
    connectTimeout = null;
    setStatus("Connected to server. Joining room…");
  });

  current.addEventListener("message", (event) => {
    if (current === socket) handleMessage(event.data);
  });

  current.addEventListener("error", () => {
    if (current === socket) setStatus("Network error. Checking the connection…");
  });

  current.addEventListener("close", () => {
    if (current !== socket) return;
    socket = null;
    if (connectTimeout) clearTimeout(connectTimeout);
    connectTimeout = null;
    stopHeartbeat();
    stopMovement();
    if (!intentionalLeave) {
      if (joinedOnce) {
        layout.hidden = false;
        joinPanel.hidden = true;
      } else {
        layout.hidden = true;
        joinPanel.hidden = false;
      }
      scheduleReconnect();
    }
  });
}

function connect() {
  if (socket && [WebSocket.CONNECTING, WebSocket.OPEN].includes(socket.readyState)) return;
  name = $("#player-name").value.trim();
  roomCode = $("#room-code").value.trim();
  if (!/^[a-zA-Z0-9_-]{8,24}$/.test(roomCode)) {
    setStatus("Room code must be 8–24 letters, numbers, underscores or hyphens.");
    return;
  }
  if (!/^[\p{L}\p{N} _-]{2,16}$/u.test(name)) {
    setStatus("Player name must be 2–16 letters or numbers.");
    return;
  }
  if (!MULTIPLAYER_ENDPOINT) {
    setStatus("Multiplayer server is not configured. See docs/MULTIPLAYER-SETUP.md.");
    return;
  }
  intentionalLeave = false;
  joinedOnce = false;
  reconnectAttempt = 0;
  playerId = null;
  players.clear();
  openSocket();
}

function stopMovement() {
  if (moveTimer) clearInterval(moveTimer);
  moveTimer = null;
  keys.clear();
}

function startMovement() {
  stopMovement();
  moveTimer = setInterval(() => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    const now = Date.now();
    if (now - lastMoveAt < 100) return;
    let dx = 0, dy = 0;
    if (keys.has("arrowleft") || keys.has("a")) dx--;
    if (keys.has("arrowright") || keys.has("d")) dx++;
    if (keys.has("arrowup") || keys.has("w")) dy--;
    if (keys.has("arrowdown") || keys.has("s")) dy++;
    if (!dx && !dy) return;
    lastMoveAt = now;
    send({ type: "move", dx, dy });
  }, 100);
}

function leave() {
  intentionalLeave = true;
  if (reconnectTimer) clearTimeout(reconnectTimer);
  reconnectTimer = null;
  stopHeartbeat();
  stopMovement();
  if (connectTimeout) clearTimeout(connectTimeout);
  connectTimeout = null;
  send({ type: "leave" });
  if (socket && socket.readyState < WebSocket.CLOSING) socket.close(1000, "Player left");
  socket = null;
  players.clear();
  playerId = null;
  layout.hidden = true;
  joinPanel.hidden = false;
  setStatus("Disconnected. You left the realm.");
  updateHud();
}

function drawWorld() {
  ctx.fillStyle = "#09111d";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#17283a";
  for (let x = 0; x <= canvas.width; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
  for (let y = 0; y <= canvas.height; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }
  ctx.fillStyle = "#a8d17b";
  ctx.beginPath(); ctx.arc(enemy.x, enemy.y, 24, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#17220f"; ctx.font = "bold 10px monospace"; ctx.textAlign = "center";
  ctx.fillText("TITAN", enemy.x, enemy.y + 4);
  ctx.fillStyle = "#26334a"; ctx.fillRect(enemy.x - 30, enemy.y - 38, 60, 6);
  ctx.fillStyle = "#ff6687"; ctx.fillRect(enemy.x - 30, enemy.y - 38, 60 * enemy.hp / enemy.maxHp, 6);
  for (const player of players.values()) {
    ctx.fillStyle = player.id === playerId ? "#68e7f4" : "#c4f26b";
    ctx.beginPath(); ctx.arc(player.x, player.y, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#f0f4ff"; ctx.font = "11px sans-serif"; ctx.fillText(player.name.slice(0, 16), player.x, player.y - 19);
  }
  animationId = requestAnimationFrame(drawWorld);
}

async function copyInvite() {
  const code = (roomCode || $("#room-code").value).trim();
  if (!/^[a-zA-Z0-9_-]{8,24}$/.test(code)) {
    setStatus("Enter a valid 8–24 character room code first.");
    return;
  }
  const invite = new URL("realm.html", window.location.href);
  invite.searchParams.set("room", code);
  try {
    await navigator.clipboard.writeText(invite.href);
    setStatus("Invite link copied. Share it only with people you trust.");
  } catch {
    setStatus("Copy is unavailable. Share this room code: " + code);
  }
}

$("#connect").addEventListener("click", connect);
$("#copy-invite").addEventListener("click", copyInvite);
$("#copy-invite-active").addEventListener("click", copyInvite);
$("#leave").addEventListener("click", leave);
$("#chat-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = $("#chat-input");
  const text = input.value.trim().replace(/[\u0000-\u001f\u007f]/g, "").slice(0, 180);
  if (!text || !socket || socket.readyState !== WebSocket.OPEN) return;
  if (send({ type: "chat", text })) input.value = "";
});

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (event.target instanceof HTMLElement && ["INPUT", "TEXTAREA"].includes(event.target.tagName)) return;
  if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key) && !layout.hidden) event.preventDefault();
  keys.add(key);
  if (key === " " && socket?.readyState === WebSocket.OPEN && !layout.hidden && Date.now() - lastAttackAt >= 650) {
    lastAttackAt = Date.now();
    send({ type: "attack" });
  }
});
window.addEventListener("keyup", (event) => keys.delete(event.key.toLowerCase()));
window.addEventListener("blur", () => keys.clear());
window.addEventListener("pagehide", () => {
  intentionalLeave = true;
  send({ type: "leave" });
  socket?.close(1000, "Page closed");
  stopHeartbeat();
  stopMovement();
  if (reconnectTimer) clearTimeout(reconnectTimer);
  cancelAnimationFrame(animationId);
});

drawWorld();
setStatus(MULTIPLAYER_ENDPOINT
  ? "Enter a name and room code to join the authoritative game server."
  : "Multiplayer server is not configured. See docs/MULTIPLAYER-SETUP.md.");
