# Roadmap

## Delivered
- [x] Responsive game lobby, search and category filters.
- [x] Neon Dodge, Snake, 2048 and Minesweeper.
- [x] Local player statistics and versioned JSON backups.
- [x] GitHub Pages deployment workflow.
- [x] Realm RPG client and Cloudflare Durable Object WebSocket server source.
- [x] Shared player presence, movement, room chat and cooperative boss combat.
- [x] Room/name/chat validation, bounded movement, attack range/cooldown and room capacity.
- [x] Node unit tests and Playwright browser tests.
- [x] Project history, game design, testing, multiplayer setup, operations and security documentation.

## Required before multiplayer is live
- [ ] Create or use a Cloudflare account.
- [ ] Deploy worker/ with Wrangler.
- [ ] Set the deployed Worker URL in src/multiplayer-config.js.
- [ ] Deploy the updated static site to GitHub Pages.
- [ ] Test two separate browsers joining the same room.
- [ ] Verify movement, chat, boss damage, disconnect and reconnect behaviour.

## Next engineering priorities

1. Add Durable Object integration tests with the Cloudflare test runtime.
2. Add reconnection handling and clean player lifecycle behaviour.
3. Add mobile virtual controls and accessibility.
4. Add persistent player identity only after choosing an authentication model.
5. Add moderation, abuse reporting and rate limits before scaling public chat.
6. Add load tests and cost monitoring before increasing room capacity.
7. Add inventory, quests, equipment, progression and more co-op encounters.

## Explicit non-goals for this phase

- No MMO-scale world.
- No accounts or password storage.
- No global matchmaking.
- No player-to-player trading.
- No voice chat.
- No ranked or prize-based competition.
- No promise of unlimited free backend usage.

## Release rule

A multiplayer feature is not live because source code exists. It is live only after the Worker and Pages client are deployed and a two-client smoke test passes.
