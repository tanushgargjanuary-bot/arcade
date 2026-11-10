# Arcade

Arcade is a browser-game collection hosted on GitHub Pages. It includes solo arcade and puzzle games plus an account-free multiplayer RPG.

**Play:** https://tanushgargjanuary-bot.github.io/arcade/

## Games

| Game | Mode | What you do |
|---|---|---|
| Neon Dodge | Solo | Dodge hazards and collect energy |
| Snake | Solo | Eat, grow and avoid your tail |
| 2048 | Solo | Merge tiles |
| Minesweeper | Solo | Clear the board without hitting a mine |
| Realm RPG | Multiplayer co-op | Join a room, move, chat and fight a shared boss |

## Multiplayer model

Realm RPG uses a Cloudflare Worker and one SQLite-backed Durable Object per room. The server controls player positions, chat limits, attack range, attack cooldowns, boss health and XP awards.

Players do **not** need accounts, passwords or API keys. They join with a temporary display name and room code. The project owner must deploy the Worker once and set its public URL in `src/multiplayer-config.js`. This is an infrastructure account, not a player account.

The server is authoritative for the current game rules. This is stronger than peer-hosted state, but it is not a complete anti-cheat or moderation system. Names are not verified identities. XP is temporary. Treat generated room codes as bearer invite links. Anyone with a link can join. Read [Multiplayer setup](docs/MULTIPLAYER-SETUP.md) and [Security](docs/SECURITY.md).

## Player data

Solo scores and play statistics stay in the current browser's localStorage. Use **Export** to download a JSON backup. Use **Import** to restore or merge a backup. Clearing browser data can erase local progress.

Realm RPG uses temporary server-generated connection IDs. It does not create player accounts or persistent character profiles. Player presence, chat and XP exist only while the room session is active. Boss health is stored in the Durable Object and is cleared after the room remains empty for 60 seconds.

## Technology

- Static client: HTML, CSS and JavaScript.
- Hosting: GitHub Pages.
- Solo progress: browser localStorage.
- Multiplayer: Cloudflare Workers, Durable Objects and WebSockets.
- Tests: Node.js unit tests and Playwright browser tests against a local Wrangler Durable Object.
- Dependency audit: npm audit in CI.
- Multiplayer defaults: 16 players per room and 10 movement updates per second.

## Development

Requires Node.js 20+ and Python 3.

    npm install
    npm test
    npm run check:syntax
    npx playwright install chromium
    npm run test:e2e
    python -m http.server 8000

Open http://localhost:8000. The multiplayer integration tests start a local Worker automatically.

## Project knowledge base

Start at [docs/INDEX.md](docs/INDEX.md). Read [docs/ROBUSTNESS-PLAN.md](docs/ROBUSTNESS-PLAN.md) for the staged reliability and security programme.

## Current status

The static game lobby is hosted on GitHub Pages. The multiplayer client now uses an authoritative WebSocket protocol. The Worker is implemented and covered by local Durable Object integration tests. Live multiplayer remains unavailable until the project owner deploys the Worker and sets `MULTIPLAYER_ENDPOINT`.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md). Every meaningful feature must include tests, documentation and a review of security and operational dependencies.

## License

MIT.
