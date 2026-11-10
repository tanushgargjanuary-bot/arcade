# Documentation index

This directory is the project knowledge base. Read this page first.

> **Status: PAUSED — 10 November 2026.** Read [Pause status and handover](PAUSE-STATUS.md) before making changes. The project is paused, not abandoned. The Worker is not deployed.

| Document | Purpose |
|---|---|
| [Pause status and handover](PAUSE-STATUS.md) | Current state, pause decision, known blockers and restart checklist |
| [Robustness plan](ROBUSTNESS-PLAN.md) | Staged engineering programme and completion rules |
| [Project specification](PROJECT-SPEC.md) | Product requirements and scope |
| [Architecture decisions](DECISIONS.md) | Key technical decisions and trade-offs |
| [Project history](PROJECT-HISTORY.md) | Goals, milestones and direction |
| [Architecture](ARCHITECTURE.md) | Components, data flow and trust boundaries |
| [Game design](GAME-DESIGN.md) | Game catalogue and rules |
| [Roadmap](ROADMAP.md) | Delivered work and remaining priorities |
| [Testing](TESTING.md) | Unit, browser and integration test commands |
| [Multiplayer setup](MULTIPLAYER-SETUP.md) | Worker deployment and player connection |
| [Operations](OPERATIONS.md) | Deployment, health checks and recovery |
| [Security](SECURITY.md) | Threat model and known limitations |
| [Contributing](../CONTRIBUTING.md) | Change process and quality rules |

## Fast orientation

- Static client: GitHub Pages.
- Solo progress: browser localStorage.
- Multiplayer prototype: Cloudflare Worker and one Durable Object per room.
- Players do not need accounts. The project operator must deploy the server.
- Server code validates movement, chat, attacks and shared state.
- CI runs Node tests, syntax checks, dependency audit and local Durable Object browser integration tests.
- Production multiplayer is **not available** until the Worker is deployed and the client endpoint is configured.
- No production cross-network test or production monitoring has been completed.
- Do not treat a successful GitHub Pages deployment as proof that multiplayer is operational.
