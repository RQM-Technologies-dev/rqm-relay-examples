# Six-tool publication audit — 2026-10-02

Scope: all three existing branded endpoints. Anonymous live tools/list and public list_buyer_jobs responses are summarized in public-tool-audit.json. Source reviewed in Jobs src/plugin-connectors.ts, src/account-jobs.ts and src/discovery-server.ts. No protected read, debit, account creation, grant or runtime mutation was performed.

| Tool | Actual behavior / annotation | Credit sales, CTA and publication risk |
| --- | --- | --- |
| list_buyer_jobs | Read-only, idempotent, open-world public product contracts | Catalog includes tariff/price metadata and legacy direct-executor URLs, but no observed checkout/top-up/upgrade CTA. Consider stripping commercial offers/links for proposed read-only public profile. |
| search_buyer_jobs | Read-only, idempotent, open-world search; same discovery adapter | No purchase intent in tool description; returns the same class of contracts. Only list output was live inspected; search-output risk assessed from source, not a separate live test. |
| get_account_balance | Read-only, non-destructive, closed-world existing USD balance | No funding tool or CTA; credits-oriented UI may support commerce interpretation. Omit in conservative public profile. Protected output not called in this audit. |
| run_account_job | Writes; destructive=true, idempotent=true, openWorld=true. Exact capability/request/key/max_total_price; Core policy and reservations | Explicitly spends existing prepaid credits. No top-up, checkout or wallet signing. Nonetheless each job purchases a digital compute service; policy exception is unresolved. Hold public submission; omit from proposed read-only profile. Never falsely label read-only. |
| get_account_job | Read-only, closed-world existing principal/product-scoped saved job/result/receipt | Retrieves owned work without another purchase. Receipts may contain historical amount data, not a new transaction CTA. Requires actual account test before submission. |
| list_account_jobs | Read-only, closed-world scoped recent jobs/recovery by key | Title mentions purchases; use neutral existing-results wording only if approved server behavior is genuinely read-only. Requires reviewer-account evidence. |

## Error and authorization paths

Missing bearer tokens fail before protected dispatch; scoped authorize checks bind the product resource and required jobs.read/jobs.run/balance.read scope. Error bodies expose sanitized code, retryable flag and recovery advice to reuse the original key, never switch payment rails. Checked source does not add a funding/top-up/checkout URL on insufficient_balance, machine_policy_denied, invalid_account_response or account_core_unavailable. AccountJobsClient does not forward an arbitrary Core error body: it validates a bounded code and emits the Jobs error wrapper. Review those shapes again against any main-runtime repair before submitting.

Discovery errors return bounded failure information. No observed tool metadata or list-catalog content asks for payment cards, passwords, wallet signing, funding, subscription purchase or upgrades. This limited finding does not certify all successful protected responses, catalog changes or future server versions. Review actual protected success/error evidence and tool scans using a dedicated reviewer account under separate approval.

## Policy boundary

No checkout CTA is necessary to constitute commerce: a per-call digital-service debit can still fall within the prohibition. Existing prepaid funds and consent do not establish the existing-subscription exception. The truthful six-tool packages are held drafts, not certified compliant apps. The minimal separate server-enforced read-only proposal and legal mismatch are documented in PUBLICATION.md. No platform policy attestation is included.
