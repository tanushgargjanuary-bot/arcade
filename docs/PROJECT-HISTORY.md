# Project history and intent

## Why this project exists

Arcade is a single public website for small browser games. The project aims to make games easy to discover and play without downloads. It also aims to keep the code and hosting simple enough for a small project to maintain.

## Goals

1. Keep the game lobby fast and simple.
2. Host the client as a static site on GitHub Pages.
3. Keep ordinary player progress private and local by default.
4. Support optional real-time multiplayer without placing player data in Git commits.
5. Make every meaningful change testable and documented.
6. Keep operating cost low. Avoid paid services unless a real need justifies them.

## Milestones

### Foundation
- Created the Arcade repository and GitHub Pages game lobby.
- Added Neon Dodge, Snake, 2048 and Minesweeper.
- Added search, category filters and local game statistics.
- Added CI validation and GitHub Pages deployment.

### Local-first data
- Removed optional Supabase account and cloud-save code.
- Kept personal records in browser localStorage.
- Added versioned JSON export and import.
- Documented browser storage limits and score trust boundaries.

### Multiplayer and quality foundation
- Added Realm RPG client and Cloudflare Durable Object room server.
- Added shared player presence, movement, live chat and a shared boss encounter.
- Added server-side validation for room names, player names, chat length, movement bounds, room capacity and attack cooldown/range.
- Added Node unit tests and Playwright browser tests, including two-client room, movement, chat, boss-combat and disconnect coverage.
- Added project history, game design, setup, architecture, testing, security and operations guides.

## Current status

The multiplayer server source is in this repository. It is not live until a maintainer deploys the Worker and sets MULTIPLAYER_ENDPOINT in src/multiplayer-config.js. Do not describe multiplayer as publicly playable until a real deployment has been verified with two separate browser sessions.

## Decisions and trade-offs

- GitHub Pages remains the static client host. It does not run server-side game logic.
- The local-first model remains the default for solo game records.
- Cloudflare Durable Objects provide one authoritative room state and WebSocket fan-out.
- Multiplayer uses room codes rather than matchmaking in this phase.
- The RPG is a prototype, not a persistent MMO. No character accounts or inventory database exists.
- No user data is committed to the GitHub repository.
