# Operations guide

## Services

| Service | Role | Deployment |
|---|---|---|
| GitHub Pages | Static lobby and games | GitHub Actions on main |
| Cloudflare Worker | WebSocket entry point and health endpoint | Wrangler manual deployment |
| Durable Objects | Room state and live WebSocket fan-out | Created by Wrangler migration |

## Release process

1. Create a focused branch from main.
2. Update tests and documentation with the feature.
3. Open a pull request.
4. Wait for unit tests, syntax checks and browser tests.
5. Review the diff and security impact.
6. Merge to main.
7. Confirm the Pages deployment succeeds.
8. Deploy Worker changes separately with Wrangler.
9. Run the two-browser multiplayer smoke test.

## Health check

The Worker exposes GET /health. It reports service availability only. It does not prove that WebSocket rooms work.

## Common failures

| Symptom | Check |
|---|---|
| Realm says server not configured | Set MULTIPLAYER_ENDPOINT and deploy Pages |
| WebSocket fails immediately | Worker URL, HTTPS/WSS protocol, allowed Origin and deployment status |
| Player joins but no other players appear | Both clients must use the same room code and Worker endpoint |
| Chat not delivered | WebSocket connection state, message rate limit and browser console |
| Boss does not take damage | Move within range, wait for cooldown and verify the Worker deployment |
| Pages deploy fails | GitHub Pages source must be GitHub Actions; inspect Actions logs |

## Data recovery

Solo scores are local to each browser. Restore them with a valid JSON backup. The project has no central backup of player records.

Boss HP is stored in Durable Object storage. Player presence and XP are currently connection-scoped. There is no account recovery process.

## Incident response

1. Disable multiplayer endpoint in the client if abuse or instability occurs.
2. Inspect Cloudflare Worker logs and usage.
3. Rotate or restrict exposed credentials. No secret should be stored in client code.
4. Preserve logs needed to understand the incident.
5. Fix the issue and add a regression test.
6. Update security and operations docs.
