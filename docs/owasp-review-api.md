# OWASP Review — Computation API (Lab 4.2, focus A01/A03/A04)

**Scope:** `src/server.ts`, `src/store.ts` | **Reviewer:** human + AI | **Date:** 2026-09-24

| # | Check (OWASP) | Result | Note |
|---|---|---|---|
| 1 | A01 — usage data scoped per caller, no cross-client read | **Fixed in this PR** | Was: `?clientId=` free. Now: always caller key; spec updated |
| 2 | A01 — auth on all routes; requestId unguessable (UUID) | Pass | Missing/invalid key → 401 everywhere; IDs random |
| 3 | A03 — injection via operands (SQL/JS strings) | Pass | Regex `^[0-9]+$` + `maxLength 10000` → 422; no SQL/ORM layer exists |
| 4 | A03 — malformed/non-object JSON, unknown keys | Pass | `try/catch` → 400; non-object → 422; extra keys → 422 (`additionalProperties: false` enforced) |
| 5 | A04 — unbounded input / DoS | **Fixed in this PR** | Per-field cap 10000 digits → 422; rate limit 60/min/key → 429 |
| 6 | A04 — PII/sanitized logs | Pass | Logs carry requestId/status/reason only; no operands, no keys |
| 7 | A05 — security misconfig (spec vs code drift) | Pass | `api-spec.yaml` updated in same PR (usage scoping, maxLength) |
| 8 | A09 — no vulnerable deps | Pass | Zero runtime deps (`node:http` stdlib); `package-lock` audited via `npm ci` |

**Accepted risks (documented, not fixed):** in-memory store + rate buckets vanish on restart (no persistence per spec); no TLS termination in app (assumed at edge); `GET by id` is capability-URL style (unguessable UUID, no per-record ACL).
