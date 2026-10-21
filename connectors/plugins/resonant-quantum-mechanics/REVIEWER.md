# Resonant Quantum Mechanics reviewer instructions

Supply a dedicated funded RQM reviewer account and an owner-saved, bounded, expiring policy through private directory fields. Fresh OAuth consent is required with `jobs.read`, `jobs.run`, `balance.read`. A Claude/Cursor plan does not supply RQM credits. Do not put credentials in this repository or ask the connector to fund an account.

## Review sequence

1. Connect `https://jobs.rqmtechnologies.com/mcp/plugins/quantum`. Before sign-in, call both `list_buyer_jobs` and `search_buyer_jobs`; verify only `quantum` results and inspect the fixture's actual input schema. Search `zzznomatchxyz` and report an empty result accurately.
2. Call `get_account_balance`; the host must prompt for OAuth. Sign in, inspect scopes and consent. If the account lacks a saved policy, execution must stop. The owner saves the review policy through the existing account controls.
3. After verifying the current service price is within the fixture ceiling and remaining review budget, explicitly approve one `quantum_openqasm3_preflight_v1` call with the synthetic input below. This is a real prepaid-credit purchase when enabled. Stop if price, balance, policy or service availability fails. Never fund or change payment methods.
4. Call `get_account_job` using its returned `job_id`, then `list_account_jobs` using the original idempotency key. Require the same job, terminal result and receipt before claiming completion. Reconnect and retrieve it again. Verify revocation rejects access.

Synthetic fixture from the existing test corpus; not evidence of live completion:

```json
{
  "request": {
    "source": "OPENQASM 3.0; qubit[1] q;"
  },
  "idempotency_key": "directory-review-quantum-replace-with-unique-id",
  "max_total_price": "0.010000"
}
```

Retain the actual original key, inputs and ceiling for uncertain-response recovery. Never change the key to recover a lost response. Cross-brand/account retrieval and cross-product execution must fail. Missing/expired policy, exhausted budgets, insufficient balance, disabled purchases and outages must not cause another payment path. The current discovery inventory is 29 tools with 20 fixed named computation operations and no generic executor, funding, wallet or cancellation tool. Compare actual names and schemas with OPERATIONS.md, not just the count. The reviewed producer snapshot has 28 tools; the additional observed advisory tool is `recommend_quantum_routes`.

Record host/version, package commit, endpoint, all visible tool names and schemas, actual search/result/receipt and reconnect/revocation outcomes without raw input diagnostic logs. Version 0.3.1 authenticated host acceptance is pending. Cursor Cloud OAuth remains unresolved; a successful public discovery call is insufficient. Marketplace receipt and approval remain unconfirmed. Leave self-test claims unset until these checks pass on each claimed surface. Reviewer funding and policy must be supplied privately by the owner; this document does not authorize any spend.

The connector is free. Reviewer/user computation credits are acquired directly from RQM; Cursor does not fund or sell these credits.
