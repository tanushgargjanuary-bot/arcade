# Testing and quality gates

> **Project status: PAUSED — 10 November 2026.** The commands below describe the current local test suite. They are not evidence of a production deployment or production validation.

## Node tests

Run `npm test`.

Covers:
- Local progress storage and JSON backup validation.
- Room ID and player name validation.
- Strict multiplayer message schemas.
- Malformed and oversized payload rejection.
- Movement bounds and normalisation.
- Attack range rules.
- Catalogue and security documentation guardrails.

## Syntax checks

Run `npm run check:syntax`.

This checks JavaScript under `src/` and `worker/src/`, plus the standalone game script.

## Browser and server integration tests

Run:

    npm install
    npx playwright install chromium
    npm run test:e2e

Playwright starts a local static server and a local Wrangler Worker with Durable Objects. The multiplayer test uses two independent browser contexts. It verifies:
- both clients join the same room;
- server presence updates on both clients;
- chat is attributed by the server;
- movement is validated and synchronized by the server;
- explicit leave removes the player;
- generated room codes use cryptographic randomness and invite links restore the room;
- the health route responds;
- requests without an allowed origin are rejected;
- non-WebSocket room requests are rejected;
- spoofed state fields are rejected;
- per-player chat limits are enforced;
- the 16-player room capacity is enforced;
- random room codes and invite links work.

This is a real local Worker integration test. It does not prove Cloudflare production deployment, global edge availability, abuse resistance under load or browser behaviour on every network.

## CI

GitHub Actions runs Node tests, syntax checks, dependency audit and Playwright integration tests on pull requests and pushes to main. The Pages deployment job runs only after validation succeeds. The deploy job receives Pages write and OIDC permissions; the validation job receives read-only repository permission.

Playwright diagnostics are uploaded when a test fails and retained for seven days.

The latest validation evidence recorded before the pause is documented in [PAUSE-STATUS.md](PAUSE-STATUS.md). Re-run CI before any future release. Workflow success can change as dependencies and hosted runners change.

## Manual release checks (NOT COMPLETED)

Before public multiplayer use, test:
- two devices on separate networks;
- reconnect after Wi-Fi loss;
- reconnect after a browser sleeps and resumes;
- full-room rejection;
- rapid movement, chat and attack requests;
- spoofed state fields, malformed frames and invalid room codes;
- malformed JSON and oversized frames;
- simultaneous attacks near the boss;
- room cleanup after all players leave;
- mobile layout and keyboard controls;
- Cloudflare plan usage and Worker error rates.

## Release rule

Do not claim production-grade multiplayer because unit tests pass. Require real cross-network tests, operational monitoring and an abuse review.
