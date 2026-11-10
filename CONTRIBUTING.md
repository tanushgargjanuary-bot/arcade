# Contributing

## Project principles

- Keep the lobby and games simple to load.
- Prefer plain HTML, CSS and JavaScript unless a dependency has a clear benefit.
- Keep solo player records local by default.
- Keep player data out of Git commits.
- Treat multiplayer clients as untrusted.
- Do not claim a multiplayer feature is live until it passes a real two-client test.
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

- Validate all client messages on the server.
- Keep authoritative shared state on the server.
- Limit message size, frequency and room capacity.
- Never trust a display name as an identity.
- Do not expose secrets in frontend code.
- Add tests for invalid, oversized and rapid messages.
- Review Cloudflare usage and cost limits.

## Pull requests

Include:
- User-visible behaviour.
- Design and architecture changes.
- Tests run and their results.
- Manual test steps.
- Security and cost implications.
- Documentation updates.

A pull request must pass CI before merge.
