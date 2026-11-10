# Operations guide

> **Project status: PAUSED — 10 November 2026.** No active operations or production multiplayer service is established. This guide records how to resume deployment and validation.

## Services and current state

| Component | Role | Current state |
|---|---|---|
| GitHub Pages | Static client hosting | Deployed |
| GitHub Actions | Tests and static deployment | Configured; latest recorded validation passed |
| Cloudflare Worker | WebSocket entry point and origin validation | Implemented; not deployed |
| Durable Objects | Authoritative room state and WebSocket sessions | Local integration-tested; no production deployment |
| Browser localStorage | Solo progress | Used by players |

Players do not need accounts. The project operator needs a Cloudflare account to deploy the Worker. No production multiplayer uptime or support commitment exists.

## Deploy (when the project resumes)

From the repository root:

    npm install
    npx wrangler login
    npx wrangler deploy --config worker/wrangler.toml

Set the deployed origin in `src/multiplayer-config.js`, then commit and push to `main`. Do not add API tokens to source files.

**Do not perform this deployment as part of routine maintenance while the project is paused.** The steps are recorded for a deliberate restart.

## Health checks

- Worker health: `GET /health` after deployment.
- Room join: WebSocket upgrade to `/room?room=...&name=...`.
- Worker origin allowlist: `ALLOWED_ORIGINS` in `worker/wrangler.toml`.
- GitHub Actions: validation must pass before Pages deploy.
- Cloudflare dashboard: inspect Worker errors, requests, Durable Object usage and plan limits.

A successful Pages deployment does not prove the multiplayer Worker is deployed or healthy.

## Cost and traffic controls

The current defaults are designed for small rooms:
- 16 connected players per room.
- Client movement updates are capped at 10 per second.
- Server movement acceptance is capped at approximately 11 per second.
- Chat is limited to 5 messages per player per 10 seconds.
- Total inbound messages are bounded per connection.
- Room connection attempts are limited to approximately 30 per IP per minute per Cloudflare location.
- The Durable Object uses the WebSocket Hibernation API. It has no permanent timer loop.

Cloudflare plan quotas and prices can change. Check the [official pricing and limits](https://developers.cloudflare.com/durable-objects/platform/pricing/) before deployment or increasing room size. Do not assume free-tier capacity is unlimited. A busy 16-player room can use a material share of the daily request allowance.

## Release process (when resumed)

1. Inspect the current implementation and project knowledge base.
2. Keep changes focused and use `main` as the working branch unless the owner changes this rule.
3. Update unit and browser integration tests.
4. Run dependency audit and syntax checks.
5. Review security and cost impact.
6. Require CI to pass.
7. Confirm the Pages deployment.
8. Deploy and check Worker health only when production multiplayer is intentionally enabled.
9. Test two clients on independent networks.

## Failure handling

| Symptom | Action |
|---|---|
| Client says server not configured | Set `MULTIPLAYER_ENDPOINT` after Worker deployment |
| HTTP 403 | Check exact Origin allowlist |
| HTTP 426 | Check WebSocket client and `/room` path |
| Room full | Current capacity is 16 |
| Client reconnect loop | Check Worker health, Cloudflare status and browser network |
| Player returns with zero XP | Expected; identity and XP are temporary |
| Boss state resets after room is empty | Expected after the 60-second idle cleanup |
| CI fails dependency audit | Inspect advisory, update or replace affected dependency |
| Pages deployment fails | Inspect GitHub Actions deployment logs |

## Recovery and data

Solo progress can be restored from a JSON backup. Multiplayer player XP is temporary. Boss state is stored while the room is active and removed after the idle timeout. There is no player account database or persistent character recovery.

## Incident response

If multiplayer is enabled in a future release:

1. Disable the multiplayer endpoint in the static client if there is an active exploit.
2. Inspect Worker logs and Cloudflare status.
3. Identify the affected room and protocol message.
4. Fix the issue and add a regression test.
5. Deploy the Worker.
6. Publish the matching client.
7. Update the security and incident notes.

Do not claim an uptime target until monitoring and operational ownership are established.
