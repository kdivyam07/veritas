# Security policy

Veritas is a synthetic-data hackathon prototype. It has not undergone independent security review.

## Report a vulnerability

Use GitHub's private vulnerability-reporting flow when enabled. Otherwise contact the maintainer through the GitHub profile before disclosing exploit details. Do not include credentials, private records, or a working exploit against a live organization in a public issue.

Include the affected commit, minimal synthetic reproduction, expected boundary and impact. No response-time SLA is promised.

## Implemented boundaries

- Opaque 256-bit guest tokens live in HttpOnly, SameSite=Lax cookies, Secure in production. PostgreSQL stores token hashes.
- Source/event queries and source mutations are scoped to the associated server-generated owner.
- Client account IDs and former hosting-provider auth headers do not grant access.
- Requests are screened and streamed JSON bodies are limited to 30,000 bytes. Writes require a same-origin Origin header.
- Restricted and quarantined source bodies are withheld, and retrieval eligibility is enforced on the server.
- Known sensitive patterns are redacted. Blocked question text is withheld from stored audit history.
- Starting a new guest workspace requires UI confirmation and revokes the old token.

## Limits

Guest isolation is not enterprise identity verification. There is no SSO/group RBAC, request rate limiter, automatic data retention/deletion, or guest-account recovery. Pattern checks are incomplete. Source approval asserts review, not truth. Do not import confidential data.

Read the [threat model](docs/threat-model.md). Keep dependencies patched and check `npm audit --omit=dev` before releases.
