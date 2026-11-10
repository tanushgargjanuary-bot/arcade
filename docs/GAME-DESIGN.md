# Game design and catalogue

## Product direction

Arcade is a multi-game browser platform. Games should start quickly, work on desktop and mobile where practical, and have clear controls. Solo games should not require accounts. Multiplayer games must use server-owned state for shared outcomes.

## Current catalogue

| Game | Mode | Controls | Progress |
|---|---|---|---|
| Neon Dodge | Solo arcade | WASD/arrows, touch drag | Best score in localStorage |
| Snake | Solo arcade | WASD/arrows | Local score and play stats |
| 2048 | Solo puzzle | WASD/arrows/swipe | Local score and play stats |
| Minesweeper | Solo logic | Click/reveal, right-click/flag | Local completion score |
| Realm RPG | Real-time co-op prototype | WASD/arrows, Space, chat form | Live room state; no persistent character |

## Realm RPG: current loop

1. Choose a display name and room code.
2. Join the same room as another player.
3. See all connected players in a shared 2D room.
4. Move with WASD or arrow keys.
5. Send chat messages to the room.
6. Move within range of the Moss Titan and press Space to attack.
7. The shared boss loses 10 HP per accepted hit.
8. The player who lands the final hit receives 25 XP. The boss respawns at full HP.

The room supports up to 20 connected players in the current server configuration. The server caps movement, attack cadence, room capacity and chat size.

## Deliberate prototype limits

- No login or account identity.
- No saved character, inventory, equipment or quests.
- No NPC dialogue or world map.
- No matchmaking or room browser.
- No private messages, voice chat or moderation dashboard.
- No reconnect/resume of player XP.
- No anti-cheat identity system.
- No mobile virtual joystick in this iteration.
- No guarantee of public availability until the Worker is deployed.

## Future game design

1. Persist player profiles and character XP with authenticated identities.
2. Add a small inventory and collectible items.
3. Add multiple rooms and a room directory.
4. Add quests and several boss encounters.
5. Add party formation and cooperative rewards.
6. Add mobile touch controls and accessibility options.
7. Add moderation tools before opening public chat to a larger audience.

Each addition needs tests, a threat review and documentation.
