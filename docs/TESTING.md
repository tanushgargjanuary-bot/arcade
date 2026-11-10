# Testing and quality gates

## Node unit tests

Run npm test.

Covers:
- Local progress storage and backup merge behaviour.
- Room ID and player name validation.
- Chat sanitization and message length.
- Movement normalization and world boundaries.
- Attack range and cooldown.
- Multiplayer source guardrails and documentation presence.

## Browser tests

Run:

    npm install
    npx playwright install chromium
    npm run test:e2e

Playwright starts a local static server and a local Wrangler Worker. It checks:
- Lobby rendering and category filtering.
- Solo Snake launch and return navigation.
- Realm RPG configuration warning and graceful no-server state.
- Two separate browser contexts joining one real local Durable Object room, sharing presence, movement and chat.

## Syntax checks

    find src worker/src -name '*.js' -print0 | xargs -0 -n1 node --check
    node --check game.js

## CI

GitHub Actions runs on pull requests and pushes to main. It installs dependencies, runs Node tests, checks JavaScript syntax, installs Chromium, and runs Playwright. The Pages deployment job runs only after validation succeeds and only for non-PR events.

## Manual release checks

Before release, test:
- Desktop and narrow mobile viewport.
- Keyboard and touch controls for each game.
- Browser console and network errors.
- Export and import of local progress.
- Worker health endpoint.
- Two different browser sessions joining one room.
- Player movement and position updates.
- Chat in both directions.
- Boss damage and XP award.
- Room capacity and invalid room/name rejection.
- Disconnect and reconnect behaviour.

## Test limitations

The current automated browser suite tests the static client. It does not start a Cloudflare Durable Object runtime. Server rule tests run in Node, but WebSocket lifecycle, hibernation, storage migration and concurrent room behaviour still need Cloudflare integration tests.
