import { joinRoom, selfId } from "https://esm.sh/trystero@0.25.4";

const $ = (selector) => document.querySelector(selector);
const status = $("#connection-status");
const joinPanel = $("#join-panel");
const layout = $("#realm-layout");
const canvas = $("#realm-world");
const ctx = canvas.getContext("2d");
const keys = new Set();
const WORLD = { width: 760, height: 480, radius: 12, step: 18 };
const APP_ID = "tanushgarg.arcade.realm.v1";
let room = null;
let roomCode = "lobby";
let name = "";
let players = new Map();
let enemy = { id: "moss-titan", name: "Moss Titan", x: 570, y: 240, hp: 100, maxHp: 100 };
let xp = 0;
let lastMove = 0;
let lastAttack = 0;
let moveTimer = null;
let animationId = 0;
let presenceAction = null;
let chatAction = null;
let attackAction = null;
let stateAction = null;
let stateVersion = Date.now();
let peerAttackTimes = new Map();
let chatTimes = [];

function setStatus(message) { status.textContent = message; }
function addChat(playerName, message, system = false) {
  const line = document.createElement("div");
  line.className = "chat-line" + (system ? " system" : "");
  if (system) line.textContent = message;
  else {
    const label = document.createElement("strong");
    label.textContent = playerName + ": ";
    line.append(label, document.createTextNode(message));
  }
  $("#chat-log").append(line);
  $("#chat-log").scrollTop = $("#chat-log").scrollHeight;
  while ($("#chat-log").children.length > 80) $("#chat-log").firstElementChild.remove();
}
function localPlayer() {
  return { id: selfId, name, x: localX, y: localY, hp: 100, xp };
}
let localX = 120;
let localY = 180;
function hostId() {
  return [selfId, ...Object.keys(room?.getPeers?.() || {})].sort()[0];
}
function sendPresence(target) {
  if (!presenceAction) return;
  presenceAction.send(localPlayer(), target ? { target } : undefined);
}
function snapshot() {
  return {
    version: ++stateVersion,
    enemy,
    players: [...players.values()]
  };
}
function publishState(target) {
  if (room && hostId() === selfId) stateAction.send(snapshot(), target ? { target } : undefined);
}
function updateHud() {
  const list = [...players.values()].sort((a, b) => a.name.localeCompare(b.name));
  $("#realm-label").textContent = "ROOM: " + roomCode.toUpperCase();
  $("#player-count").textContent = list.length + " PLAYER" + (list.length === 1 ? "" : "S");
  $("#players-list").replaceChildren();
  for (const player of list) {
    const item = document.createElement("li");
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
function acceptPresence(player) {
  if (!player || typeof player.id !== "string" || typeof player.name !== "string") return;
  if (!Number.isFinite(player.x) || !Number.isFinite(player.y)) return;
  if (player.name.length > 16) return;
  players.set(player.id, {
    id: player.id,
    name: player.name,
    x: Math.max(WORLD.radius, Math.min(WORLD.width - WORLD.radius, player.x)),
    y: Math.max(WORLD.radius, Math.min(WORLD.height - WORLD.radius, player.y)),
    hp: 100,
    xp: Number.isFinite(player.xp) ? Math.max(0, Math.min(100000, player.xp)) : 0
  });
  updateHud();
}
function broadcastLocalPresence() {
  const player = localPlayer();
  players.set(selfId, player);
  sendPresence();
  updateHud();
}
function processAttack(attackerId) {
  if (hostId() !== selfId) return;
  const attacker = players.get(attackerId);
  if (!attacker) return;
  const now = Date.now();
  if (now - (peerAttackTimes.get(attackerId) || 0) < 650) return;
  if (Math.hypot(attacker.x - enemy.x, attacker.y - enemy.y) > 68) return;
  peerAttackTimes.set(attackerId, now);
  enemy = { ...enemy, hp: Math.max(0, enemy.hp - 10) };
  if (enemy.hp === 0) {
    if (attackerId === selfId) xp += 25;
    else {
      const player = players.get(attackerId);
      if (player) players.set(attackerId, { ...player, xp: player.xp + 25 });
    }
    addChat("Realm", attacker.name + " defeated the Moss Titan and earned 25 XP. The Titan returned.", true);
    enemy = { ...enemy, hp: enemy.maxHp };
  }
  if (attackerId === selfId) {
    const own = localPlayer();
    players.set(selfId, { ...own, xp });
  }
  publishState();
  updateHud();
}
function connect() {
  if (room) return;
  name = $("#player-name").value.trim();
  roomCode = $("#room-code").value.trim();
  if (!/^[a-zA-Z0-9_-]{3,24}$/.test(roomCode)) {
    setStatus("Room code must be 3–24 letters, numbers, underscores or hyphens.");
    return;
  }
  if (!/^[\p{L}\p{N} _-]{2,16}$/u.test(name)) {
    setStatus("Player name must be 2–16 letters or numbers.");
    return;
  }
  setStatus("Connecting to the public peer network…");
  try {
    room = joinRoom({ appId: APP_ID }, roomCode, {
      onJoinError: ({ error }) => setStatus("Peer connection failed: " + (error?.message || "network unavailable"))
    });
    presenceAction = room.makeAction("presence");
    chatAction = room.makeAction("chat");
    attackAction = room.makeAction("attack");
    stateAction = room.makeAction("state");
    players = new Map([[selfId, localPlayer()]]);

    presenceAction.onMessage = (player) => acceptPresence(player);
    chatAction.onMessage = (message) => {
      if (!message || typeof message.name !== "string" || typeof message.text !== "string") return;
      if (message.text.length > 180) return;
      addChat(message.name.slice(0, 16), message.text);
    };
    attackAction.onMessage = (_message, { peerId }) => processAttack(peerId);
    stateAction.onMessage = (state, { peerId }) => {
      if (!state || !Array.isArray(state.players) || !state.enemy) return;
      // Accept the elected host's state, or a newer snapshot during host handover.
      if (peerId !== hostId() && (!Number.isFinite(state.version) || state.version <= stateVersion)) return;
      if (Number.isFinite(state.version)) stateVersion = Math.max(stateVersion, state.version);
      if (Number.isFinite(state.enemy.hp) && Number.isFinite(state.enemy.maxHp) && state.enemy.maxHp > 0) {
        enemy = { ...enemy, hp: Math.max(0, Math.min(state.enemy.maxHp, state.enemy.hp)) };
      }
      for (const player of state.players) acceptPresence(player);
      const own = players.get(selfId);
      if (own) xp = own.xp;
      updateHud();
    };
    room.onPeerJoin = (peerId) => {
      sendPresence(peerId);
      if (hostId() === selfId) publishState(peerId);
      addChat("Realm", "A player connected.", true);
      updateHud();
    };
    room.onPeerLeave = (peerId) => {
      const departed = players.get(peerId);
      players.delete(peerId);
      peerAttackTimes.delete(peerId);
      if (departed) addChat("Realm", departed.name + " left the realm.", true);
      if (hostId() === selfId) publishState();
      updateHud();
    };
    layout.hidden = false;
    joinPanel.hidden = true;
    broadcastLocalPresence();
    setStatus("Connected to room " + roomCode + ". Waiting for other players…");
    addChat("Realm", "Connected. Move with WASD or arrows. Press Space near the Moss Titan.", true);
    startMovement();
  } catch (error) {
    room = null;
    setStatus("Could not start multiplayer: " + (error?.message || "unknown error"));
  }
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
    if (!dx && !dy) return;
    const length = Math.hypot(dx, dy);
    localX = Math.max(WORLD.radius, Math.min(WORLD.width - WORLD.radius, localX + dx / length * WORLD.step));
    localY = Math.max(WORLD.radius, Math.min(WORLD.height - WORLD.radius, localY + dy / length * WORLD.step));
    lastMove = now;
    broadcastLocalPresence();
  }, 55);
}
function leave() {
  stopMovement();
  keys.clear();
  room?.leave();
  room = null;
  presenceAction = chatAction = attackAction = stateAction = null;
  players.clear();
  layout.hidden = true;
  joinPanel.hidden = false;
  setStatus("Disconnected. You left the realm.");
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
    ctx.fillStyle = player.id === selfId ? "#68e7f4" : "#c4f26b";
    ctx.beginPath(); ctx.arc(player.x, player.y, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#f0f4ff"; ctx.font = "11px sans-serif"; ctx.fillText(player.name.slice(0, 16), player.x, player.y - 19);
  }
  animationId = requestAnimationFrame(drawWorld);
}
$("#connect").addEventListener("click", connect);
$("#leave").addEventListener("click", leave);
$("#chat-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = $("#chat-input");
  const text = input.value.trim().replace(/[\u0000-\u001f\u007f]/g, "").slice(0, 180);
  if (!text || !room) return;
  const now = Date.now();
  chatTimes = chatTimes.filter((time) => now - time < 5000);
  if (chatTimes.length >= 5) { addChat("Realm", "Chat rate limit reached. Wait a few seconds.", true); return; }
  chatTimes.push(now);
  chatAction.send({ name, text });
  addChat(name, text);
  input.value = "";
});
window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (event.target instanceof HTMLElement && ["INPUT", "TEXTAREA"].includes(event.target.tagName)) return;
  if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key) && !layout.hidden) event.preventDefault();
  keys.add(key);
  if (key === " " && room && !layout.hidden && Date.now() - lastAttack >= 650) {
    lastAttack = Date.now();
    if (hostId() === selfId) processAttack(selfId);
    else attackAction.send({ type: "attack" }, { target: hostId() });
  }
});
window.addEventListener("keyup", (event) => keys.delete(event.key.toLowerCase()));
window.addEventListener("blur", () => keys.clear());
window.addEventListener("pagehide", () => { room?.leave(); cancelAnimationFrame(animationId); stopMovement(); });
drawWorld();
setStatus("No account or dedicated game server is required. Join a room to connect through Trystero.");
