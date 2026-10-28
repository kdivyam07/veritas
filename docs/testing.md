# Testing

[Documentation index](index.md)

```sh
npm test
npm run typecheck
npm run format:check
npm run build
npm run db:local
npm run test:integration
npm audit --omit=dev
```

The unit suite contains **23 cases** across evidence and request handling. Integration checks start a dedicated Next.js preview on port 5179 and use synthetic guest sessions. Do not point them at production. Test imports are disabled at the end of each run; each run uses a separate guest owner.

## Coverage

- Correct citations for retention, encryption and SLA questions.
- Refusal for unsupported, restricted, stale, disabled, invalid-date and known instruction-override evidence.
- Selected output redaction and numeric conflict refusal.
- Skipped pipeline stages after a blocked request.
- Eligibility calculation shared between retrieval and dashboard counts.
- Invalid JSON, wrong media types, multibyte and streaming body limits.
- Valid loopback origins and rejected foreign origins.
- Guest cookies, ignored spoofed identity headers and account crossover rejection.
- Source import/review/toggle lifecycle, persistence and sanitized audit history.
- Session revocation and health endpoint availability.

## Browser checklist

1. Ask each sample question and inspect citations.
2. Submit a new question; the previous report must not appear under it.
3. Import, review, search, filter and disable a synthetic source.
4. Reload and verify persistence.
5. Open an audit report and export JSON.
6. On a short desktop screen, scroll the sidebar to its last controls.
7. On mobile, open and close the drawer using its button, backdrop and Escape.
8. Check Tab/Shift+Tab containment in the drawer and dialogs.
9. Open session reset, cancel, and confirm the existing workspace stays accessible.
10. Check the public production page and database health after deployment.

These checks establish selected behavior, not comprehensive security or semantic accuracy.
