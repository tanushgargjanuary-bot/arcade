# Operations guide

## Services and dependencies

| Component | Role | Deployment / owner |
|---|---|---|
| GitHub Pages | Static lobby and games | GitHub Actions |
| Trystero | Peer discovery and WebRTC setup | External open-source library |
| Nostr relays | Public peer discovery/signalling | Third-party relay operators |
| WebRTC | Direct peer data transport | Player browsers and network paths |
| Legacy Cloudflare Worker | Previous room server | Retained in source; not used by current client |

## Release process

1. Create a focused branch from main.
2. Read the project knowledge base and inspect current implementation.
3. Update tests and documentation with the feature.
4. Open a pull request.
5. Wait for unit tests, syntax checks and browser tests.
6. Review the diff and security impact.
7. Merge to main.
8. Confirm the GitHub Pages deployment succeeds.
9. Run a real two-browser P2P smoke test after networking changes.

## Health and availability

There is no Arcade-owned multiplayer health endpoint. The browser depends on the external Trystero package CDN, public Nostr relays and WebRTC connectivity. A successful GitHub Pages deployment does not prove those dependencies are available.

## Common failures

| Symptom | Check |
|---|---|
| Trystero module fails to load | CDN availability, browser console and network access |
| Room remains empty | Both clients must use the same room code and app ID |
| Players cannot discover each other | Public relay availability, room code, browser network access |
| Peer discovered but data channel fails | NAT/firewall restrictions; test another network or configure TURN |
| Chat or state is inconsistent | Browser console, peer disconnects and room leader changes |
| Boss state resets after leader leaves | Current migration is best-effort; this is a known prototype limitation |
| Pages deploy fails | GitHub Pages source must be GitHub Actions; inspect Actions logs |

## Data recovery

Solo scores are local to each browser. Restore them with a valid JSON backup. Multiplayer room state is temporary and has no central backup or recovery process.

## Incident response

1. Disable or remove the Realm RPG entry if a serious issue affects players.
2. Check whether the CDN or public discovery relays are unavailable.
3. Reproduce the issue with two browsers and record the network conditions.
4. Fix the issue and add a regression test.
5. Update security and operations documents.

There is no project-owned relay service to restart. Do not promise a service-level uptime for third-party public relays.
