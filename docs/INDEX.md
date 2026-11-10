# Documentation index

This directory is the project knowledge base. Read this page first.

| Document | Purpose |
|---|---|
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
- Multiplayer: Cloudflare Worker and one Durable Object per room.
- Players do not need accounts. The project operator deploys the server once.
- Server validates movement, chat, attacks and shared state.
- CI runs Node tests, syntax checks, dependency audit and real local Durable Object browser integration.
- Production multiplayer remains unavailable until the Worker URL is configured.
