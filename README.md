# Arcade

Arcade is a browser-game collection hosted on GitHub Pages. It includes solo arcade and puzzle games plus an account-free multiplayer RPG prototype.

**Play:** https://tanushgargjanuary-bot.github.io/arcade/

> **Project status: PAUSED (10 November 2026).** The static site and solo games remain available. Multiplayer is not live: the Cloudflare Worker has not been deployed and the client endpoint is empty. No active development or production-readiness claim is implied. See [Pause status](docs/PAUSE-STATUS.md).

## Games

| Game | Mode | What you do |
|---|---|---|
| Neon Dodge | Solo | Dodge hazards and collect energy |
| Snake | Solo | Eat, grow and avoid your tail |
| 2048 | Solo | Merge tiles |
| Minesweeper | Solo | Clear the board without hitting a mine |
| Realm RPG | Multiplayer prototype | Join a room, move, chat and fight a shared boss |

## Multiplayer model

Realm RPG is designed to use a Cloudflare Worker and one SQLite-backed Durable Object per room. The server controls player positions, chat attribution and limits, attack range, cooldowns, boss health and XP awards.

Players do **not** need accounts, passwords or API keys. The project operator needs a Cloudflare account to deploy the Worker. This is an infrastructure account, not a player account.

**Important:** the Worker is implemented and tested locally, but it is not deployed. `src/multiplayer-config.js` currently has an empty `MULTIPLAYER_ENDPOINT`. Realm RPG multiplayer will not connect until the operator deploys the Worker, configures the endpoint and completes real-network tests.

The server-authoritative design is stronger than peer-hosted state. It is not a complete anti-cheat or moderation system. Names are not verified identities. XP is temporary. Room codes are bearer invites: anyone with a code can join. Read [Multiplayer setup](docs/MULTIPLAYER-SETUP.md) and [Security](docs/SECURITY.md).

## Player data

Solo scores and play statistics stay in the current browser's localStorage. Use **Export** to download a JSON backup. Use **Import** to restore or merge a backup. Clearing browser data can erase local progress.

The intended Realm RPG server uses temporary connection IDs. It does not create player accounts or persistent character profiles. Player presence, chat and XP exist only while the room session is active. Boss health is stored in the Durable Object and is cleared after the room remains empty for 60 seconds.

## Technology

- Static client: HTML, CSS and JavaScript.
- Hosting: GitHub Pages.
- Solo progress: browser localStorage.
- Multiplayer prototype: Cloudflare Workers, Durable Objects and WebSockets.
- Tests: Node.js unit tests and Playwright browser tests against a local Wrangler Durable Object.
- Dependency audit: npm audit in CI.
- Multiplayer defaults: 16 players per room, 10 movement updates per second and bounded chat.

## Development

Requires Node.js 22+ and Python 3.

    npm install
    npm test
    npm run check:syntax
    npx playwright install chromium
    npm run test:e2e
    python -m http.server 8000

Open http://localhost:8000. The multiplayer integration tests start a local Worker automatically.

## Project knowledge base

Start at [docs/INDEX.md](docs/INDEX.md). Read [docs/ROBUSTNESS-PLAN.md](docs/ROBUSTNESS-PLAN.md) for the engineering programme and [docs/PAUSE-STATUS.md](docs/PAUSE-STATUS.md) for the exact handover state.

## Current status

- The static game lobby is hosted on GitHub Pages.
- Solo games do not need the multiplayer backend.
- The authoritative multiplayer Worker is implemented and covered by local Durable Object integration tests.
- The Worker is **not deployed**. The client endpoint is empty.
- Production multiplayer, cross-network validation, monitoring and several hardening tasks remain incomplete.
- Development is paused. Do not interpret this repository as production-ready multiplayer.

## Contributing

The project is paused. Do not start feature work without an explicit decision to resume. When work resumes, read [Pause status](docs/PAUSE-STATUS.md) and [CONTRIBUTING.md](CONTRIBUTING.md). Keep changes focused and update tests, security review and documentation.

## License

MIT.

<!-- CodeRabbit review trigger -->
