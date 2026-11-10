# Multiplayer server setup

## Architecture

The browser client is hosted on GitHub Pages. The real-time server runs separately on Cloudflare Workers with a SQLite-backed Durable Object for each room. Durable Objects and WebSocket hibernation are available on Workers Free, subject to published quotas. See the [pricing guide](https://developers.cloudflare.com/durable-objects/platform/pricing/) and [WebSocket hibernation guide](https://developers.cloudflare.com/durable-objects/best-practices/websockets/).

Free usage is limited. Current documented Durable Object limits include 100,000 requests/day, 13,000 GB-s/day, 5 million SQL rows read/day, 100,000 rows written/day and 5 GB total SQL storage. If a Free-plan limit is exceeded, further operations of that type fail until the daily reset. Limits and pricing can change. Review Cloudflare's current pricing before launch. Do not promise unlimited free operation.

## Prerequisites

- A Cloudflare account.
- Node.js 20 or newer.
- Wrangler CLI.
- Access to this GitHub repository.

## Deploy

From the repository root:

    cd worker
    npx wrangler login
    npx wrangler deploy

The first deployment creates the SQLite-backed Durable Object namespace through the migration in worker/wrangler.toml.

After deployment, copy the Worker URL. It should look like:

    https://arcade-realm-api.<account-subdomain>.workers.dev

Check:

    curl https://arcade-realm-api.<account-subdomain>.workers.dev/health

Expected response:

    {"ok":true,"service":"arcade-realm-api"}

## Configure the client

Edit src/multiplayer-config.js:

    export const MULTIPLAYER_ENDPOINT = "https://arcade-realm-api.<account-subdomain>.workers.dev";

Commit and push this change to main. GitHub Actions will run validation and deploy the static client.

## Allowed browser origins

The Worker uses ALLOWED_ORIGINS in worker/wrangler.toml. The default value allows the production GitHub Pages origin:

    https://tanushgargjanuary-bot.github.io

For local browser testing, add the exact local origin to the comma-separated value, deploy the Worker, then remove the local origin before production use. Do not use a wildcard.

## Verify real multiplayer

1. Open the deployed Realm RPG page in two separate browser profiles.
2. Enter different display names.
3. Enter the same room code.
4. Confirm both players appear in each other's player list and world.
5. Move one player and confirm the other sees the new position.
6. Send a chat message and confirm it appears in both sessions.
7. Move close to the Moss Titan and attack.
8. Confirm the shared boss HP changes in both sessions.
9. Disconnect one browser and confirm the other sees the leave message.

## Local Worker development

Use Wrangler's local development server:

    cd worker
    npx wrangler dev

Add the local site's exact origin to ALLOWED_ORIGINS in a local-only config before testing the WebSocket from the local site. Do not commit a local-only origin change.

## Costs and controls

- Use the Free plan first. Watch request, duration and SQLite usage in Cloudflare.
- Durable Object WebSocket hibernation reduces idle duration use. The server uses the hibernation API.
- Room capacity is capped at 20 connections.
- Movement is rate-limited by server-side timing.
- Chat is length-limited and rate-limited per connection.
- This repository does not configure billing alerts or a spending cap. Configure account alerts yourself.

## Rollback

To disable multiplayer quickly, clear MULTIPLAYER_ENDPOINT in the static client and redeploy Pages. Solo games continue to work. To roll back the Worker, use Cloudflare's deployment controls or deploy a known-good Worker revision.
