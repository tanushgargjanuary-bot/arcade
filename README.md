# Arcade

A browser-game collection hosted on GitHub Pages. It includes solo arcade and puzzle games plus a peer-to-peer multiplayer RPG prototype.

**Play:** https://tanushgargjanuary-bot.github.io/arcade/

## Games

| Game | Mode | What you do |
|---|---|---|
| Neon Dodge | Solo | Dodge hazards and collect energy |
| Snake | Solo | Eat, grow and avoid your tail |
| 2048 | Solo | Merge tiles |
| Minesweeper | Solo | Clear the board without hitting a mine |
| Realm RPG | Peer-to-peer multiplayer | Join a room, move with other players, chat and fight a shared boss |

## Multiplayer

Realm RPG uses [Trystero](https://github.com/dmotz/trystero) and WebRTC. It uses public peer-discovery infrastructure. You do not need to create a Cloudflare, Supabase or Firebase account. You do not need to deploy a dedicated game server or enter an API key.

Players enter the same room code. Trystero discovers peers through its public Nostr strategy. After discovery, game messages travel directly between peers. The room leader coordinates shared boss damage. This is a prototype, not a secure authoritative game server.

**Limitations:** Public discovery services can be unavailable. Some network combinations need a TURN relay and may fail without one. Room codes are public, player names are not verified, and clients can manipulate game state. There are no persistent characters, accounts, global matchmaking or moderation tools.

See [Multiplayer setup](docs/MULTIPLAYER-SETUP.md) for connection details and troubleshooting.

## Player data

Solo scores and play statistics stay in the current browser's localStorage. Use **Export** to download a JSON backup. Use **Import** to restore or merge a backup. Clearing browser data can erase local progress.

Realm RPG does not create accounts or store persistent player profiles. Room presence, chat and game state are temporary. Peer discovery uses public relays, which may observe connection metadata and room discovery activity. Do not share personal information.

## Technology

- Static client: HTML, CSS and JavaScript.
- Hosting: GitHub Pages.
- Solo progress: browser localStorage.
- Multiplayer: Trystero and WebRTC, with public peer discovery.
- Quality checks: Node.js tests, syntax checks and Playwright browser tests.
- Legacy backend: the previous Cloudflare Worker implementation remains in `worker/` for reference and regression tests. The current Realm client does not use it.

## Development

Requires Node.js 20+ and Python 3 for the local static server.

    npm install
    npm test
    npx playwright install chromium
    npm run test:e2e
    python -m http.server 8000

Open http://localhost:8000.

## Project knowledge base

Start at [docs/INDEX.md](docs/INDEX.md). It links the architecture, goals, project history, game design, roadmap, testing, multiplayer setup, operations and security documents.

## Project status

The solo games and GitHub Pages deployment are live. Realm RPG now uses Trystero P2P discovery and WebRTC. The browser client no longer needs a project-owned multiplayer server. Real-world connectivity still depends on public discovery relays, browser WebRTC support and network NAT/firewall conditions. CI tests the client integration and local game rules; a live multi-network test is still required before calling connectivity production-ready.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md). Every meaningful feature must include tests, documentation and a review of security and operational dependencies.

## License

MIT.
