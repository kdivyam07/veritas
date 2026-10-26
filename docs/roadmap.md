# Roadmap

[Documentation index](index.md)

These are planned improvements, not implemented features.

## Next: stronger evidence quality

- Sentence-level relevance and typed policy fields, with evaluation cases for multi-part questions.
- Better conflict detection across source versions, including nonnumeric claims.
- Source revision history and an explicit authority/supersession model.
- Acceptance: measurable retrieval precision and refusal behavior on a versioned evaluation set.

## Next: enterprise boundaries

- Enterprise SSO, group membership, and server-assigned source administration roles.
- Connector-specific permission inheritance and ingestion allowlists.
- Query rate limits, streaming request limits, atomic quotas, and retention/deletion controls.
- Acceptance: automated account-isolation and role-matrix tests across every endpoint.

## Later: controlled generation and connectors

- Optional model generation constrained to approved evidence, with citation and output validation.
- Read-only wiki and SQL connectors, plus allowlisted and schema-validated API ingestion.
- Explicit source credentials in a secret store and observable sync health.
- Acceptance: no arbitrary URL fetches or user-authored SQL execution; failures withhold unsupported answers.

## Portfolio milestones

- Ship one tested feature at a time.
- Document observable results and remaining gaps.
- Share a demo or learning update when there is a substantive milestone.
