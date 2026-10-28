# Threat model

[Documentation index](index.md)

Questions, titles, imported content and JSON bodies are untrusted. The server trusts a guest identity only after looking up the hash of an opaque cookie token in PostgreSQL. It ignores posted owner/role values and former gateway identity headers.

| Threat                       | Current mitigation                                                   | Remaining limit                                                          |
| ---------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Workspace crossover          | Server-generated owners, hashed session tokens, owner-scoped queries | No recoverable account or enterprise identity proof                      |
| Restricted source disclosure | Restricted bodies withheld and excluded before matching              | Source metadata remains visible in the owner's demo                      |
| Stale or unverified evidence | Eligibility and human review enforced server-side                    | Human review can be wrong                                                |
| Instruction injection        | Known request/content patterns screened                              | Obfuscated and new patterns can evade screening                          |
| Credential or PII exposure   | Selected patterns redacted; blocked query text withheld              | Pattern coverage incomplete; raw imports remain stored                   |
| Unsupported answers          | Exact excerpts, citations and refusal                                | Lexical matching can retrieve irrelevant text; sources can be false      |
| Conflicting sources          | Conservative numeric heuristic                                       | Nonnumeric and lower-ranked contradictions may be missed                 |
| Cross-origin writes          | Origin validation and opaque session requirement                     | Not a substitute for independent security review                         |
| Oversized bodies             | 30,000-byte streaming limit                                          | No general request rate limiter                                          |
| Accidental guest reset       | Explicit confirmation and token revocation                           | No recovery after confirmation; old records are not erased automatically |

Production work still needs enterprise SSO/RBAC, connector permission inheritance, provenance/versioning, request quotas/rate limits, retention/deletion, operational alerts and adversarial evaluation. Use synthetic or public data only.
