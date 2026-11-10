# Game design and catalogue

## Product direction

Arcade is a multi-game browser platform. Games should start quickly, work on desktop and mobile where practical, and have clear controls. Solo games should not require accounts. Multiplayer games should use small peer-to-peer rooms in this prototype.

## Current catalogue

| Game | Mode | Controls | Progress |
|---|---|---|---|
| Neon Dodge | Solo arcade | WASD/arrows, touch drag | Best score in localStorage |
| Snake | Solo arcade | WASD/arrows | Local score and play stats |
| 2048 | Solo puzzle | WASD/arrows/swipe | Local score and play stats |
| Minesweeper | Solo logic | Click/reveal, right-click/flag | Local completion score |
| Realm RPG | P2P co-op prototype | WASD/arrows, Space, chat form | Temporary peer-shared room state |

## Realm RPG: current loop

1. Choose a display name and room code.
2. Join the same room as another player.
3. Trystero discovers peers through public Nostr relays.
4. Browsers establish direct WebRTC data channels where network conditions allow.
5. See connected players in a shared 2D room.
6. Move with WASD or arrow keys.
7. Send chat messages to the room.
8. Move within range of the Moss Titan and press Space to attack.
9. The elected room leader checks range and cooldown, then publishes the shared boss state.
10. The player who lands the final accepted hit receives 25 temporary XP. The boss respawns at full HP.

There is no guaranteed room capacity. Keep groups small because each browser maintains peer connections.

## Deliberate prototype limits

- No login or account identity.
- No saved character, inventory, equipment or quests.
- No NPC dialogue or world map.
- No matchmaking or room browser.
- No private messages, voice chat or moderation dashboard.
- No reconnect/resume of player XP.
- No anti-cheat identity system.
- No trusted server authority.
- No guarantee of connectivity behind restrictive NATs without TURN.
- No promise of public relay availability.

## Future game design

1. Improve peer-state reconciliation and room leader handover.
2. Add mobile touch controls and accessibility options.
3. Add a moderation and reporting workflow before public chat growth.
4. Add inventory, quests, equipment and more co-op encounters.
5. Evaluate an optional trusted backend only if persistent characters or competitive play need it.

Each addition needs tests, a threat review and documentation.
