# Security model and known risks

## Security goals

- Keep solo player records in the user's browser by default.
- Do not require player accounts.
- Keep shared multiplayer state under server control.
- Reject malformed, oversized and unsupported messages.
- Limit room size and per-connection message rates.
- Avoid storing chat or persistent player profiles.

## Multiplayer controls

- The Worker checks the exact browser Origin against an allowlist.
- Each room has a 16-player limit.
- The server creates a temporary UUID for each connection.
- The client sends movement intent, not coordinates.
- The server calculates movement and clamps it to the world.
- The client sends attack intent, not damage or XP.
- The server checks attack range and cooldown, applies damage and awards XP.
- Chat sender identity comes from the server-side socket attachment.
- Chat length and send rate are bounded.
- JSON message types and keys use strict allowlists.
- Malformed messages are counted. Repeated invalid messages close the socket.
- Per-connection message budgets limit excessive traffic.
- Idle room boss state expires after 60 seconds with no active players.
- The client uses a heartbeat and a bounded reconnect schedule.

## Identity and access limits

No player accounts exist. This is deliberate. The server-generated ID proves only that a socket is currently connected. It does not prove a real-world identity or a returning player's identity.

Room codes are not passwords. Names can be impersonated. A user can create multiple anonymous sessions. Origin checks are not authentication and do not stop non-browser clients.

## Remaining risks

- No global IP reputation or global room-creation rate limit.
- No chat moderation, mute, block or report tools.
- No persistent bans or verified identities.
- No persistent character inventory or XP.
- No full anti-cheat for movement automation, collusion or abuse of game rules.
- No formal penetration test.
- No production load test.
- Cloudflare plan quotas and availability are external dependencies.
- A compromised Cloudflare account or Worker deployment can alter all multiplayer state.

## Before competitive or public social features

Do not add trading, paid items, prizes, ranked competition or persistent valuable inventory until the project has:
- verified player identity or an abuse-resistant alternative;
- persistent authorization and recovery;
- moderation and reporting;
- global abuse controls;
- stronger audit logs and operational alerts;
- load and security testing.

## Reporting

Report security issues privately to the repository owner. Do not publish exploit details in public issues.
