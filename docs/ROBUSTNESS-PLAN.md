# Arcade robustness engineering plan

> **Project status: PAUSED — 10 November 2026.** This is the engineering handover plan. No active implementation is implied. See [PAUSE-STATUS.md](PAUSE-STATUS.md).

## Objective

Make Arcade reliable against malformed input, connection loss, malicious clients, dependency failure, accidental data loss and unsafe releases. Robustness means verified behaviour and operational evidence. It does not mean adding complexity or claiming perfect security.

## Product constraints

- Player accounts are not required by default.
- Solo progress remains local-first.
- Multiplayer uses a small authoritative room server.
- The project should remain low-cost and disclose provider limits.
- A project operator account may be needed to deploy infrastructure. This does not create player accounts.

## Current architecture

GitHub Pages serves the static client. Cloudflare Workers routes multiplayer connections. One Durable Object owns each room. The server controls movement, chat, attack rules, boss health and temporary XP.

**Deployment state:** the Worker is in the repository and has local integration coverage. It has not been deployed to Cloudflare. `src/multiplayer-config.js` has an empty `MULTIPLAYER_ENDPOINT`. Production multiplayer is unavailable.

## Completed engineering controls

- Strict JSON message schemas and key allowlists.
- Payload size limits.
- Server-generated connection IDs.
- Server-side movement, range, cooldown and XP calculations.
- Per-connection message, movement and chat budgets.
- Room capacity limit.
- Approximate per-IP room connection limit at the Cloudflare edge.
- Origin allowlist.
- Restrictive Content Security Policy on public HTML entry points.
- Malformed-message strike limit.
- WebSocket heartbeat and bounded reconnect.
- Empty-room state cleanup.
- Cryptographically random room codes and shareable invite links.
- Node tests for hostile payloads and game rules.
- Playwright integration tests with two browser contexts, capacity overflow and a local Durable Object.
- CI dependency audit and failure artifacts.
- GitHub Actions pinned to immutable commit SHAs.
- CodeQL workflow configured; initial analysis passed.

## Phase 1 — Production readiness (NOT STARTED)

- Deploy the Worker from the project owner's Cloudflare account.
- Configure the public Worker origin in the static client.
- Test two devices on different networks.
- Verify reconnect after sleep, network change and Worker restart.
- Check usage, errors and plan quotas.

## Phase 2 — Abuse resistance (NOT STARTED)

- Add global connection and room-creation budgets.
- Add moderation, mute, block and reporting.
- Add message abuse and reconnect storm tests.
- Define a retention and incident response policy.

## Phase 3 — Recovery and integrity (NOT STARTED)

- Add explicit protocol version negotiation.
- Add event sequence numbers and stale-state rejection.
- Test concurrent attacks and reconnect races.
- Decide which player data needs persistence.
- If persistent recovery is needed, evaluate device-bound credentials or passkeys. Do not add full accounts by default.

## Phase 4 — Supply chain and release safety (PARTIAL)

- Commit a generated npm lockfile and use deterministic installs.
- [x] Pin GitHub Actions to immutable commit SHAs.
- [x] Add automated dependency update review.
- [x] Configure CodeQL static analysis workflow; initial analysis completed successfully.
- Add secret scanning.
- Add accessibility and broken-link checks.
- Require successful integration tests before deployment.

## Phase 5 — Observability and capacity (NOT STARTED)

- Add production error and availability monitoring.
- Define alert thresholds and an owner for incidents.
- Measure room size, message rates and Durable Object usage.
- Run load tests before raising room limits.
- Document provider quota exhaustion and recovery.

## Risks that remain

- Anonymous players can impersonate names and create multiple sessions.
- The per-IP edge limiter is approximate and local to each Cloudflare location. There is no strict global IP reputation or persistent ban system.
- There is no human moderation workflow.
- Temporary XP is lost on disconnect.
- Cloudflare plan limits and availability are outside the repository's control.
- Local integration tests do not prove production edge behaviour.
- No production monitoring, load test or formal penetration test has been completed.
- The npm lockfile is not committed. Transitive dependency resolution can change.

## Completion rule

A phase is complete only when code, tests, documentation and evidence exist. Do not mark a feature complete because it is planned or because a mock or local test passes.
