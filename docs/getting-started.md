# Getting started

[Documentation index](index.md)

Use Node **22.x, at least 22.18**, npm and Git.

```sh
git clone https://github.com/kdivyam07/veritas.git
cd veritas
npm ci
npm run db:local
npm run dev
```

Open the loopback URL, normally http://127.0.0.1:3000. A browser guest workspace opens automatically with synthetic sources. No external account or AI key is needed.

If `DATABASE_URL` is unset, development stores PostgreSQL-compatible data in `.data/veritas` with PGlite. For a hosted Neon database, privately set its URL in `.env.local` before running migrations. `.env.example` contains comments, not credentials.

| Command                                   | Purpose                                                   |
| ----------------------------------------- | --------------------------------------------------------- |
| `npm run dev`                             | Next.js development server                                |
| `npm run build`                           | Production compilation                                    |
| `npm start`                               | Run the production build                                  |
| `npm run db:local` / `npm run db:migrate` | Apply current idempotent PostgreSQL schema files          |
| `npm test`                                | Engine and request behavior tests                         |
| `npm run test:integration`                | Dedicated local preview with session/API lifecycle checks |
| `npm run typecheck`                       | TypeScript validation                                     |
| `npm run format` / `format:check`         | Source formatting                                         |
| `npm audit --omit=dev`                    | Runtime dependency advisory check                         |

Local data, tokens, environment files and build caches are excluded from Git. Ending a guest session or clearing cookies has no recovery flow; use only synthetic or public data.

See [HOSTING.md](../HOSTING.md) for Vercel setup and troubleshooting.
