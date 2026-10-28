# Workspace API

[Documentation index](index.md)

## Common behavior

- Endpoint: `/api/workspace`.
- Session: an opaque guest cookie backed by a hashed token in PostgreSQL. GET establishes a session when needed; writes require an existing valid session.
- JSON responses with `Cache-Control: no-store`.
- Writes require a same-origin `Origin` header and `Content-Type: application/json`.
- A posted `owner`, role, or access label cannot select another account's records.
- Request bodies are limited to 30,000 bytes while streaming, including requests without Content-Length. JSON must be an object and use the application/json media type.

## GET

Returns the current user's source list and latest 50 query audit events. Missing sample records are inserted idempotently. Restricted and quarantined source bodies are withheld; other returned source bodies pass through pattern redaction.

```json
{
  "user": { "name": "Your workspace" },
  "sources": [],
  "history": []
}
```

## POST actions

### Ask

```json
{ "action": "ask", "question": "How long are customer logs retained?" }
```

Accepts 1–1,200 characters after validating the input. Returns `outcome`, `message`, `citations`, `checks`, `excluded`, event `id`, and server `elapsed` milliseconds. Outcomes are `Grounded`, `Blocked`, `Insufficient evidence`, or `Needs review`.

### Add a source

```json
{
  "action": "add",
  "title": "Travel policy",
  "kind": "Wiki",
  "content": "Travel requests require a manager approval before booking."
}
```

Title: 3–120 characters. Content: 20–20,000 characters. Kind: `Wiki`, `SQL`, or `API`. The server sets the account owner, internal access, and review status. Imports containing detected instruction patterns are quarantined; other imports begin unverified. A demo account supports up to 100 sources; this check is not transactional under concurrent inserts.

### Review a source

```json
{ "action": "verify", "id": "source-id" }
```

Marks the current user's source verified and updates its review date. Restricted and quarantined sources cannot be approved. This action represents the user's review assertion.

### Toggle retrieval

```json
{ "action": "toggle", "id": "source-id" }
```

Toggles the enabled flag. Enabling does not override status, access, freshness, or injection checks.

## Status codes

| Status | Meaning                                                     |
| ------ | ----------------------------------------------------------- |
| `200`  | Successful action or evaluated question, including refusals |
| `400`  | Invalid input, malformed JSON, or unsupported action        |
| `401`  | Missing or expired guest session                            |
| `403`  | Cross-origin write or prohibited source approval            |
| `404`  | Source absent from the authenticated user's workspace       |
| `409`  | Demo source limit reached                                   |
| `413`  | Oversized request                                           |
| `415`  | Unsupported content type                                    |
| `503`  | Database or runtime operation failed                        |
