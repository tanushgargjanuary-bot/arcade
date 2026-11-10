# Security model and known risks

## Protected data

- Solo player data remains in localStorage.
- Exported JSON files contain play history and should be treated as private.
- The current multiplayer client has no account credentials or API keys.
- The GitHub repository must not contain player data or private exports.

## P2P networking

- Trystero uses public Nostr relays for peer discovery and WebRTC signalling.
- Game messages are sent directly between peers over WebRTC data channels after connection.
- Room codes are public identifiers, not authentication secrets.
- Display names are not verified identities.
- Peer IDs identify temporary connections only.
- The client validates basic message shapes and lengths. Peers can still send malicious or false state.
- The room leader checks boss attack range and cooldown, but a malicious leader can falsify shared boss state.
- The project does not control public relay availability, retention or privacy policies.
- Some networks need TURN. No TURN relay is configured by default.

## Known risks

- No account authentication or persistent identity.
- No moderation, mute, block or report workflow.
- No secure inventory, XP ledger or anti-cheat.
- No robust consensus protocol for simultaneous boss attacks or leader migration.
- No server-side rate limits. Client-side limits can be bypassed.
- Public room codes can be guessed or shared.
- Public discovery infrastructure can observe metadata such as room announcements and network connection information.
- WebRTC connection failure is possible behind restrictive NATs and firewalls.
- No automated penetration test or real-world multi-network reliability test has been completed.

## Before public growth

Do not add trading, paid items, prizes or ranked competition until the project has:
- A trusted authority or verifiable state protocol.
- Authentication and authorization.
- Strong abuse controls and server-side validation.
- Chat moderation and reporting.
- Persistence and recovery.
- Load, security and network traversal tests.
- A documented operational owner for relays or TURN infrastructure.

## Reporting

Report security issues privately to the repository owner. Do not publish exploit details in public issues.
