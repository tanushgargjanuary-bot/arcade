# Arcade product specification

## Product statement

Arcade is a browser-game portal. It combines short solo games with optional multiplayer rooms. It must be simple to open, low-cost to operate, privacy-conscious and maintainable.

## Core requirements

### Lobby and solo games
- Show the game catalogue with search and category filters.
- Support desktop and mobile layouts.
- Require no account.
- Save solo progress in localStorage.
- Support validated JSON export and import.

### Multiplayer
- Join a room with a display name and room code.
- Require no player account or password.
- Use a trusted server as the authority for shared state.
- Validate movement, chat, attacks, cooldowns and XP on the server.
- Bound room size, payload size and per-connection traffic.
- Recover from ordinary connection loss with bounded reconnect attempts.
- Clear temporary room state after the room becomes idle.
- Show useful connection and server errors.

## Quality requirements
- Test game rules and hostile protocol input.
- Test two independent browser clients against a local Durable Object.
- Run tests, syntax checks and dependency audit in CI.
- Deploy static files only after validation.
- Keep security and operations documentation accurate.
- Never commit secrets or player data.

## Scope boundaries

Included:
- Static client and solo games.
- Local-first player records.
- Account-free, server-authoritative multiplayer prototype.
- Automated quality and integration tests.

Not included:
- Mandatory player accounts.
- Persistent multiplayer profiles.
- Global matchmaking.
- Chat moderation and verified identities.
- Competitive rankings, payments or trading.
- MMO-scale capacity claims.

## Success measures
- Solo games work without a backend.
- Progress can be exported and restored.
- Two clients join the same room.
- Server state controls positions and boss health.
- Invalid messages do not change game state.
- Rate limits and room capacity work.
- CI exercises a real local Worker integration.
- A new maintainer can deploy and operate the project from the documentation.
