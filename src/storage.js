const KEY = "arcade.player.v1";
const FORMAT = "arcade-progress";
const VERSION = 1;
const blank = () => ({ games: {}, recent: [], totalSeconds: 0, neonDodgeBest: 0 });

function validNumber(value) {
  return Number.isSafeInteger(value) && value >= 0;
}

function cleanGame(value) {
  if (!value || typeof value !== "object") throw new Error("Backup contains an invalid game record.");
  const best = Number(value.best) || 0;
  const plays = Number(value.plays) || 0;
  const totalSeconds = Number(value.totalSeconds) || 0;
  if (![best, plays, totalSeconds].every(validNumber)) throw new Error("Backup contains invalid score or time values.");
  return { best, plays, totalSeconds };
}

function cleanData(value) {
  if (!value || typeof value !== "object" || Array.isArray(value) ||
      !value.games || typeof value.games !== "object" || Array.isArray(value.games)) {
    throw new Error("This file is not a valid Arcade progress backup.");
  }
  const games = {};
  for (const [id, record] of Object.entries(value.games)) {
    if (!/^[a-z0-9-]{1,40}$/.test(id)) throw new Error("Backup contains an invalid game ID.");
    games[id] = cleanGame(record);
  }
  const totalSeconds = Number(value.totalSeconds) || 0;
  const neonDodgeBest = Number(value.neonDodgeBest) || 0;
  if (!validNumber(totalSeconds) || !validNumber(neonDodgeBest)) throw new Error("Backup contains invalid score or time values.");
  return { games, recent: Array.isArray(value.recent) ? value.recent.filter((id) => typeof id === "string" && /^[a-z0-9-]{1,40}$/.test(id)).slice(0, 8) : [], totalSeconds, neonDodgeBest };
}

export function readLocal() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "{}");
    const data = cleanData({ ...blank(), ...parsed });
    const standaloneBest = Number(localStorage.getItem("neon-dodge-best")) || 0;
    if (validNumber(standaloneBest)) data.neonDodgeBest = Math.max(data.neonDodgeBest, standaloneBest);
    return data;
  } catch {
    return blank();
  }
}

function write(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
    localStorage.setItem("neon-dodge-best", String(data.neonDodgeBest || 0));
  } catch {
    throw new Error("The browser could not save your progress. Check available site storage.");
  }
}

export function recordRun(id, score, seconds) {
  if (!/^[a-z0-9-]{1,40}$/.test(id)) throw new Error("Invalid game ID.");
  const data = readLocal();
  const previous = data.games[id] || { best: 0, plays: 0, totalSeconds: 0 };
  const safeScore = Number.isFinite(score) ? Math.max(0, Math.floor(score)) : 0;
  const safeSeconds = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  data.games[id] = { best: Math.max(previous.best, safeScore), plays: previous.plays + 1, totalSeconds: previous.totalSeconds + safeSeconds };
  data.totalSeconds += safeSeconds;
  data.recent = [id, ...data.recent.filter((item) => item !== id)].slice(0, 8);
  write(data);
  return data;
}

export function stats(data = readLocal()) {
  const games = Object.values(data.games);
  return {
    played: games.reduce((sum, game) => sum + game.plays, 0),
    best: Math.max(data.neonDodgeBest || 0, games.reduce((max, game) => Math.max(max, game.best), 0)),
    seconds: data.totalSeconds || 0
  };
}

export function timeLabel(seconds) {
  return seconds < 60 ? "0m" : seconds < 3600 ? Math.floor(seconds / 60) + "m" :
    Math.floor(seconds / 3600) + "h " + Math.floor(seconds % 3600 / 60) + "m";
}

export function exportData() {
  return { format: FORMAT, version: VERSION, exportedAt: new Date().toISOString(), data: readLocal() };
}

export function importData(payload) {
  if (!payload || payload.format !== FORMAT || payload.version !== VERSION) {
    throw new Error("Unsupported backup format or version.");
  }
  const incoming = cleanData(payload.data);
  const current = readLocal();
  const games = { ...current.games };
  for (const [id, record] of Object.entries(incoming.games)) {
    const old = games[id] || { best: 0, plays: 0, totalSeconds: 0 };
    games[id] = {
      best: Math.max(old.best, record.best),
      plays: Math.max(old.plays, record.plays),
      totalSeconds: Math.max(old.totalSeconds, record.totalSeconds)
    };
  }
  const totalSeconds = Math.max(current.totalSeconds, incoming.totalSeconds,
    Object.values(games).reduce((sum, game) => sum + game.totalSeconds, 0));
  const recent = [...incoming.recent, ...current.recent].filter((id, index, all) => all.indexOf(id) === index).slice(0, 8);
  const merged = { games, recent, totalSeconds, neonDodgeBest: Math.max(current.neonDodgeBest || 0, incoming.neonDodgeBest || 0) };
  write(merged);
  return merged;
}
