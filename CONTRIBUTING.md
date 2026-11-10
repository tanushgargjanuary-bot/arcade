# Contributing

## Project principles

- Keep the lobby and solo games simple.
- Keep solo progress local by default.
- Do not require player accounts unless a feature has a clear identity requirement.
- Treat all client input as untrusted.
- Keep shared multiplayer state on the server.
- Do not claim production reliability without production evidence.
- Update tests and project docs with behaviour changes.

## Before changing code

1. Read README.md and docs/INDEX.md.
2. Read docs/ROBUSTNESS-PLAN.md.
3. Inspect current code and tests.
4. Keep changes focused.
5. Identify new dependencies, hosting costs and trust boundaries.

## Required checks

    npm install
    npm test
    npm run check:syntax
    npx playwright install chromium
    npm run test:e2e

The browser suite starts a local static server and Wrangler Worker. It tests two browser clients against the local Durable Object.

## Multiplayer rules

- Validate every client message on the server.
- Never accept client-supplied coordinates, damage, XP or player IDs.
- Bound payload sizes and message rates.
- Use room capacity limits.
- Do not treat Origin checks as authentication.
- Do not treat room codes as passwords.
- Test disconnects, reconnects, malformed frames and concurrent actions.
- Document any provider quota or operating cost.

## Pull requests

Include:
- User-visible behaviour.
- Architecture changes.
- Tests run and results.
- Manual test steps.
- Security and operational impact.
- Documentation updates.

CI must pass before merge.
