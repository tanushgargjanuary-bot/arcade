# Architecture decision records

This file records decisions that affect the project's direction. Add a new entry when a later change reverses or materially extends a decision.

## ADR-001: GitHub Pages for the game client

**Decision:** Use GitHub Pages for static files.

**Reason:** The lobby and solo games do not need a server. This keeps hosting simple.

**Consequence:** Real-time multiplayer requires a separate server. GitHub Pages cannot host WebSocket room logic.

## ADR-002: Local-first solo progress

**Decision:** Keep solo progress in browser localStorage and support JSON backup import/export.

**Reason:** No account or backend is needed for personal records.

**Consequence:** Data is browser-profile-specific. It does not sync automatically and can be lost if browser data is cleared.

## ADR-003: Cloudflare Durable Objects for multiplayer rooms

**Decision:** Use one SQLite-backed Durable Object per room and WebSockets for live updates.

**Reason:** A room needs one coordinated state owner and bidirectional updates. Durable Objects support this model and are available on the Workers Free plan with limits.

**Consequence:** The Worker needs a separate deployment. Usage is quota-bound. The client remains disabled until its endpoint is configured.

## ADR-004: Prototype identity instead of accounts

**Decision:** Use temporary display names for the first multiplayer prototype.

**Reason:** The first milestone tests room play and shared interaction without building an account system.

**Consequence:** Names can be impersonated. XP is temporary. Do not use it for competitive rankings or rewards.

## ADR-005: CI quality gates

**Decision:** Run Node tests, syntax checks and Playwright browser tests on pull requests and main pushes.

**Reason:** Static source checks alone do not catch navigation or rendering failures.

**Consequence:** CI takes longer and installs a browser, but catches more regressions before deployment.
