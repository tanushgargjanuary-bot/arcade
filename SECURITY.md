# Security policy

## Current security model

Arcade has two data models:
- Solo game records are stored in browser localStorage. Users can export and import JSON backups.
- Realm RPG uses a Cloudflare Worker and Durable Objects for temporary room presence, chat and shared boss state.

## Rules

- Never commit player data, passwords, tokens or private backup files.
- Never put Cloudflare secrets or privileged credentials in frontend code.
- Treat all browser input as untrusted.
- Treat display names as labels, not authenticated identities.
- Do not use local scores or prototype multiplayer state for prizes, payments or ranked competition.
- Review [docs/SECURITY.md](docs/SECURITY.md) before changing the multiplayer protocol.
- Report security issues privately to the repository owner. Do not publish exploit details in public issues.

## Known limits

Realm RPG has no login, identity proof, moderation or full anti-cheat. Origin checks are not authentication. Chat and player state are prototype features. See [docs/SECURITY.md](docs/SECURITY.md) for the threat model and required controls before public growth.
