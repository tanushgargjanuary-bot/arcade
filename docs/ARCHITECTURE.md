# Architecture

## System overview

    Browser
      ├── GitHub Pages: lobby, solo games, Realm RPG UI
      ├── localStorage: solo scores and play history
      └── WebSocket
             |
       Cloudflare Worker
             |
       Durable Object namespace
             |
       One object per room code
             |
       Shared player list + boss health

## Client

- index.html: lobby shell.
- app.css: lobby and solo-game styles.
- src/main.js: lobby, catalogue filters, solo game routes and backup actions.
- src/data.js: game catalogue.
- src/games.js: Snake, 2048 and Minesweeper.
- src/storage.js: local progress and JSON backup validation.
- neon-dodge.html, game.js, styles.css: standalone Neon Dodge.
- realm.html, realm.css, src/rpg-client.js: multiplayer RPG page and WebSocket client.
- src/multiplayer-config.js: public Worker URL. This is configuration, not a secret.

## Multiplayer server

- worker/src/index.js: health endpoint, WebSocket upgrade routing and room Durable Object.
- worker/src/game-rules.js: validation and deterministic game rules.
- worker/wrangler.toml: Worker name, Durable Object binding, SQLite migration and allowed browser origin.
- RealmRoom: one Durable Object per room ID. It owns live connections, player state and shared boss state.

The Worker uses the WebSocket Hibernation API. Each connected socket stores its player state in a serialized attachment. Shared enemy state is stored in Durable Object SQLite-backed storage.

## Multiplayer message contract

Client to server:
- move with dx and dy: movement request. Server clamps position and applies a fixed step.
- chat with text: server removes control characters and caps message length.
- attack: server checks range and cooldown before damaging the shared boss.
- leave: marks the player inactive, broadcasts the departure and closes the socket.

Server to client:
- welcome: assigned player ID, own player state, current players and boss.
- state: authoritative player positions and shared boss health.
- chat: accepted room message.
- system: join, leave and boss defeat notices.

## Data ownership

| Data | Location | Persistence |
|---|---|---|
| Solo game records | Browser localStorage | Until browser/site data is cleared |
| Solo backup | User-downloaded JSON | User-managed |
| Multiplayer live players | Durable Object socket attachments | Lifetime of each connection |
| Shared boss HP | Durable Object storage | Persists between connections |
| Multiplayer XP | Player socket attachment | Lost when that player disconnects |
| Chat history | Connected clients only | Not persisted |

## Trust boundaries

- The browser is untrusted. It can change local scores and send arbitrary messages.
- The Worker validates message type, size, room, name, chat, movement, attack range and cooldown.
- Player names are not authenticated identities. A player can reuse another player's display name.
- Origin checks are not user authentication and can be bypassed by non-browser clients.
- The server does not yet persist player accounts, XP or inventory.
- Do not use this prototype for prizes, payments or competitive rankings.

## Deployment boundaries

GitHub Pages deploys only the static site. The Worker must be deployed separately with Wrangler. After deployment, set the Worker URL in src/multiplayer-config.js and push the change to main.

## Scaling notes

A room is a single coordination point. Keep room size capped. Do not add high-frequency physics simulation or global chat without load tests, abuse controls and cost estimates. Use WebSocket hibernation to reduce idle duration charges.
