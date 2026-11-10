# Documentation index

This directory is the project knowledge base. Read this page first.

| Document | Purpose |
|---|---|
| [Project history](PROJECT-HISTORY.md) | Why Arcade exists, milestones and decisions |
| [Architecture](ARCHITECTURE.md) | System components, data flow and boundaries |
| [Game design](GAME-DESIGN.md) | Game catalogue and rules |
| [Roadmap](ROADMAP.md) | Delivered work, priorities and future scope |
| [Testing](TESTING.md) | Test layers, commands and release gates |
| [Multiplayer setup](MULTIPLAYER-SETUP.md) | Deploy the Cloudflare room server |
| [Operations](OPERATIONS.md) | Deployment, monitoring and recovery |
| [Security](SECURITY.md) | Threat model and known limitations |
| [Contributing](../CONTRIBUTING.md) | Change process and quality rules |

## Fast orientation

- Static game client: GitHub Pages.
- Real-time RPG server: Cloudflare Worker + SQLite-backed Durable Object.
- Local progress: browser localStorage with JSON backup.
- Automated quality: Node.js tests and Playwright browser tests.
- Multiplayer source is included but requires a Cloudflare deployment and endpoint configuration before live play works.
