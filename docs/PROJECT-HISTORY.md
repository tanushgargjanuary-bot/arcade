# Project history and intent

## Why Arcade exists

Arcade is a single website for browser games. The project aims to make games easy to find and play without downloads. It should remain low-cost, maintainable and privacy-conscious.

## Goals

1. Keep the game lobby fast and simple.
2. Host static files on GitHub Pages.
3. Keep solo progress local by default.
4. Support multiplayer without player accounts.
5. Use server authority for shared game state.
6. Test meaningful behaviour, not only source patterns.
7. Document real operating costs and security limits.

## Milestones

### Foundation
- Created the Arcade repository and GitHub Pages lobby.
- Added Neon Dodge, Snake, 2048 and Minesweeper.
- Added search, category filters and local game statistics.
- Added CI validation and GitHub Pages deployment.

### Local-first data
- Removed cloud account flow for solo progress.
- Kept personal records in localStorage.
- Added versioned JSON export and import.

### First multiplayer architecture
- Added Realm RPG and a Cloudflare Durable Object server.
- Added server-side player movement, chat, boss combat and XP.
- Added local Worker integration tests.

### Account-free peer networking experiment
- Replaced the Worker client with Trystero and WebRTC.
- Found that peer-hosted shared state allowed players to falsify positions, XP and boss state.
- The P2P implementation was a useful experiment but did not meet the project's robustness goal.

### Return to server authority
- Reconnected Realm RPG to a Cloudflare Worker and Durable Objects.
- Made the server authoritative for player state and game rules.
- Added strict message schemas, payload bounds, rate limits and idle room cleanup.
- Added two-browser integration tests against a local Durable Object.
- Added dependency audit and CI failure diagnostics.
- Kept player accounts out of scope.

## Current status

The code now uses the authoritative Worker protocol. The project owner must deploy the Worker and set its public URL before live multiplayer works. CI tests the Worker locally with two browser clients. Real multi-network production testing remains required.

## Direction

The project should prefer the simplest architecture that provides real integrity. Player accounts are not a default requirement. Add identity only when a feature needs persistent ownership, moderation or abuse prevention that anonymous sessions cannot provide.
