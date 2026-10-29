# Claude first-use draft — 2026-10-29

## Scope and source pins

This draft improves the installed skill's three entry workflows and report presentation. It does not change tool IDs, OAuth scopes, finance authority, tool count or compute capabilities. Claude manifest stays 0.3.1 while its existing publication request is pending; changes here are not published or deployed.

Reviewed sources:

- Relay package base `5bdc4d1895c9656957eb878870cbfc09fa0fad6e`.
- Jobs base `ef4b790151652ed50fe50a7515c5cb41ca70e30f`: `docs/commercial-entry-points/circuit-assurance-report-v1.md`, `docs/quantum-interest-guidance.md`, `docs/quantum-explanation-connector.md`, `docs/assurance-continuation-fixtures.md`, `docs/local-quantum-experiments.md`, merged PR #206.
- Business strategy `strategy/connector-first-products.md` (active 2026-10-23) and `roadmap/2026-roadmap.md`: flagship first; assurance case pack, reliable continuation, then saved repeat use. This draft does not close the joined cross-service recovery or external-customer acceptance milestones.

## Case pack and reviewer procedure

[Cases](claude-first-use-cases.json) are synthetic inputs and scoring expectations, not purchased assurance reports. Original/revised/unsupported cases are development examples; holdouts are kept out of the skill instructions. In Claude, explicitly restrict tests to free explanation and catalog/schema discovery. For hypothetical recovery cases, permit no tool calls. Score actual tool trace and answer separately: route fit, useful next action, evidence boundaries, no unapproved spending. A parser rejection is an expected negative outcome, not a failed safety test. A text-only assertion test is not proof of model routing.

The readable report format is in [the skill reference](skills/resonant-quantum-mechanics/references/first-use.md). Paid assurance output remains untested in this sprint; no fabricated report digest or outcome is supplied.

## Observed live behavior versus proposed source

Current Claude front end, existing connection, 2026-10-29: free explanation successfully handled the original circuit and rejected the out-of-range revision. Claude discovered the assurance schema without invoking a paid check and declined molecule-name chemistry execution. Tool trace showed two explanation calls (one expected parser failure) and tool/schema loading; no quote or purchase. The answer offered concrete repairs and distinguished ideal evidence from hardware. It was overly technical in the opening and used earlier-session chemistry registry evidence rather than freshly fetching it. These remain usability limitations.

Earlier authorized hardware testing exposed `circuit_plan_binding_mismatch` on a direct quote; guided planning and price review succeeded. This is evidence for the guidance change, not a new source-level fix to Core or proof that unpublished skill text is live. No raw customer inputs, job IDs, receipts or hardware results are committed.

Holdout live checks: X-circuit explanation passed; staff-scheduling refusal passed without a substitute, though catalog evidence was reused; lost-response advice preserved the original key but **failed billing accuracy** by promising full refunds after failure/cancellation. A separate prompt-injected prototype rule (not an installed skill) then passed three no-tool negatives: no refund promise, no reuse of old assurance proof after a gate change, and no automatic fallback purchase. These are same-session observations, not independent or blinded evaluations.

Local validation: Relay typecheck, 89 tests and build passed; dependency audit passed its high-severity threshold with one existing moderate advisory. Package/publication validation passed offline and does not establish submission readiness. The generic skill validator could not run in system Python because PyYAML is missing; package tests cover manifest/skill structure. Full final commands are recorded in the PR. Current-live browser results test the existing deployment, not this unpublished skill. Fresh-account onboarding and independent external customer acceptance are not tested.

## Smallest hosted saved-comparison follow-up (not implemented)

Today reopen/revise/compare exists only in the offline CLI. Proposed first hosted slice: an authenticated, owner-scoped saved record referencing the immutable original completed assurance job/report and exact source/schema digest; reopen it read-only, create an explicit revised draft, and compare the two returned reports side by side after a separately approved new check. Keep original report identity and attach parent lineage; never mutate a historical report or inherit its approval/idempotency key. Recovery always refers to the original purchase.

Use existing account ownership and approved OAuth audience boundaries; caller-supplied email, account IDs or chat IDs cannot establish ownership. Before adding storage or tools, specify retention/deletion and validate cross-owner denial, schema drift, partial reports and reconnect recovery. Comparison reports differences in evidence, not equivalence. No automatic rerun or scheduled purchase. This proposal is separate work requiring its own design and deployment review.

## CI spending

The only relay workflow triggers on push and pull_request and uploads artifacts. Draft commits use `[skip ci]` to avoid remote compute/storage charges. Run required checks locally; do not dispatch release, merge or deploy workflows. Marketplace submission remains pending; no duplicate is requested.
