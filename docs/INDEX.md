# Documentation index

This directory is the project knowledge base. Read this page first.

| Document | Purpose |
|---|---|
| [Project specification](PROJECT-SPEC.md) | Product requirements and scope |
| [Architecture decisions](DECISIONS.md) | Key technical decisions and trade-offs |
| [Project history](PROJECT-HISTORY.md) | Why Arcade exists, milestones and decisions |
| [Architecture](ARCHITECTURE.md) | System components, data flow and trust boundaries |
| [Game design](GAME-DESIGN.md) | Game catalogue and rules |
| [Roadmap](ROADMAP.md) | Delivered work, priorities and future scope |
| [Testing](TESTING.md) | Test layers, commands and release gates |
| [Multiplayer setup](MULTIPLAYER-SETUP.md) | Join rooms and troubleshoot P2P connections |
| [Operations](OPERATIONS.md) | Static deployment, monitoring and recovery |
| [Security](SECURITY.md) | Threat model and known limitations |
| [Contributing](../CONTRIBUTING.md) | Change process and quality rules |

## Fast orientation

- Static game client: GitHub Pages.
- Solo progress: browser localStorage.
- Realm RPG networking: Trystero 0.25.4, public Nostr discovery relays and WebRTC.
- Multiplayer does not require a Cloudflare account, API key or dedicated Arcade server.
- The old Cloudflare Worker source remains under `worker/` as legacy reference code. The current client does not use it.
- Automated quality: Node.js tests and Playwright browser smoke tests.
- Public relay availability and WebRTC NAT traversal remain external dependencies.
