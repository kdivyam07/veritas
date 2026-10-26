# Threat model

[Documentation index](index.md)

## Assets and trust

The app stores imported source snapshots and audit events. It trusts account identity from the Sites gateway. Document contents, questions, titles, and API bodies are untrusted input. React renders text rather than interpreting uploaded HTML. Drizzle parameterizes database operations.

## Implemented boundaries

| Threat                         | Current mitigation                                                             | Remaining limit                                                                |
| ------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| Account crossover              | Every document/event read and source mutation includes the authenticated owner | Gateway identity must be trustworthy; enterprise membership is not modeled     |
| Restricted source disclosure   | Restricted bodies are withheld and excluded before evidence selection          | Metadata remains visible in the user's own demo library                        |
| Stale or unreviewed evidence   | Explicit eligibility checks and human review step                              | Human approval can be wrong; no independent truth verification                 |
| Instruction injection          | Known patterns trigger request blocks or source quarantine                     | Obfuscated and novel patterns can evade these checks                           |
| Credential/PII exposure        | Selected patterns are redacted; blocked question text is not stored            | Pattern coverage is incomplete; raw imported source content remains stored     |
| Confident unsupported response | Exact cited excerpts or explicit refusal                                       | Lexical matching can retrieve irrelevant text; source claims may be inaccurate |
| Conflicting values             | Conservative comparison among equally ranked numeric excerpts                  | Nonnumeric contradictions and lower-ranked conflicts may be missed             |
| Cross-site writes              | Same-origin requirement plus authenticated identity                            | Does not replace an independent security review of the gateway/session system  |
| Resource abuse                 | Request/source length limits and a per-account source cap                      | No rate limiter, streaming request cap, or transactional quota                 |

## Before production

Introduce real enterprise SSO and group mapping, server-assigned roles, approved connector ingestion, robust retention and deletion, request rate limiting, source provenance/versioning, adversarial evaluations, operational alerts, and a reviewed LLM integration if generation is added.

Source administration is currently self-service inside each user's isolated demo. The demo `Restricted` label always denies retrieval; there is no client role switch that grants HR access.
