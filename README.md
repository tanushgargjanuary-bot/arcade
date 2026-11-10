# Arcade

A free browser-game collection. The platform includes Neon Dodge, Snake, 2048 and Minesweeper.

**Play:** https://tanushgargjanuary-bot.github.io/arcade/

## Play

Open the site and choose a game. No account is required. Snake uses arrow keys or WASD. 2048 uses arrows, WASD or swipe. Minesweeper uses left click to reveal and right click to flag. Neon Dodge has its own keyboard and touch controls.

## Player data

Arcade stores scores and play statistics in the current browser. It does not send player data to a server.

Use **Export** to download a JSON backup. Use **Import** to load that backup in another browser or device. Import merges records and keeps the higher score, play count and play time for each game. Keep backup files private if you do not want to share your play history.

Browser storage is local to a browser profile. Clearing site data can remove it. Export backups before clearing browser data or changing devices. There are no accounts, automatic cross-device sync, public leaderboards or server-verified scores.

## Deployment

The workflow validates pull requests and deploys updates from `main`. The repository owner must enable Pages once: open **Settings → Pages → Build and deployment**, then select **GitHub Actions** as the source.

## Local development

Requires Node.js 20+ for tests. No build step is required.

```bash
npm test
python -m http.server 8000
```

Open http://localhost:8000.

## Project layout

```text
src/                  # App, catalogue, game logic and local storage
assets/               # Static assets
docs/                 # Architecture and roadmap
tests/                # Automated tests
index.html            # Lobby
neon-dodge.html       # Standalone Neon Dodge
game.js/styles.css    # Neon Dodge assets
app.css               # Lobby and game styling
```

## Contributing

Keep game code independent. Return cleanup functions from mounted games. Add tests and update docs when behaviour changes. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT.
