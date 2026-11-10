# Arcade product specification

## Product statement

Arcade is a public browser-game portal. It combines short solo games with optional real-time shared game rooms. It must remain easy to open, easy to maintain and low-cost to operate.

## Users

- Visitors who want to play a short browser game without installing software.
- Returning players who want their personal solo records saved in the same browser.
- Friends who want to join the same multiplayer room and play together.

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
- Show connected players in shared space.
- Support server-broadcast movement and room chat.
- Support one cooperative encounter with shared enemy health.
- Reject invalid or oversized messages.
- Keep authoritative shared state on the server.
- Show clear setup or connection status if the server is unavailable.

## Quality requirements

- Every meaningful feature has automated tests.
- Pull requests run unit tests, syntax checks and browser tests.
- Multiplayer changes include security and cost review.
- Documentation describes the actual deployed state, not only the intended state.
- No player records or credentials are committed to the repository.

## Scope boundaries

Included:
- Static game client.
- Local solo game progress.
- Room-based real-time multiplayer prototype.
- Automated checks and project documentation.

Not included in this phase:
- Commercial game economy.
- Account registration.
- Persistent multiplayer characters.
- Matchmaking.
- Global social network.
- Voice chat.
- Payments or ranked tournaments.

## Success measures

- The lobby loads and filters the catalogue.
- Solo games launch and work without a backend.
- Local progress survives page reloads and can be exported/imported.
- Two clients can join the same room and see each other.
- Chat and shared boss health update across clients.
- CI blocks broken changes before deployment.
- A new maintainer can understand and run the project from the documentation alone.
