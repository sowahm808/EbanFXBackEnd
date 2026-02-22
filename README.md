# Eban FX Backend (Firebase Functions v2 + Express)

Compliance-first backend for Ghana-origin cross-border payments with KYC gating, transaction limits, immutable ledger entries, audit logging, and simulated webhook-driven deposits/settlements.

## Features
- Firebase Auth ID token verification for all non-public routes.
- KYC workflow (submit, admin approve/reject) with masked ID handling.
- FX quote engine (GHS→USD) with configurable spread and fees.
- Outward payment order lifecycle with strict status transitions.
- AML controls: KYC gating, per-tx and daily limits, velocity checks, suspicious flags.
- Immutable ledger entries and audit logs.
- Idempotent webhook handling for simulated deposits and settlement events.
- OpenAPI docs at `/docs`.

## Project structure
- `src/index.ts`: Express app bootstrap.
- `src/functions.ts`: Cloud Functions v2 `onRequest` export.
- `src/middleware/*`: auth, role, validation, error handling.
- `src/routes/*`: public, user, webhook, admin endpoints.
- `src/services/*`: business logic (KYC, quote, limits, orders, ledger, audit).
- `src/repositories/firestore/*`: Firestore access helpers.
- `tests/*`: Jest unit tests.

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Set Firebase project and secrets:
   ```bash
   firebase use <project-id>
   firebase functions:secrets:set WEBHOOK_SECRET
   ```
   For local runs outside Firebase infrastructure, use one of these auth methods:
   - Preferred: `gcloud auth application-default login` (ADC)
   - Or set `FIREBASE_SERVICE_ACCOUNT_JSON` with the full service account JSON string (never commit this value).
3. Configure pricing/rate docs in Firestore:
   - `config/pricing`: `{ flatFeeGhs, percentFeeBps }`
   - `fxRates/<dateKey>`: `{ midRate, spreadBps, effectiveFrom, effectiveTo, base:'USD', quote:'GHS' }`
4. Build/test:
   ```bash
   npm run build
   npm run test
   ```
5. Deploy:
   ```bash
   npm run deploy
   ```

## API
- Public: `GET /health`
- User: `/me`, `/kyc/*`, `/beneficiaries`, `/quotes`, `/orders*`
- Webhooks: `/webhooks/deposit`, `/webhooks/settlement` (secret + idempotency)
- Admin/compliance: `/admin/kyc/*`, `/admin/orders/*`

OpenAPI docs available at `/docs`.

## Compliance notes
- No private key custody or hot wallet operations in MVP.
- TRC20 USDT is recorded only as settlement references (`txHash`, address/payout refs).
- Sensitive order status and ledger/audit records are backend-controlled.
- This project intentionally enforces AML/KYC controls and does **not** include bypass patterns.

## Firebase official references (implementation notes)
- Admin initialization with ADC via `initializeApp()` and service environment credentials is aligned with Firebase Admin SDK docs.
- Cloud Functions v2 HTTP deployment uses `onRequest` from `firebase-functions/v2/https`.

(References: Firebase Admin SDK setup docs and Cloud Functions v2 HTTP docs.)

## Security note for service-account keys
If a raw private key is ever shared in chat, docs, or source control, treat it as compromised:
1. Revoke/delete that key in Google Cloud IAM immediately.
2. Create a new key only if absolutely necessary.
3. Move secrets to Secret Manager / environment variables and never commit them.
