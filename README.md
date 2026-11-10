# Arcade

A free browser-game collection. The first platform release includes Neon Dodge, Snake, 2048 and Minesweeper.

**Play:** https://tanushgargjanuary-bot.github.io/arcade/

## Play
Open the site and choose a game. Guest progress is stored in your browser. Snake uses arrow keys or WASD. 2048 uses arrows, WASD or swipe. Minesweeper uses left click to reveal and right click to flag. Neon Dodge has its own keyboard and touch controls.

## Accounts and data
Accounts are optional. Guest data stays in browser storage. Cloud accounts and cross-device saves use Supabase Auth and PostgreSQL with Row Level Security. They remain disabled until you create a Supabase project and follow [the setup guide](docs/SETUP-SUPABASE.md).

The public GitHub repository stores code, not player data. Never commit a Supabase service_role key. Read [SECURITY.md](SECURITY.md). Browser scores are not cheat-proof. Public competitive leaderboards are not enabled.

## Local development
Requires Node.js 20+ for tests. No build step is required.
```bash
npm test
python -m http.server 8000
```
Open http://localhost:8000.

## Project layout
```text
src/                  # App, catalogue, game logic and cloud adapter
assets/               # Static assets
supabase/schema.sql   # Database schema and RLS
docs/                 # Architecture and setup guides
tests/                # Smoke tests
index.html            # Lobby
neon-dodge.html       # Standalone Neon Dodge
game.js/styles.css    # Neon Dodge assets
app.css               # Lobby and game styling
```

## Contributing
Keep game code independent. Return cleanup functions from mounted games. Add tests and update docs when behaviour changes. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License
MIT.