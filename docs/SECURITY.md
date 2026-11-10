# Security model and known risks

## Protected data

- Solo player data remains in localStorage.
- Exported JSON files contain play history and should be treated as private.
- The Worker has no user password or API secret in the browser.
- The GitHub repository must not contain player data or private exports.

## Multiplayer controls

- Allowed browser origins are checked before room access.
- Room IDs and display names use strict character and length rules.
- Chat text is stripped of control characters and capped at 180 characters.
- WebSocket payloads are capped at 2 KB.
- Each room has a 20-connection limit.
- Movement is bounded to the world and throttled.
- Attacks require proximity and a cooldown.
- Chat is rate-limited per connection.
- Chat is rendered with text nodes, not HTML.

## Known risks

- There is no authentication. Display names can be impersonated.
- Origin checks are not authentication. Non-browser clients can forge Origin headers.
- There is no moderation, mute, block or report workflow.
- There is no persistent identity, inventory or secure XP account.
- Client-side game visuals can be modified. The server owns shared boss HP, but this prototype is not a full anti-cheat system.
- Denial-of-service protection is limited to basic message and connection limits.
- Room state is ephemeral except for boss HP.
- No automated penetration test has been run.

## Before public growth

Do not add trading, paid items, prizes or ranked competition until the project has:
- A real authentication system.
- Per-account authorization and session lifecycle.
- Stronger rate limits and abuse controls.
- Chat moderation and reporting.
- Server-side persistence and recovery.
- Load and security testing.
- A cost and abuse monitoring plan.

## Reporting

Report security issues privately to the repository owner. Do not publish exploit details in public issues.
