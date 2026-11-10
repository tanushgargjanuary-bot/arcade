# Architecture

Arcade is a static browser application hosted on GitHub Pages. It has no backend and does not need an account or API key.

- `index.html`: application shell and data import/export controls.
- `src/main.js`: lobby, game routes and backup actions.
- `src/data.js`: game catalogue.
- `src/games.js`: Snake, 2048, Minesweeper and the mount/cleanup contract.
- `src/storage.js`: validated local progress, statistics and versioned backup import/export.
- `game.js`, `styles.css`, `neon-dodge.html`: standalone Neon Dodge.
- `tests/`: automated tests.

## Player data

Progress is stored in localStorage under `arcade.player.v1`. The application does not transmit it. The export format has a format identifier and version. Import validates game IDs and numeric fields, then merges records without lowering existing values.

Browser storage belongs to one browser profile and site origin. It can be removed by the user or browser. It is not a backup. Users must export a file to move data between devices or protect it from local data loss.

## Add a game

Add metadata to `src/data.js`. Implement a mount function in `src/games.js`. Return a cleanup function that removes listeners and animation frames. Add tests and update the roadmap when behaviour changes.

## Security limits

Client-side scores are user-controlled. They are suitable for personal records only. Do not present them as verified competition results. A public leaderboard would need a trusted server-side score validation design.
