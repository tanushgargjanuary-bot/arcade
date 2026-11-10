# Multiplayer setup

## Player requirements

Players do not need an account, password, API key or Cloudflare login.

They need:
- a modern browser;
- a display name;
- a room code shared by the group.

## Project owner: deploy the server once

The authoritative game server runs on Cloudflare Workers and Durable Objects. The project owner needs a Cloudflare account to deploy and operate it. This is an infrastructure account. It does not create accounts for players.

1. Create or sign in to a Cloudflare account.
2. Install Node.js 22 or later.
3. From the repository root, install the pinned tools and authenticate:

       npm install
       npx wrangler login

4. Deploy the Worker:

       npx wrangler deploy --config worker/wrangler.toml

4. Copy the deployed Worker origin. It will look like:

       https://arcade-realm-api.<account-subdomain>.workers.dev

5. Open `src/multiplayer-config.js` and set the public origin:

       export const MULTIPLAYER_ENDPOINT = "https://arcade-realm-api.<account-subdomain>.workers.dev";

6. Commit and push that change to `main`. GitHub Pages will publish the client after CI passes.
7. Open the Worker health URL and confirm it returns JSON with `ok: true`:

       https://arcade-realm-api.<account-subdomain>.workers.dev/health

The endpoint is public configuration, not a secret. Do not put API tokens in the browser code.

Cloudflare plan limits and availability can change. The current Durable Objects Free plan lists 100,000 requests and 13,000 GB-seconds per day. Incoming WebSocket messages count at a 20:1 billing ratio. Free-plan operations fail when a daily limit is exceeded. See the [official pricing page](https://developers.cloudflare.com/durable-objects/platform/pricing/). The current 10 Hz movement cap and 16-player room limit are deliberate cost controls. The project does not promise unlimited free hosting.

## Join a room

1. Open the [Arcade game lobby](https://tanushgargjanuary-bot.github.io/arcade/).
2. Open Realm RPG.
3. Enter a display name.
4. Use the generated room code or enter your own code of at least eight characters.
5. Select **Copy Invite Link** and share the link with your group.
6. Select **Join Realm**.

The client generates a 64-bit random room code by default. Treat it as a bearer invite: anyone with the link can join. Do not post it publicly. A room code does not prove player identity. Do not put personal information in names or codes.

## Local development and integration tests

Requires Node.js 22+ and Python 3.

    npm install
    npm test
    npm run check:syntax
    npx playwright install chromium
    npm run test:e2e

Playwright starts:
- the static site at `http://127.0.0.1:4173`;
- the local Wrangler Worker at `http://127.0.0.1:8787`.

The multiplayer browser test uses the real local Durable Object implementation. It does not need a deployed Cloudflare account.

## Troubleshooting

| Symptom | Check |
|---|---|
| Server not configured | Set `MULTIPLAYER_ENDPOINT` to the deployed Worker origin |
| HTTP 403 | Confirm the browser origin is listed in `ALLOWED_ORIGINS` |
| HTTP 426 | The client must use a WebSocket connection to `/room` |
| Room is full | The current limit is 16 connected players |
| Connection drops | Check Worker health, Cloudflare status and browser network access |
| Reconnect starts a new player | Expected: player identity and XP are temporary |
| Boss resets after the room empties | Expected: empty-room state expires after 60 seconds |

## Rollback

To disable multiplayer, clear `MULTIPLAYER_ENDPOINT` or remove the Realm RPG catalogue entry. Solo games continue to work. Do not restore the old Trystero client as a fallback for authoritative game state.
