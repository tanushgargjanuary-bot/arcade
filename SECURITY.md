# Security policy

## Current security model

Arcade has two data models:
- Solo game records are stored in browser localStorage. Users can export and import JSON backups.
- Realm RPG uses Trystero for public peer discovery and WebRTC for direct peer-to-peer game messages.

## Rules

- Never commit player data, passwords, tokens or private backup files.
- The current Realm client must not contain provider API keys or privileged credentials.
- Treat all browser and peer input as untrusted.
- Treat display names and peer IDs as temporary labels, not verified identities.
- Do not use local scores or peer-hosted multiplayer state for prizes, payments or ranked competition.
- Review [docs/SECURITY.md](docs/SECURITY.md) before changing the multiplayer protocol.
- Report security issues privately to the repository owner. Do not publish exploit details in public issues.

## Known limits

Realm RPG has no login, identity proof, moderation, trusted server authority or full anti-cheat. Public Nostr relays are external discovery dependencies. WebRTC direct connectivity can fail on some networks. See [docs/SECURITY.md](docs/SECURITY.md) for the threat model and required controls before public growth.
