# Hosting Veritas

The deployable application lives at the repository root. It uses **Next.js + Neon PostgreSQL on Vercel**.

## Vercel

1. Import the GitHub repository into a Vercel project with framework **Next.js** and root directory `.`.
2. Connect a Neon database. If you have no budget, select a Free plan only after reviewing its current terms and limits.
3. Ensure the database's PostgreSQL URL is available as `DATABASE_URL` for the deployment environment. Never commit the URL.
4. Keep the included build command: `npm run db:migrate && npm run build`.
5. Deploy and verify both the Vercel deployment status and GitHub Actions.

The running project is `vertias`; its public address is https://veritas-by-divyam.vercel.app/. The old `veritas-by-divyam` project is a separate obsolete project and should not receive GitHub deployments. There is no OpenAI sign-in dependency.

## Local development

With Node 22.18+ in the Node 22 line:

```sh
npm ci
npm run db:local
npm run dev
```

Without `DATABASE_URL`, local PostgreSQL-compatible storage uses PGlite under `.data/veritas`. On Vercel, `DATABASE_URL` is required; serverless local files are not durable database storage.

## Schema files

`scripts/migrate.mjs` applies the current idempotent `.sql` files in `migrations/postgres/`, sorted by name. The initial file creates documents, events and sessions. The second adds an owner lookup index.

Keep these files idempotent because deployment builds may run them again. Do not edit an applied schema file to introduce incompatible changes; append reviewed migrations. Non-idempotent or complex SQL changes require a versioned transaction-aware migration system before being added. Drizzle generation is a development aid; inspect generated changes before using them.

## Health checks

`GET /api/health` returns HTTP 200 with `{ "status": "ok", "storage": "postgresql" }` when a database query succeeds, otherwise HTTP 503 without connection details.

## Deployment troubleshooting

- **Missing DATABASE_URL:** attach the Neon variable to the correct project and environment, then redeploy.
- **Vercel check fails while Actions passes:** confirm Vercel is linked to the same project/source and inspect that deployment's build logs.
- **Website shows an older build:** confirm the public domain is assigned to the live project, rather than only manually aliased to an old deployment.
- **Workspace unavailable:** inspect the health endpoint and function logs; check schema initialization.
- **Unexpected guest reset:** ending a guest session requires confirmation. Cookies provide session access, not recoverable user accounts.

Plan allowances and renewal policies remain provider-controlled. This project does not purchase domains, configure paid billing, or promise unlimited hosting.
