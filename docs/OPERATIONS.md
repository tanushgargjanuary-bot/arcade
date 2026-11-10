# Operations guide

## Services

| Component | Role | Owner |
|---|---|---|
| GitHub Pages | Static client hosting | Repository owner |
| GitHub Actions | Tests and static deployment | Repository workflow |
| Cloudflare Worker | WebSocket entry point and origin validation | Project operator |
| Durable Objects | Authoritative room state and WebSocket sessions | Cloudflare |
| Browser localStorage | Solo progress | Player |

Players do not need accounts. The project operator needs a Cloudflare account to deploy the Worker.

## Deploy

From the repository root:

    cd worker
    npx wrangler login
    npx wrangler deploy

Set the deployed origin in `src/multiplayer-config.js`, then commit and push. Do not add API tokens to source files.

## Health checks

- Worker health: `GET /health`.
- Room join: WebSocket upgrade to `/room?room=...&name=...`.
- Worker origin allowlist: `ALLOWED_ORIGINS` in `worker/wrangler.toml`.
- GitHub Actions: validation must pass before Pages deploy.
- Cloudflare dashboard: inspect Worker errors, requests, Durable Object usage and plan limits.

A successful Pages deployment does not prove the multiplayer Worker is deployed or healthy.

## Release process

1. Inspect the current implementation and project knowledge base.
2. Keep changes focused.
3. Update unit and browser integration tests.
4. Run dependency audit and syntax checks.
5. Review security and cost impact.
6. Merge only after CI passes.
7. Confirm the Pages deployment.
8. Check Worker health.
9. Test two clients on independent networks.

## Failure handling

| Symptom | Action |
|---|---|
| Client says server not configured | Set `MULTIPLAYER_ENDPOINT` |
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

1. Disable the multiplayer endpoint in the static client if there is an active exploit.
2. Inspect Worker logs and Cloudflare status.
3. Identify the affected room and protocol message.
4. Fix the issue and add a regression test.
5. Deploy the Worker.
6. Publish the matching client.
7. Update the security and incident notes.

Do not claim an uptime target until monitoring and operational ownership are established.
