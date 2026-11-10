# Contributing

## Project principles

- Keep the lobby and games simple to load.
- Prefer plain HTML, CSS and JavaScript unless a dependency has a clear benefit.
- Keep solo player records local by default.
- Keep player data out of Git commits.
- Treat every multiplayer peer as untrusted.
- Do not claim multiplayer reliability until it passes real multi-network tests.
- Update the project knowledge base when behaviour, scope or architecture changes.

## Before changing code

1. Read README.md and docs/INDEX.md.
2. Read the relevant architecture and game design documents.
3. Inspect the current implementation and tests.
4. Keep the change focused.
5. Check whether the change adds hosting cost, dependencies or a new trust boundary.

## Quality gates

Run:

    npm install
    npm test
    npx playwright install chromium
    npm run test:e2e
    find src worker/src -name '*.js' -print0 | xargs -0 -n1 node --check
    node --check game.js

Also test the changed game manually. Check desktop and mobile layouts, keyboard and touch controls, browser console errors and data flows.

## Multiplayer changes

- Treat peer messages as untrusted input.
- Bound message lengths and validate message shapes.
- Do not treat a room code or peer ID as authentication.
- Document public relay and WebRTC network dependencies.
- Test leader departure and reconnection.
- Do not claim that peer-hosted state is tamper-proof.
- Review privacy implications of public discovery relays.

## Pull requests

Include:
- User-visible behaviour.
- Design and architecture changes.
- Tests run and their results.
- Manual test steps.
- Security and operational implications.
- Documentation updates.

A pull request must pass CI before merge.
