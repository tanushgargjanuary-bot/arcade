# Architecture

The frontend is a static site on GitHub Pages. Source code and game logic live in one repository. Player records do not.

- `src/main.js`: lobby, routes and account UI.
- `src/data.js`: game catalogue.
- `src/games.js`: Snake, 2048, Minesweeper and mount/cleanup contract.
- `src/storage.js`: guest progress in localStorage.
- `src/cloud.js`: optional Supabase Auth and save adapter.
- `src/config.js`: public Supabase URL and anon key placeholders.
- `supabase/schema.sql`: player tables and RLS policies.
- `game.js`, `styles.css`, `neon-dodge.html`: standalone Neon Dodge.

Guest data stays in the browser. Authenticated saves go to Supabase. RLS checks auth.uid() against user_id. Never place a service-role key in browser code.

## Add a game
Add metadata to src/data.js. Implement a mount function in src/games.js. Return a cleanup function that removes listeners and animation frames. Keep save data small and validate it at the database boundary.