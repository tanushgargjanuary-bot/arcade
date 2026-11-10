# Robustness roadmap

> **Project status: PAUSED — 10 November 2026.** This roadmap is a handover record. It does not imply that planned work is active. See [PAUSE-STATUS.md](PAUSE-STATUS.md).

## Delivered

- [x] Responsive game lobby and solo games.
- [x] Local-first solo progress with validated JSON backups.
- [x] Authoritative Cloudflare Worker and one Durable Object per room implemented in the repository.
- [x] Server-generated temporary player IDs.
- [x] Server-side movement, attack range, cooldown and XP rules.
- [x] Strict JSON protocol and bounded message sizes.
- [x] Per-connection movement, chat and message rate limits.
- [x] Room capacity limit.
- [x] Approximate per-IP connection rate limit at the edge.
- [x] WebSocket heartbeat and bounded reconnect attempts.
- [x] Empty-room state cleanup.
- [x] Cryptographically random room codes and shareable invite links.
- [x] Local Wrangler Durable Object browser integration test.
- [x] CI dependency audit and failure diagnostics.
- [x] GitHub Actions pinned to immutable commit SHAs.
- [x] CodeQL workflow configured; an initial analysis completed successfully.
- [x] Project documentation updated for pause and handover.

## Phase 1 — Production configuration (NOT STARTED)

- [ ] Project owner deploys the Worker.
- [ ] Configure the deployed Worker origin in `src/multiplayer-config.js`.
- [ ] Confirm the health endpoint.
- [ ] Test two real devices on different networks.
- [ ] Check Cloudflare usage and error metrics.

## Phase 2 — Abuse and moderation controls (NOT STARTED)

- [ ] Add strict global room-creation and connection quotas. The current per-IP edge limiter is approximate and location-local.
- [ ] Add mute, block and report controls.
- [ ] Add moderation policy and abuse response process.
- [ ] Add connection-level anomaly tests.

## Phase 3 — Recovery and data integrity (NOT STARTED)

- [ ] Add protocol version negotiation and migration tests.
- [ ] Add durable room event sequence numbers.
- [ ] Add crash and reconnect tests.
- [ ] Decide which character data, if any, should persist.
- [ ] If persistence is added, evaluate optional device-bound recovery or passkeys before requiring full accounts.

## Phase 4 — Platform hardening (PARTIAL)

- [ ] Commit npm lockfile and use deterministic installs.
- [x] Pin GitHub Actions to immutable commit SHAs.
- [x] Add CodeQL static analysis workflow.
- [ ] Add secret scanning.
- [ ] Add automated accessibility checks.
- [x] Add dependency update automation.
- [ ] Add production uptime and error monitoring.
- [ ] Run load tests and a focused security review.

## Phase 5 — Production validation (NOT STARTED)

- [ ] Verify Worker deployment and production health.
- [ ] Test two devices on independent networks.
- [ ] Test reconnect after sleep, network loss and Worker restart.
- [ ] Measure room capacity and provider usage under load.
- [ ] Define incident ownership and recovery steps.
- [ ] Complete a focused security review.

## Explicit non-goals

- No mandatory player accounts.
- No payments, trading or prize systems.
- No competitive rankings until identity and anti-cheat are stronger.
- No MMO-scale world claim.
- No unlimited-free-hosting claim.

## Release rule

A phase is complete only when its implementation, tests, documentation and operational evidence are present. A checked box must not represent planned or unverified work. Local integration tests do not count as production deployment or cross-network validation.
