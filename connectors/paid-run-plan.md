# Close the paid-run gap inside the host

## Local buyer implementation

The [local buyer](local-buyer/README.md) now implements free quote preparation,
MCP form confirmation for one exact purchase, an environment-only signer,
durable original-authorization persistence, delivery retrieval and receipt
verification. Retry/restart recovery has no signer or fresh quote. The fixed
first-party route is multichannel diagnosis through Relay's existing HTTP API.
The public kit's original version-1 recovery-file contract is retained.

Protocol acceptance uses a simulated approving MCP client and payment service.
Native host confirmation, an authorized live payment and reconciled accounting
are separate outstanding acceptance evidence. Cursor is the initial native
target because its documentation advertises elicitation. No desktop pack,
directory listing or paid-host result is inferred from these tests.

The companion Jobs fix connects detail/example reads to the same pinned
production catalog already used by list/search. Deployment and anonymous live
readback remain required; the dated inventory below records the original fault.

## Inventory, September 11, 2026

- Jobs `/version` reports `1.7.0`, commit `04683dfa10a4f63fa6d6a25a43b29cc7a22f62cf`.
  Live installation metadata reports execution enabled for wave, quantum and robotics.
- Anonymous SDK discovery works when pinned to `2026-07-28`. A default SDK client
  and an explicit `2025-11-25` initialize fail with unsupported protocol version.
  The companion Jobs PR enables the SDK's stateless compatibility mode across
  all four endpoints. Native host acceptance remains unverified until deployment.
- Jobs exposes `run_buyer_job` and the named multichannel tool. It accepts a
  pre-signed payment payload in `_meta["x402/payment"]`; an unpaid call yields a
  challenge. The server does not give the host a wallet or sign for the buyer.
- Live `get_wave_capability`, `get_wave_example`, and federation
  `get_capability` returned `PRODUCT_UNAVAILABLE` for multichannel diagnosis.
  Search remains available. Repair and verify this dependency path before
  claiming the remote discovery-to-example flow is complete. The local MCPB
  includes the existing public synthetic pair to make its free example usable.
- OAuth protected-resource metadata points to Account Core. Core advertises
  authorization-code/PKCE and machine flows. A host sign-in round trip has not
  been verified by this inventory. The analytics credential is unrelated.
- Relay `/ready` currently reports public admission, 60 jobs, zero pending
  settlement/recovery, and commit `605c0bd9732fd8f2ae6718d07447b55a57212df4`.
  This is a dated readiness observation, not a new paid run or Day 0 reset.
- Relay's TypeScript buyer signs locally and preserves the original payment for
  recovery. Its read-only MCP interface does not provide a paid end-to-end flow.

## Delivery order and evidence

1. **Connect successfully.** Merge the connector pack and the Jobs compatibility
   fix after required checks. Deploy Jobs through the existing release gates;
   verify exact SHA, anonymous initialization and discovery in each real host.
   Keep the current financial controls and Day 0 observation running.
2. **Complete one bounded purchase in a supported host.** Start with the
   multichannel service in a local host (Claude Desktop or Cursor). Build a
   separately reviewed buyer component that reuses the existing purchase,
   receipt and recovery code, with the buyer key environment-only and inaccessible
   to the model. It must show the provider price, fee, total and expiry, require
   an explicit maximum, and obtain authorization for that specific purchase.
   Installation, a search, and model tool selection are not spending approval.
3. **Make retries safe.** Persist the original authorization, request hash,
   route/provider, idempotency key and payment/execution checkpoints privately
   before submission. Recovery has no signer and cannot buy again. Test lost
   responses, restart, delayed finality, expiry, provider failure, full refunds,
   and duplicate accounting. Do not switch provider after payment.
4. **Validate payment within the existing authorization.** Reconcile the durable
   run and remaining first-party allowance before any paid test. Never repay
   accepted work. A different payment mechanism, external-provider spend or
   widened custody/permissions needs its own explicit scope and allowance.
   One passing host run should demonstrate one collection and one retrieval
   without a user-authored TypeScript script. Operator validation is not demand.
5. **Distribute where completion is proven.** Submit reviewed vendor-specific
   packages only after host acceptance and required owner agreements. Prioritize
   qualified installs and completion over page traffic. Treat ChatGPT's digital
   commerce restriction as a product constraint, not a missing manifest.

A cloud-hosted signer would change custody and credential handling; it is not
an implicit consequence of this plan. An OAuth/pre-funded route may eventually
reduce setup, but authorization, eligibility, funding and platform policy must
be established before promising it. No new paid Relay MCP tools or RQM-MCP
mutations are included in the connector PRs.

## Demand measurement

Distribution is the acquisition priority. Retain public pages as supporting
installation, examples and support. Track directory status and referral source
when available, successful installs, first useful free search, quotes,
authorized purchases, completions, refunds and returns. Use existing aggregate
telemetry; unavailable host install counts and attribution remain unknown.

Account Core remains the financial authority. Preserve the current Day 0 clock,
independent-customer classification, operator-validation exclusion, exactly-once
operation counts, cost unknowns, Day 7/14 reviews and seven-day return review.
Do not restart observation because a package is published. Keep the targets of
three independent paying customers, twenty successful external operations,
one seven-day return and positive measured contribution margin.

Current limits remain: 1 USDC/call, 5 USDC and 100 operations/payer/day,
20 USDC and 500 operations globally/day, two concurrent operations, existing
infrastructure ceilings and bounded validation allowance. Dependency, budget or
accounting failures pause admission while accepted purchases recover. No
outreach, ads, subscriptions, listing fees, or automatic provider expansion.
