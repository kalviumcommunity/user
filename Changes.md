# Changes.md — Auth Response Field Audit and Removals

This file documents every over-exposed field found in the original CorpAuth auth endpoints and the decisions made to remove them. Written before any code changes.

---

## Audit: Over-Exposed Fields by Endpoint

### POST /auth/signup

The original implementation used `RETURNING *` and sent the entire inserted row in the response.

| Field | Why It Was Removed |
|---|---|
| `password_hash` | A bcrypt hash sent to the client is a direct input for offline brute-force attacks. Must never leave the server under any circumstance. |
| `verification_token` | A one-time credential. Sending it in the response exposes it to any logging system, error tracker, or network interceptor that captures the response. |
| `stripe_customer_id` | Internal billing identifier. The frontend has no use for this. Sending it enables targeted attacks against the payment provider. |
| `is_admin` | Boolean privilege flag. Sending it client-side signals the admin surface and creates a client-facing escalation target. |
| `reset_password_token` | A credential. Never returned in a response. |
| `last_login_ip` | Internal audit field. Not needed by the frontend and exposes network information. |
| `feature_flags` | Internal configuration. Operational surface map for attackers. |
| `salary` | Private financial data. No auth endpoint should return this. |
| `updated_at` | Not needed in a signup response. |

**Kept:** `id`, `name`, `email`, `role`, `created_at`

---

### POST /auth/login

The original implementation used `SELECT *` and packed sensitive data into the JWT payload, then returned the raw row.

**JWT Claim Removals:**

| Claim | Why It Was Removed |
|---|---|
| `isAdmin` | JWT is base64-readable. Putting a privilege boolean in a JWT creates a client-side privilege target. Role string is sufficient. |
| `stripeCustomerId` | Financial identifier in a JWT that every browser can decode. No auth middleware downstream needs this. |
| `subscriptionPlan` | Business metadata. Not needed for request authentication. Fetch from DB when needed. |
| `featureFlags` | Operational config. Never in a JWT. |
| `email` | The middleware only needs `userId` and `role` to authenticate a request. Email in JWT is unnecessary duplication. |

**JWT now contains:** `userId`, `role`, `exp`

**Response body removals:** same as signup — `password_hash`, `stripe_customer_id`, `is_admin`, `verification_token`, `feature_flags`, `salary`, `last_login_ip`, `reset_password_token`

---

### GET /auth/me

The original used `SELECT *` and returned the full row. Same field removals apply. The profile mapper (`toProfileUser`) adds `subscription_plan` and `updated_at` because these are UI-relevant for a profile page — but still excludes all sensitive and internal fields.

---

## Response Mapper Pattern

A `response-mappers.js` file defines the safe shapes. Every auth route calls a mapper instead of returning a raw DB row. Adding a new field to the DB does not automatically expose it — you must explicitly add it to a mapper.

**`toAuthUser`** — used by signup and login. Minimum identity: `id`, `name`, `email`, `role`, `createdAt`.

**`toProfileUser`** — used by `/me`. Adds `subscriptionPlan` and `updatedAt` for UI context. Still excludes all sensitive fields.

---

## Summary

Every removal decision follows the same rule: if the frontend does not need this field to complete the current auth flow, it does not leave the server. Convenience is not a justification. Reducing the response payload surface is the goal.
