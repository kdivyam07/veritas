# Deployment

[Documentation index](index.md)

## Existing demo

[Veritas hosted demo](https://veritas-promptwars-divyam.boldgoby8.chatgpt.site/) is owner-private. The public GitHub repository does not grant access to that private demo. Reviewers can run the app locally using synthetic data. Public demo access is a separate owner-controlled hosting decision.

## Your own deployment

This repository retains the Sites/Vinext runtime integration, but its `.openai/hosting.json` deliberately omits the original Site ID. Provision a new Site under your own account, then persist its returned ID as `project_id`. Do not copy or attempt to deploy to another user's project ID.

The logical storage declaration is:

```json
{ "d1": "DB", "r2": null }
```

Sites provisions hosted D1 and applies committed migrations. Preserve `sites()` in the Vite configuration and the supplied Worker entrypoint. Keep local credentials in the runtime environment; do not commit tokens, `.env` files, or `.wrangler` state.

Hosted sign-in is gateway-owned. An ordinary raw Worker deployment is not a complete replacement for that identity layer. Add a suitable trusted identity system before exposing a standalone Worker publicly.

## Local migrations

After a build generates the Wrangler configuration, a pending schema migration can be applied locally with:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_useful_joystick.sql
```

Use the actual pending filename. Do not replay an already applied file or edit an applied migration. Append a new migration for later changes. Local and hosted databases are separate.

## Publication checklist

- Passing tests, type check, formatting check, and production build.
- Correct Site identity and logical storage binding.
- Reviewed committed migrations.
- No confidential fixture data or credentials in the source archive.
- Intended audience preserved.
- Confirmed deployment success before sharing the hosted URL.
