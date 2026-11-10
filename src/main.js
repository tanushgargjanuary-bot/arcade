import { GAMES } from "./data.js";
import { readLocal, recordRun, stats, timeLabel, importData, exportData } from "./storage.js";
import { mountGame } from "./games.js";

const $ = (selector) => document.querySelector(selector);
const app = $("#app");
let cleanup = null;
let filter = "all";
let search = "";

function home() {
  if (cleanup) { cleanup(); cleanup = null; }
  app.innerHTML = `
    <section class="hero"><div><p class="eyebrow">YOUR NEXT DISTRACTION</p><h1>Play something.<br><span>Anything.</span></h1><p>A growing collection of small games. No installs. No nonsense. Just play.</p><a class="button primary" href="#library">Explore games ↘</a></div><div class="hero-art"><div class="art-core">✳</div></div></section>
    <section class="quick-stats"><div><span class="stat-kicker">GAMES PLAYED</span><strong id="played">00</strong></div><div><span class="stat-kicker">BEST SCORE</span><strong id="best">00000</strong></div><div><span class="stat-kicker">PLAY TIME</span><strong id="time">0m</strong></div><div class="stats-note" id="stats-note">Saved on this device.</div></section>
    <section id="library" class="library"><div class="section-head"><div><p class="eyebrow">THE COLLECTION / 001</p><h2>Pick your game.</h2></div><input id="search" class="search" type="search" placeholder="Find a game…" aria-label="Find a game"></div>
    <div class="filters"><button class="filter active" data-filter="all">All games</button><button class="filter" data-filter="arcade">Arcade</button><button class="filter" data-filter="puzzle">Puzzle</button><button class="filter" data-filter="strategy">Strategy</button></div><div id="grid" class="grid"></div></section>
    <section id="profile" class="profile"><div><p class="eyebrow">PLAYER PROFILE</p><h2>Playing as Guest.</h2><p>Your progress is stored in this browser. Export a backup or import it on another device.</p></div><div class="profile-actions"><button id="profile-export" class="button">Export backup ↓</button><button id="profile-import" class="button">Import backup ↑</button></div></section>`;
  const s = stats();
  $("#played").textContent = String(s.played).padStart(2, "0");
  $("#best").textContent = String(s.best).padStart(5, "0");
  $("#time").textContent = timeLabel(s.seconds);
  $("#stats-note").textContent = "Saved on this device. Export a backup to move it.";
  $("#search").value = search;
  $("#search").oninput = (event) => { search = event.target.value.toLowerCase(); cards(); };
  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.onclick = () => {
      filter = button.dataset.filter;
      document.querySelectorAll("[data-filter]").forEach((item) => item.classList.toggle("active", item === button));
      cards();
    };
  });
  $("#profile-export").onclick = exportBackup;
  $("#profile-import").onclick = () => $("#import-file").click();
  cards();
}

function cards() {
  const list = GAMES.filter((game) => (filter === "all" || game.category === filter) &&
    (game.name + " " + game.description).toLowerCase().includes(search));
  const data = readLocal();
  $("#grid").innerHTML = list.length ? list.map((game) => `
    <article class="card" data-id="${game.id}"><div class="card-art">${game.symbol}</div><div class="card-info">
    <div class="meta"><span>${game.category.toUpperCase()}</span><span>${game.tag}</span></div><h3>${game.name}</h3><p>${game.description}</p>
    <div class="card-bottom"><span class="best">BEST ${String(data.games[game.id]?.best || 0).padStart(5, "0")}</span><button class="play" data-play="${game.id}">PLAY ↗</button></div></div></article>`).join("") :
    '<div class="empty">No games match that search.</div>';
  document.querySelectorAll("[data-play]").forEach((button) => {
    button.onclick = () => openGame(button.dataset.play);
  });
}

function openGame(id) {
  if (id === "neon-dodge") { location.href = "./neon-dodge.html"; return; }
  location.hash = "/game/" + id;
}

function gamePage(id) {
  const game = GAMES.find((item) => item.id === id);
  if (!game) { location.hash = "/"; return; }
  app.innerHTML = `<section class="game-screen"><div class="game-top"><div><p class="eyebrow">ARCADE / ${game.category.toUpperCase()}</p><h1>${game.name}</h1><p>${game.description}</p></div><button id="back" class="button quiet">← BACK TO LOBBY</button></div>
  <div class="board"><div class="toolbar"><span>PLAYER: GUEST</span><span>BEST: ${readLocal().games[id]?.best || 0}</span></div><div id="game-area" class="game-area"></div><p class="help">Use keyboard or touch controls where available. Records update when a run ends.</p></div></section>`;
  $("#back").onclick = () => { location.hash = "/"; };
  const started = Date.now();
  cleanup = mountGame(id, $("#game-area"), (result) => {
    recordRun(id, result.score, Math.floor((Date.now() - started) / 1000));
  });
}

function route() {
  const match = location.hash.match(/^#\/game\/([a-z0-9-]+)$/);
  if (cleanup) { cleanup(); cleanup = null; }
  if (match) gamePage(match[1]); else home();
}

function exportBackup() {
  const blob = new Blob([JSON.stringify(exportData(), null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "arcade-progress-backup.json";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function importBackup(event) {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (!file) return;
  if (file.size > 1024 * 1024) { alert("Backup is too large. Select a file under 1 MB."); return; }
  try {
    const payload = JSON.parse(await file.text());
    if (!confirm("Import this backup? Existing records will be kept when they are higher.")) return;
    importData(payload);
    home();
    alert("Progress imported. Your records are now available in this browser.");
  } catch (error) {
    alert(error.message || "This backup file is not valid.");
  }
}

$("#export-button").onclick = exportBackup;
$("#import-button").onclick = () => $("#import-file").click();
$("#import-file").addEventListener("change", importBackup);
window.addEventListener("hashchange", route);
home();
route();
