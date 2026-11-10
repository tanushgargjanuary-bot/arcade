# Robustness roadmap

## Delivered

- [x] Responsive game lobby and solo games.
- [x] Local-first solo progress with validated JSON backups.
- [x] Authoritative Cloudflare Worker and one Durable Object per room.
- [x] Server-generated temporary player IDs.
- [x] Server-side movement, attack range, cooldown and XP rules.
- [x] Strict JSON protocol and bounded message sizes.
- [x] Per-connection movement, chat and message rate limits.
- [x] Room capacity limit.
- [x] WebSocket heartbeat and bounded reconnect attempts.
- [x] Empty-room state cleanup.
- [x] Local Wrangler Durable Object browser integration test.
- [x] CI dependency audit and failure diagnostics.

## Phase 1 — Complete production configuration

- [ ] Project owner deploys the Worker.
- [ ] Configure the deployed Worker origin in `src/multiplayer-config.js`.
- [ ] Confirm the health endpoint.
- [ ] Test two real devices on different networks.
- [ ] Check Cloudflare usage and error metrics.

## Phase 2 — Abuse and moderation controls

- [ ] Add global room-creation and connection limits.
- [ ] Add a room secret or high-entropy invite token.
- [ ] Add mute, block and report controls.
- [ ] Add moderation policy and abuse response process.
- [ ] Add connection-level anomaly tests.

## Phase 3 — Recovery and data integrity

- [ ] Add protocol version negotiation and migration tests.
- [ ] Add durable room event sequence numbers.
- [ ] Add crash and reconnect tests.
- [ ] Decide which character data, if any, should persist.
- [ ] If persistence is added, use optional device-bound recovery or passkeys before requiring full accounts.

## Phase 4 — Platform hardening

- [ ] Add lockfile and deterministic dependency installation.
- [ ] Pin GitHub Actions to immutable commit SHAs.
- [ ] Add static analysis and secret scanning.
- [ ] Add automated accessibility checks.
- [ ] Add dependency update automation.
- [ ] Add production uptime and error monitoring.
- [ ] Run load tests and a focused security review.

## Explicit non-goals

- No mandatory player accounts.
- No payments, trading or prize systems.
- No competitive rankings until identity and anti-cheat are stronger.
- No MMO-scale world claim.
- No unlimited-free-hosting claim.

## Release rule

A phase is complete only when its implementation, tests, documentation and operational evidence are present. A checked box must not represent planned or unverified work.
