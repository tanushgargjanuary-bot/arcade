# Architecture

## System overview

    Browser ── HTTPS ── GitHub Pages (static client)
       |
       └──── WSS ───── Cloudflare Worker
                           |
                           └── Durable Object per room
                                  ├── WebSocket sessions
                                  ├── authoritative player state
                                  ├── movement and combat rules
                                  └── SQLite-backed boss state

## Components

- GitHub Pages serves the lobby and game files.
- `src/rpg-client.js` handles the Realm interface and WebSocket lifecycle.
- `src/multiplayer-config.js` contains the public Worker origin. It is not a secret.
- Cloudflare Worker validates the browser origin, room code, display name and WebSocket upgrade.
- One Durable Object owns each room. It validates messages and controls all shared game state.
- Durable Object SQLite storage keeps the boss state while a room is active.
- The room alarm deletes the boss state after 60 seconds with no active players.
- Movement updates are capped at 10 Hz on the client and approximately 11 Hz on the server to control request volume.

## Multiplayer trust model

The browser is an untrusted client. It sends only intent:
- move direction;
- chat text;
- attack request;
- ping or leave.

The server decides:
- player identity for the current connection;
- player position and movement speed;
- chat sender name and chat rate;
- attack cooldown and attack range;
- boss damage, boss defeat and XP award;
- room capacity and current player list.

The browser cannot submit its own coordinates, damage amount, XP, boss health or player ID. The server derives these values from the active WebSocket attachment and server rules.

## Protocol

Client messages are small JSON objects with strict key allowlists:
- `{ "type": "move", "dx": 1, "dy": 0 }`
- `{ "type": "attack" }`
- `{ "type": "chat", "text": "Hello" }`
- `{ "type": "ping" }`
- `{ "type": "leave" }`

The server rejects unknown fields, unknown message types, invalid numeric values, oversized frames and malformed JSON. It applies per-connection message, movement, chat and attack limits.

Server messages:
- `welcome`: protocol version, assigned temporary player ID, initial player list and boss state.
- `state`: authoritative player list and boss state.
- `chat`: server-attributed sender and validated text.
- `system`: server-generated room event.
- `pong`: heartbeat response.
- `error`: bounded error code and message.

## Data ownership and retention

| Data | Location | Retention |
|---|---|---|
| Solo scores | Browser localStorage | Until browser data is cleared |
| Solo backup | User-managed JSON file | User-controlled |
| Player name and position | Durable Object WebSocket attachment | Connection lifetime |
| Player XP | WebSocket attachment | Connection lifetime |
| Chat | Connected clients | Not stored by the server |
| Boss health | Durable Object storage | Until room is empty for 60 seconds |
| Connection identity | Server-generated UUID | Connection lifetime |

No player account or persistent profile exists. A reconnect creates a new temporary player identity and starts with zero XP.

## Limits and trust boundaries

- Origin checks stop ordinary cross-site browser connections. They are not user authentication.
- Random room codes are high-entropy invite identifiers, not verified user identities. Anyone with the invite can join. Treat them as shareable bearer links.
- Display names can be impersonated.
- The server is authoritative for the implemented game rules, but it does not provide a general anti-cheat system.
- The Worker limits room size and per-connection traffic. A Cloudflare Rate Limiting binding also applies an approximate per-IP connection limit in each edge location. It is not a strict global quota.
- Cloudflare availability and plan quotas are external dependencies.
- The project owner must deploy the Worker. Players do not need Cloudflare accounts.
- Do not use temporary XP or this prototype for prizes, payments or ranked competition.

## Failure handling

- The client uses a heartbeat and bounded exponential reconnect attempts.
- A reconnect creates a new temporary player session.
- A failed server connection does not block solo games.
- A room with no active players is cleaned up by a Durable Object alarm.
- The client rejects unsupported protocol versions rather than silently applying unknown state.

## Scaling

Each room is a single Durable Object. This gives clear state ownership and serial room logic. It also creates a per-room execution and capacity boundary. Keep rooms small and measure real usage before raising the 16-player limit.

## Legacy P2P implementation

The Trystero client was replaced by the authoritative Worker path. The project no longer uses public Nostr relays or browser-to-browser WebRTC for Realm game state. Any old references to Trystero are historical only.
