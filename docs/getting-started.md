# Getting started

[Documentation index](index.md)

## Requirements

- Node.js **22.18 or later in the Node 22 release line** (the CI version is pinned).
- npm and Git.
- Internet access for the first dependency install.

An external AI API key is not required. The app uses an extractive evidence engine.

## Install and initialize

```sh
git clone https://github.com/kdivyam07/veritas.git
cd veritas
npm ci
npm run build
npm run db:local
npm run dev
```

Open the loopback URL printed by the dev server, normally `http://127.0.0.1:5173`. Click **Sign in to your workspace**. The loopback development environment supplies a synthetic identity. The first workspace load inserts eight sample sources if they are missing.

`npm run db:local` applies the initial schema to `.wrangler/state`. Run it once for a fresh local database, after building. Do not replay an already applied schema file. When the schema changes, generate a new migration with `npm run db:generate`, inspect it, and apply only the new file using the command pattern in [deployment](deployment.md).

## Script index

| Command                    | Purpose                                                     |
| -------------------------- | ----------------------------------------------------------- |
| `npm run dev`              | Development server with local sign-in simulation            |
| `npm run build`            | Production Worker and client build                          |
| `npm start`                | Preview the built Worker; no development sign-in simulation |
| `npm test`                 | Evidence-engine behavior tests                              |
| `npm run test:integration` | Dedicated local preview plus authenticated API tests        |
| `npm run typecheck`        | TypeScript validation                                       |
| `npm run format`           | Format authored source and documentation                    |
| `npm run format:check`     | Check formatting without edits                              |
| `npm run db:generate`      | Generate schema migrations after a schema change            |
| `npm run db:local`         | Apply the initial schema to a fresh local database          |

## Troubleshooting

- **Workspace returns 503:** confirm the production build generated `dist/server/wrangler.json`, then initialize the local database.
- **Sign-in link loops:** use the development server and a loopback host, not `npm start` or an arbitrary public host.
- **Question is refused:** use a specific question matching enabled, verified, internal evidence reviewed within 180 days.
- **Port already in use:** stop the old preview or pass `--port 5180` after `npm run dev --`.
- **Imported source is not retrieved:** inspect its status and review it explicitly. Quarantined content cannot be approved.
- **Fresh clone lacks a hosting ID:** this is intentional. Local development works without one; provision your own Site before publishing.

Local databases, dependency directories, previews, and secrets are ignored by Git.
