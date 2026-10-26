# Testing

[Documentation index](index.md)

## Automated checks

```sh
npm test
npm run typecheck
npm run format:check
npm run build
```

For a fresh local database, after the build:

```sh
npm run db:local
npm run test:integration
```

The integration runner starts its own loopback development preview on port 5179, waits for readiness, runs the API checks with simulated local sign-in, and stops that server. It must not target the production demo. It creates synthetic test sources and query events in your local database; sources created by the tests are disabled at the end. Repeated runs use unique source text to avoid matching earlier fixtures.

## Behavior matrix

| Scenario                                           | Expected result                                                      |
| -------------------------------------------------- | -------------------------------------------------------------------- |
| Retention question                                 | Cite the reviewed 90-day policy; exclude stale and unverified claims |
| Encryption question                                | Cite the security handbook                                           |
| Enterprise SLA question                            | Cite the SQL snapshot                                                |
| Unknown topic                                      | Insufficient-evidence refusal                                        |
| Salary or credential request                       | Blocked request                                                      |
| Known instruction override                         | Blocked request or quarantined import                                |
| Restricted source                                  | No source body returned or cited                                     |
| Disabled source                                    | Excluded from retrieval                                              |
| Invalid, future, or expired review date            | Excluded from retrieval                                              |
| Differing numeric values in equally ranked sources | Human review required                                                |
| Common email, ID, or secret patterns               | Redacted from returned excerpts                                      |
| Anonymous API access                               | HTTP 401                                                             |
| Cross-origin mutation                              | HTTP 403                                                             |
| Unverified import                                  | Unusable until approved                                              |
| Quarantined source approval                        | HTTP 403                                                             |
| Approved import then disable                       | Retrieval succeeds, then refuses after disabling                     |

## Manual browser walkthrough

1. Sign in to a fresh local workspace and confirm eight sample sources.
2. Use each suggested question and inspect the citations.
3. Ask for salaries and inspect the sanitized audit row.
4. Import a synthetic policy, review it, and ask a matching question.
5. Disable it and repeat the question.
6. Search and filter the source list.
7. Export audit JSON and check it contains only your current workspace's returned history.
8. At a narrow viewport, open the navigation and check all four sections.
9. Open a dialog, use Tab and Shift+Tab, and close with Escape.

The tests demonstrate selected behavior. They do not establish comprehensive injection resistance, complete PII detection, enterprise authorization, or production security.
