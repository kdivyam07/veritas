# Contributing to Veritas

Start with [local setup](docs/getting-started.md) and the [architecture](docs/architecture.md). Use synthetic data for every example and test.

1. Open an issue describing the user problem or a reproducible defect.
2. Create a focused branch from `main`.
3. Keep retrieval decisions on the server and scope database reads and writes to the authenticated owner.
4. Add behavior tests for changes to safety checks, evidence selection, or API authorization.
5. Run `npm run format`, `npm test`, `npm run typecheck`, and `npm run build`.
6. For API changes, initialize the local database and run `npm run test:integration`.
7. Submit a pull request explaining the behavior, validation, and limitations.

Use plain commit titles such as `Fix invalid source dates`. Do not make empty commits, backdate history, or add sensitive content to test fixtures.

The repository root is the deployable Next.js/Vercel application. Keep guest-session boundaries on the server and review PostgreSQL schema changes carefully. AI-assisted contributions are welcome when authors can explain the implementation and verify it.
