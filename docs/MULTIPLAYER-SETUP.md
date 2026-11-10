# Multiplayer setup

## Account and server requirements

You do not need to create a Cloudflare, Supabase or Firebase account. You do not need to deploy a multiplayer server or configure an API key.

Realm RPG uses Trystero 0.25.4 with its default Nostr discovery strategy. Trystero connects peers through public discovery relays, then uses WebRTC data channels for game traffic.

## Join a room

1. Open the [Arcade game lobby](https://tanushgargjanuary-bot.github.io/arcade/).
2. Open Realm RPG.
3. Enter a display name.
4. Share a room code with friends.
5. Each player enters the same room code and selects **Join Realm**.

Room codes are not passwords. Anyone who knows a room code can try to join. Use a random room code if you do not want strangers to find the room easily. Do not use personal information in room codes.

## How connections work

1. Trystero announces the room through public Nostr relays.
2. Peers discover each other and exchange WebRTC connection details.
3. Browsers establish direct WebRTC data channels where network conditions allow.
4. Game messages then travel directly between connected peers.

Public relays are not operated by this project. They may be unavailable, rate-limit traffic or change policy. The project cannot guarantee their uptime.

## Network limitations

Some networks block or restrict direct WebRTC connections. Those player pairs may need a TURN relay. Arcade does not configure a TURN provider by default. If two players cannot connect:

- Try another network, such as a mobile hotspot.
- Disable restrictive VPN or firewall rules if safe to do so.
- Try a different browser.
- Check the browser console for Trystero connection errors.
- If failures are repeatable across networks, a TURN service or a self-hosted TURN server may be needed. That can introduce an account, server or cost requirement.

## Local development

Requires Node.js 20+ and Python 3.

    npm install
    npm test
    npx playwright install chromium
    npm run test:e2e
    python -m http.server 8000

Open http://localhost:8000 and visit Realm RPG.

The browser loads Trystero from esm.sh. A working internet connection is required for the library and public discovery network.

## Provider and dependency updates

- Current provider: Trystero.
- Pinned browser import: `https://esm.sh/trystero@0.25.4`.
- Default discovery strategy: Nostr.
- Transport: WebRTC data channels.
- No API key or account is configured.

Review Trystero release notes before changing the pinned version. Trystero 0.25 introduced API changes. Test the exact release before upgrading.

## Legacy Cloudflare implementation

The old Cloudflare Worker source remains under `worker/`. The current browser client does not use it. It is not required for deployment or gameplay. The old Wrangler setup guide has been superseded by this document.

## Rollback

To disable the P2P feature, remove the Realm RPG catalogue entry or revert the P2P client change. Solo games continue to work. Do not switch the client back to the legacy Worker without restoring its endpoint configuration and running its local integration tests.
