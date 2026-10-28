# Deployment

[Documentation index](index.md) · [Full hosting guide](../HOSTING.md)

**Live site:** https://veritas-by-divyam.vercel.app/

Use the repository root as a Next.js project on Vercel. Production functions use Neon PostgreSQL through `DATABASE_URL`. Apply schema files using the included build command:

```sh
npm run db:migrate && npm run build
```

The live project is `vertias`. GitHub should deploy to this project; the obsolete duplicate project must remain disconnected. The public domain should be assigned to the live project so it follows production builds automatically.

Before reporting a release complete, check both **GitHub Actions** and the **Vercel deployment status**, then check the public page and `/api/health` without credentials. Passing Actions does not imply that Vercel deployed successfully.

New browsers get isolated guest sessions without an OpenAI login. The demo is publicly reachable, but guest workspace records are scoped on the server. This is not enterprise SSO.

Do not publish tokens, `.env.local`, `.vercel` state, local databases, or build caches. Database plan limits and hosting terms are provider-controlled.
