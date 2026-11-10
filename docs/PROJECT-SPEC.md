# Arcade product specification

## Product statement

Arcade is a public browser-game portal. It combines short solo games with optional real-time shared rooms. It must remain easy to open, easy to maintain and low-cost to operate.

## Users

- Visitors who want to play a short browser game without installing software.
- Returning players who want their personal solo records saved in the same browser.
- Friends who want to join the same room and play together without creating a backend account.

## Core requirements

### Lobby
- Show the catalogue.
- Support search and category filters.
- Provide a clear route to each game.
- Work at desktop and mobile viewport sizes.

### Solo play
- No account required.
- Save local personal records.
- Support JSON export and import.
- Explain that browser storage can be cleared.

### Multiplayer
- Join a room using a room code and display name.
- Discover peers through Trystero's public Nostr strategy.
- Establish WebRTC data channels where network conditions allow.
- Show connected players in a shared space.
- Support peer-to-peer room chat.
- Support one cooperative encounter with shared enemy health coordinated by a room leader.
- Validate message shapes and lengths on each client.
- Show clear connection errors when discovery or WebRTC fails.
- Do not require a user-created Cloudflare, Supabase or Firebase account.

## Quality requirements

- Every meaningful feature has automated tests.
- Pull requests run unit tests, syntax checks and browser tests.
- Multiplayer changes include security and reliability review.
- Documentation describes the actual architecture and its limits.
- No player records or credentials are committed to the repository.

## Scope boundaries

Included:
- Static game client.
- Local solo game progress.
- Room-based P2P multiplayer prototype.
- Automated checks and project documentation.

Not included in this phase:
- Trusted server authority or anti-cheat.
- Persistent multiplayer characters.
- Global matchmaking.
- Global social network.
- Voice chat.
- Payments or ranked tournaments.
- Guaranteed connection across restrictive NATs without TURN.

## Success measures

- The lobby loads and filters the catalogue.
- Solo games launch and work without a backend.
- Local progress survives page reloads and can be exported/imported.
- Two clients can discover and connect to the same room.
- Chat and shared boss health update across clients.
- CI blocks broken changes before deployment.
- A new maintainer can understand and run the project from the documentation alone.
