# Security policy

Veritas is a hackathon prototype. The current supported version is the code on `main`; it has not undergone an independent security audit.

## Reporting a vulnerability

Use the repository's **Security → Report a vulnerability** flow when available. If private reporting is unavailable, contact the maintainer through their GitHub profile before disclosing exploit details. Do not put tokens, private records, or a working exploit against a live organization in a public issue.

Include the affected commit, expected boundary, minimal synthetic reproduction, and impact. No response-time SLA is promised.

## Trust boundaries

- Hosted identity is trusted only when injected by the Sites gateway. The raw Worker must not be exposed as a separate public service with spoofable identity headers.
- Loopback development sign-in is simulated and is not production authentication.
- Every database read and mutation is scoped to the authenticated account ID.
- `Restricted` content is denied for every demo user. Enterprise group-based RBAC is not implemented.
- Pattern matching is incomplete for both prompt injection and sensitive data. Source approval does not prove truth.
- No real company records should be imported into this demo.

Read the [threat model](docs/threat-model.md) and [testing guide](docs/testing.md) for implemented checks and their limits.
