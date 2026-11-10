# Arcade

A browser-game collection hosted on GitHub Pages. It includes solo arcade and puzzle games plus a room-based multiplayer RPG prototype.

**Play:** https://tanushgargjanuary-bot.github.io/arcade/

## Games

| Game | Mode | What you do |
|---|---|---|
| Neon Dodge | Solo | Dodge hazards and collect energy |
| Snake | Solo | Eat, grow and avoid your tail |
| 2048 | Solo | Merge tiles |
| Minesweeper | Solo | Clear the board without hitting a mine |
| Realm RPG | Multiplayer prototype | Join a room, move with other players, chat and fight a shared boss |

Realm RPG requires a separately deployed Cloudflare Worker. If the server URL is not configured, the page displays setup instructions. Read [Multiplayer setup](docs/MULTIPLAYER-SETUP.md).

## Player data

Solo scores and play statistics stay in the current browser's localStorage. Use **Export** to download a JSON backup. Use **Import** to restore or merge a backup. Clearing browser data can erase local progress.

Realm RPG currently uses temporary display names. It does not have accounts or persistent characters. Shared boss health is stored by the room server. Player XP and chat history are temporary.

## Technology

- Static client: HTML, CSS and JavaScript.
- Hosting: GitHub Pages.
- Solo progress: browser localStorage.
- Multiplayer: Cloudflare Workers, Durable Objects and WebSockets.
- Quality checks: Node.js tests, syntax checks and Playwright browser tests.

## Development

Requires Node.js 20+ and Python 3 for the local static server.

    npm install
    npm test
    npx playwright install chromium
    npm run test:e2e
    python -m http.server 8000

Open http://localhost:8000.

Deploy the multiplayer Worker separately. Follow [Multiplayer setup](docs/MULTIPLAYER-SETUP.md).

## Project knowledge base

Start at [docs/INDEX.md](docs/INDEX.md). It links the architecture, goals, project history, game design, roadmap, testing, multiplayer setup, operations and security documents.

## Project status

The solo games and GitHub Pages deployment are live. The Realm RPG client and server source are implemented, but multiplayer is not live until a maintainer deploys the Worker, configures the client endpoint and verifies two-player interaction.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md). Every meaningful feature must include tests, documentation and a review of security and cost impact.

## License

MIT.
