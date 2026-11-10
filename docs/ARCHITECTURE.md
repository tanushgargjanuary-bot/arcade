# Architecture

## System overview

    Browser A ── WebRTC data channel ── Browser B
         \             |             /
          \       Trystero discovery /
           └──── public Nostr relays ┘

- GitHub Pages serves the static lobby and games.
- Trystero uses public discovery relays to help peers find each other.
- WebRTC data channels carry game messages directly between peers.
- One peer is elected as room leader by sorting the connected peer IDs. It coordinates shared boss damage and publishes boss state.
- There is no Arcade-owned multiplayer server in the current client path.

## Client

- index.html: lobby shell.
- app.css: lobby and solo-game styles.
- src/main.js: lobby, catalogue filters, solo-game routes and backup actions.
- src/data.js: game catalogue.
- src/games.js: Snake, 2048 and Minesweeper.
- src/storage.js: solo progress and JSON backup validation.
- neon-dodge.html, game.js, styles.css: standalone Neon Dodge.
- realm.html, realm.css, src/rpg-client.js: Realm RPG page, peer connections and game protocol.
- src/multiplayer-config.js: documents the Trystero provider and pinned version.

## Peer discovery and transport

- Library: Trystero 0.25.4, loaded from esm.sh.
- Strategy: Trystero's default Nostr discovery strategy.
- Discovery: public Nostr relays exchange the signalling data needed to establish peers.
- Transport: WebRTC data channels. Application data is sent peer-to-peer after connection.
- Identity: Trystero peer IDs are temporary connection identifiers. They are not verified user identities.
- Configuration: the app uses a fixed public app ID and user-selected room code. No API key or user account is required.

The public discovery network is an external dependency. Its uptime, rate limits and relay policies are outside this repository's control. Some network pairs may require TURN. No TURN service is configured by default.

## Multiplayer protocol

Client to peers:
- presence: display name, current position and temporary XP.
- chat: display name and bounded text.
- attack: request for the room leader to validate and apply boss damage.

Room leader to peers:
- state: boss health and the current player snapshot.
- system messages: join, leave and boss defeat notices are rendered locally.

The room leader is selected as the lexicographically smallest connected peer ID, including the local peer ID. On leader departure, the remaining peers elect a new leader. Each peer keeps the latest observed boss snapshot so the new leader can continue from its local copy. This is best-effort migration, not a consensus protocol.

## Data ownership

| Data | Location | Persistence |
|---|---|---|
| Solo game records | Browser localStorage | Until browser/site data is cleared |
| Solo backup | User-downloaded JSON | User-managed |
| Multiplayer presence | Connected browser peers | Connection lifetime |
| Shared boss HP | Peer-local replicated state | Room lifetime; best-effort handover |
| Multiplayer XP | Peer-local player state | Lost when room closes |
| Chat history | Connected clients only | Not persisted |
| Peer discovery metadata | Public Nostr relays | Controlled by external relay operators |

## Trust boundaries and limitations

- Every browser is untrusted. A peer can send false positions, names, XP or messages.
- The elected room leader checks attack range and cooldown. A malicious leader can still alter boss state.
- There is no account authentication, moderation, mute, block or report workflow.
- A room code is a namespace, not a password. Anyone who knows it can attempt to join.
- Public relays can observe discovery metadata. Game data is sent over WebRTC peer connections, not through the discovery relay after connection.
- WebRTC direct connectivity is not guaranteed on every network. A TURN relay may be required.
- No persistent character profile, inventory or secure XP ledger exists.
- Do not use this prototype for prizes, payments or competitive rankings.

## Legacy backend

The previous Cloudflare Worker and Durable Object implementation remains under `worker/`. The current Realm client does not connect to it. It is retained for reference and regression tests while the P2P path is evaluated. Do not deploy it as a requirement for current Realm gameplay.

## Scaling notes

WebRTC mesh connections grow with the number of peers. Keep rooms small. The current prototype is designed for small friend groups, not MMO-scale rooms. Do not raise room size without testing browser CPU, connection count, relay reliability and host migration.
