# Architecture decision records

This file records decisions that affect the project's direction. Add a new entry when a later change reverses or materially extends a decision.

## ADR-001: GitHub Pages for the game client

**Decision:** Use GitHub Pages for static files.

**Reason:** The lobby and solo games do not need a server. This keeps hosting simple.

**Consequence:** The site cannot run server-side game logic. Multiplayer must use peer-to-peer networking or a separate service.

## ADR-002: Local-first solo progress

**Decision:** Keep solo progress in browser localStorage and support JSON backup import/export.

**Reason:** No account or backend is needed for personal records.

**Consequence:** Data is browser-profile-specific. It does not sync automatically and can be lost if browser data is cleared.

## ADR-003: Cloudflare Durable Objects for multiplayer rooms — superseded

**Original decision:** Use one SQLite-backed Durable Object per room and WebSockets for live updates.

**Reason at the time:** A room needs coordinated state and bidirectional updates.

**Outcome:** This required a separate Cloudflare account and Worker deployment. The user asked to avoid that setup. The previous implementation remains under `worker/` for reference and regression tests, but the current Realm client does not use it.

## ADR-004: Prototype identity instead of accounts

**Decision:** Use temporary display names for the first multiplayer prototype.

**Reason:** The first milestone tests room play and shared interaction without building an account system.

**Consequence:** Names can be impersonated. XP is temporary. Do not use it for competitive rankings or rewards.

## ADR-005: CI quality gates

**Decision:** Run Node tests, syntax checks and Playwright browser tests on pull requests and main pushes.

**Reason:** Static source checks alone do not catch navigation or rendering failures.

**Consequence:** CI takes longer and installs a browser, but catches more regressions before deployment.

## ADR-006: Trystero and WebRTC for account-free multiplayer

**Decision:** Use Trystero 0.25.4 with its default Nostr discovery strategy and WebRTC data channels.

**Reason:** It allows browsers to discover and connect to each other without requiring the project owner to create a provider account or deploy a dedicated server.

**Consequences:**
- Public Nostr relays are external dependencies. The project cannot guarantee their uptime or policies.
- WebRTC direct connections may fail on restrictive networks. TURN may be required.
- A peer coordinates shared boss state. This is not trusted server authority.
- Mesh connection cost grows with room size. Keep rooms small.
- The project must test the exact pinned Trystero version before upgrades.
