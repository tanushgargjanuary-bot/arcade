# Project history and intent

## Why this project exists

Arcade is a single public website for small browser games. The project aims to make games easy to discover and play without downloads. It also aims to keep the code and hosting simple enough for a small project to maintain.

## Goals

1. Keep the game lobby fast and simple.
2. Host the client as a static site on GitHub Pages.
3. Keep ordinary player progress private and local by default.
4. Support optional real-time multiplayer without requiring a project-owned backend account.
5. Make every meaningful change testable and documented.
6. Keep operating cost low. Prefer open protocols and free public infrastructure, while documenting their limits.

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

### First multiplayer architecture
- Added Realm RPG client and Cloudflare Durable Object room server.
- Added shared player presence, movement, live chat and a shared boss encounter.
- Added server-side validation and a two-client local Durable Object integration test.
- Added project history, game design, setup, architecture, testing, security and operations guides.

### Account-free P2P migration
- Selected Trystero after evaluating no-account peer-to-peer options.
- Replaced the Realm client connection path with Trystero 0.25.4 and WebRTC.
- Removed the requirement to deploy a Cloudflare Worker or configure a provider account.
- Retained the previous Worker source as legacy reference code during evaluation.
- Documented public relay, NAT traversal, host migration and trust limitations.

## Current status

Realm RPG uses Trystero's default Nostr discovery strategy and WebRTC data channels. The browser client needs no project-owned backend deployment or account. CI tests a mocked Trystero client flow. Real-world connection reliability still needs manual testing across separate networks.

## Decisions and trade-offs

- GitHub Pages remains the static client host.
- The local-first model remains the default for solo game records.
- Trystero provides account-free peer discovery and WebRTC data transport.
- Public Nostr relays remove the need to operate a signalling server, but they are external dependencies.
- One peer coordinates boss state. This is not equivalent to a trusted server.
- Room codes replace matchmaking in this phase.
- The RPG is a prototype, not a persistent MMO. No character accounts or inventory database exists.
- No user data is committed to the GitHub repository.
