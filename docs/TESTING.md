# Testing and quality gates

## Node unit tests

Run `npm test`.

Covers:
- Local progress storage and backup merge behaviour.
- Legacy Worker game-rule validation and boundaries.
- Source guardrails for the Realm client and project documentation.

## Browser tests

Run:

    npm install
    npx playwright install chromium
    npm run test:e2e

Playwright checks:
- Lobby rendering and category filtering.
- Solo Snake launch and return navigation.
- Realm RPG page rendering and the account-free P2P entry flow.
- The current client imports the pinned Trystero release and does not require a configured server endpoint.

The Realm browser smoke test uses a local test double for the Trystero module. It does not prove that public Nostr relays or real WebRTC connections work.

## Syntax checks

    find src worker/src -name '*.js' -print0 | xargs -0 -n1 node --check
    node --check game.js

## CI

GitHub Actions runs on pull requests and pushes to main. It installs dependencies, runs Node tests, checks JavaScript syntax, installs Chromium and runs Playwright. The Pages deployment job runs only after validation succeeds and only for non-PR events.

## Manual release checks

Before describing P2P multiplayer as reliable, test:
- Two separate browsers on the same network.
- Two browsers on different networks.
- A mobile network and a Wi-Fi network.
- Presence, movement, chat and boss health in both directions.
- Room leader departure and leader handover.
- A third player joining after the room is active.
- Public relay failure and reconnect behaviour.
- Browser console and WebRTC connection errors.
- Desktop and narrow mobile layouts.

## Test limitations

CI does not contact public Nostr relays or prove real WebRTC connectivity. The browser test mocks the Trystero API. Public relay uptime, NAT traversal, TURN fallback, high concurrency and adversarial peer behaviour require separate manual or dedicated integration testing.

The legacy Cloudflare Worker remains in the repository and its rules remain covered by Node tests. It is not used by the current Realm client.
