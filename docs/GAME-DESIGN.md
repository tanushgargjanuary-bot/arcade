# Game design and catalogue

## Product direction

Arcade provides short browser games with simple controls. Solo games remain local-first. Multiplayer games use small rooms with server-authoritative shared state. No player account is required.

## Current catalogue

| Game | Mode | Controls | Progress |
|---|---|---|---|
| Neon Dodge | Solo arcade | WASD/arrows, touch drag | Best score in localStorage |
| Snake | Solo arcade | WASD/arrows | Local score and play stats |
| 2048 | Solo puzzle | WASD/arrows/swipe | Local score and play stats |
| Minesweeper | Solo logic | Click/reveal, right-click/flag | Local completion score |
| Realm RPG | Server-authoritative co-op | WASD/arrows, Space, chat | Temporary room XP |

## Realm RPG loop

1. Enter a display name and room code.
2. Join the same room as friends.
3. The Worker assigns a temporary player ID.
4. The server sends the authoritative player list and boss state.
5. Move with WASD or arrow keys. The server calculates the position.
6. Chat with the room. The server validates and attributes the message.
7. Move within range of the Moss Titan and press Space.
8. The server checks range and cooldown, applies damage and awards 25 XP for a defeat.
9. The server broadcasts the new state.

## Prototype limits

- No player login or persistent identity.
- No saved character, inventory, equipment or quests.
- No global matchmaking or room browser.
- No moderation, mute, block or reporting.
- No player-to-player trading.
- No ranked or prize-based play.
- No MMO-scale capacity claim.

## Next game systems

1. Add mobile controls and accessibility.
2. Add room invite links with high-entropy codes.
3. Add moderation and reporting.
4. Add quests and more co-op encounters.
5. Consider optional device-bound recovery if persistent characters become necessary.
