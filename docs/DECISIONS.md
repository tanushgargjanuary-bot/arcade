# Architecture decision records

## ADR-001: GitHub Pages for the game client

**Decision:** Use GitHub Pages for static files.

**Reason:** The lobby and solo games do not need a server.

**Consequence:** Multiplayer requires a separate service.

## ADR-002: Local-first solo progress

**Decision:** Keep solo progress in browser localStorage and support JSON backup import/export.

**Consequence:** Data is browser-profile-specific and can be lost when browser data is cleared.

## ADR-003: Cloudflare Durable Objects for authoritative multiplayer

**Decision:** Use one SQLite-backed Durable Object per room. Use WebSockets for live updates.

**Reason:** Shared state needs one trusted authority. Peer-hosted state lets players manipulate health, XP and positions.

**Consequence:** The project operator must deploy a Cloudflare Worker. Players do not need accounts. Cloudflare plan limits and availability apply.

## ADR-004: No mandatory player accounts

**Decision:** Use temporary server-generated connection IDs and display names.

**Reason:** Accounts add privacy, support and credential risks. The current game does not need persistent player identity.

**Consequence:** Names can be impersonated. Reconnects create new sessions. XP is temporary. Anonymous abuse and ban evasion remain possible.

## ADR-005: CI quality gates

**Decision:** Run Node tests, syntax checks, dependency audit and Playwright integration tests.

**Reason:** Source checks alone do not validate room behaviour.

**Consequence:** CI takes longer and starts a local Worker.

## ADR-006: Retire Trystero for authoritative game state

**Decision:** Remove browser-to-browser peer state from Realm RPG.

**Reason:** A peer leader is not trusted. It can falsify shared game state and is a single point of player-controlled failure.

**Consequence:** The project owns a small server deployment and its operating limits. Trystero is no longer a runtime dependency.
