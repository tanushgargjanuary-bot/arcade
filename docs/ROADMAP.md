# Roadmap

## Delivered

- [x] Responsive game lobby, search and category filters.
- [x] Neon Dodge, Snake, 2048 and Minesweeper.
- [x] Local player statistics and versioned JSON backups.
- [x] GitHub Pages deployment workflow.
- [x] Realm RPG client with Trystero 0.25.4 and WebRTC peer networking.
- [x] Account-free room discovery through the default public Nostr strategy.
- [x] Peer presence, movement, room chat and room-leader-coordinated boss combat in the client.
- [x] Project history, game design, setup, architecture, testing, operations and security documentation.

## Required before calling P2P multiplayer reliable

- [ ] Verify two players on separate physical devices and networks.
- [ ] Verify a third player joining an active room.
- [ ] Test room leader departure and state handover.
- [ ] Test reconnects and public relay outages.
- [ ] Test networks that require TURN and decide whether to document or provide a relay.
- [ ] Run a basic abuse and malformed-message test.

## Next engineering priorities

1. Complete live multi-network WebRTC testing.
2. Improve peer state reconciliation and room leader handover.
3. Add mobile virtual controls and accessibility.
4. Add moderation, mute, block and reporting before public chat growth.
5. Decide whether to add an optional trusted backend for persistent characters.
6. Add quests, inventory, equipment and more co-op encounters.
7. Consider a small-room connection limit based on measured browser performance.

## Explicit non-goals for this phase

- No MMO-scale world.
- No accounts or password storage.
- No global matchmaking.
- No player-to-player trading.
- No voice chat.
- No ranked or prize-based competition.
- No guarantee of free or permanent public relay availability.

## Release rule

A multiplayer feature is not reliable because source code exists or CI passes with a mock transport. It needs a real two-client test across independent networks.
