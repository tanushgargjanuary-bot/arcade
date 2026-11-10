# Security policy

## Security model

Arcade uses browser localStorage for solo progress. Realm RPG uses a Cloudflare Worker and Durable Objects for authoritative multiplayer state.

## Rules

- Never commit player data, passwords, tokens or private backup files.
- Never put Cloudflare API tokens in browser code.
- Treat all browser input as untrusted.
- Treat room codes as public identifiers, not passwords.
- Treat display names and temporary player IDs as unverified.
- Do not use temporary XP or peer data for prizes, payments or rankings.
- Keep server-side validation for movement, chat and combat.
- Report security issues privately to the repository owner.

## Known limits

Realm RPG has no player accounts, verified identities, persistent bans or chat moderation. The server validates game actions but cannot prove a real-world identity. Anonymous users can create multiple sessions. The Worker does not yet have global IP reputation or global room-creation limits.

See [docs/SECURITY.md](docs/SECURITY.md) for the threat model and [docs/ROBUSTNESS-PLAN.md](docs/ROBUSTNESS-PLAN.md) for planned controls.
