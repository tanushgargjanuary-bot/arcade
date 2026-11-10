import { MULTIPLAYER_ENDPOINT } from "./multiplayer-config.js";

const $ = (selector) => document.querySelector(selector);
const status = $("#connection-status");
const joinPanel = $("#join-panel");
const layout = $("#realm-layout");
const canvas = $("#realm-world");
const ctx = canvas.getContext("2d");
const keys = new Set();
let socket = null;
let selfId = null;
let players = [];
let enemy = { id: "moss-titan", name: "Moss Titan", x: 570, y: 240, hp: 100, maxHp: 100 };
let room = "lobby";
let xp = 0;
let lastMove = 0;
let moveTimer = null;
let animationId = 0;

function setStatus(message) { status.textContent = message; }
function addChat(name, text, system = false) {
  const line = document.createElement("div");
  line.className = "chat-line" + (system ? " system" : "");
  if (system) line.textContent = text;
  else {
    const label = document.createElement("strong");
    label.textContent = name + ": ";
    line.append(label, document.createTextNode(text));
  }
  $("#chat-log").append(line);
  $("#chat-log").scrollTop = $("#chat-log").scrollHeight;
  while ($("#chat-log").children.length > 80) $("#chat-log").firstElementChild.remove();
}
function send(payload) {
  if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify(payload));
}
function updateHud() {
  $("#realm-label").textContent = "ROOM: " + room.toUpperCase();
  $("#player-count").textContent = players.length + " PLAYER" + (players.length === 1 ? "" : "S");
  $("#players-list").replaceChildren();
  for (const player of players) {
    const item = document.createElement("li");
    const label = document.createElement("strong");
    label.textContent = player.name;
    item.append(label, document.createTextNode(" · HP " + player.hp + " · XP " + player.xp));
    $("#players-list").append(item);
    if (player.id === selfId) xp = player.xp;
  }
  $("#player-xp").textContent = "XP " + xp;
}
function handleMessage(event) {
  let message;
  try { message = JSON.parse(event.data); } catch { return; }
  if (message.type === "welcome") {
    selfId = message.playerId;
    enemy = message.enemy;
    players = message.players || [];
    if (!players.some((player) => player.id === selfId)) players.push(message.player);
    xp = message.player.xp || 0;
    layout.hidden = false;
    joinPanel.hidden = true;
    setStatus("Connected. You are in room " + room + ".");
    updateHud();
    addChat("Realm", "Connected. Find the Moss Titan and press Space to attack.", true);
  } else if (message.type === "state") {
    players = message.players || [];
    enemy = message.enemy || enemy;
    updateHud();
  } else if (message.type === "chat") {
    addChat(message.name, message.text);
  } else if (message.type === "system") {
    addChat("Realm", message.text, true);
  } else if (message.type === "error") {
    addChat("Realm", message.message || "A server error occurred.", true);
  }
}
function connect() {
  if (!MULTIPLAYER_ENDPOINT) {
    setStatus("Multiplayer server is not deployed yet. Follow docs/MULTIPLAYER-SETUP.md.");
    return;
  }
  const name = $("#player-name").value.trim();
  room = $("#room-code").value.trim();
  if (!/^[a-zA-Z0-9_-]{3,24}$/.test(room)) { setStatus("Room code must be 3–24 letters, numbers, underscores or hyphens."); return; }
  if (!/^[\p{L}\p{N} _-]{2,16}$/u.test(name)) { setStatus("Player name must be 2–16 letters or numbers."); return; }
  const endpoint = new URL("/room", MULTIPLAYER_ENDPOINT);
  endpoint.searchParams.set("room", room);
  endpoint.searchParams.set("name", name);
  endpoint.protocol = endpoint.protocol === "https:" ? "wss:" : "ws:";
  setStatus("Connecting to " + room + "…");
  socket = new WebSocket(endpoint);
  socket.addEventListener("open", () => setStatus("Connection open. Joining room…"));
  socket.addEventListener("message", handleMessage);
  socket.addEventListener("close", () => {
    setStatus("Disconnected. Return to the lobby and reconnect.");
    layout.hidden = true;
    joinPanel.hidden = false;
    stopMovement();
  });
  socket.addEventListener("error", () => setStatus("Connection failed. Check the server URL and deployment status."));
}
function stopMovement() {
  if (moveTimer) clearInterval(moveTimer);
  moveTimer = null;
}
function startMovement() {
  stopMovement();
  moveTimer = setInterval(() => {
    const now = Date.now();
    if (now - lastMove < 55) return;
    let dx = 0, dy = 0;
    if (keys.has("arrowleft") || keys.has("a")) dx--;
    if (keys.has("arrowright") || keys.has("d")) dx++;
    if (keys.has("arrowup") || keys.has("w")) dy--;
    if (keys.has("arrowdown") || keys.has("s")) dy++;
    if (dx || dy) { send({ type: "move", dx, dy }); lastMove = now; }
  }, 55);
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
  for (const player of players) {
    ctx.fillStyle = player.id === selfId ? "#68e7f4" : "#c4f26b";
    ctx.beginPath(); ctx.arc(player.x, player.y, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#f0f4ff"; ctx.font = "11px sans-serif"; ctx.fillText(player.name.slice(0, 16), player.x, player.y - 19);
  }
  animationId = requestAnimationFrame(drawWorld);
}
$("#connect").addEventListener("click", connect);
$("#leave").addEventListener("click", () => { socket?.close(1000, "Player left"); socket = null; stopMovement(); });
$("#chat-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = $("#chat-input");
  const text = input.value.trim();
  if (text) { send({ type: "chat", text }); input.value = ""; }
});
window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key) && !layout.hidden) event.preventDefault();
  keys.add(key);
  if (key === " " && !layout.hidden) send({ type: "attack" });
});
window.addEventListener("keyup", (event) => keys.delete(event.key.toLowerCase()));
window.addEventListener("blur", () => keys.clear());
window.addEventListener("pagehide", () => { socket?.close(1000, "Page closed"); cancelAnimationFrame(animationId); stopMovement(); });
startMovement();
drawWorld();
if (!MULTIPLAYER_ENDPOINT) setStatus("Server not configured. Deploy the Worker using docs/MULTIPLAYER-SETUP.md.");
