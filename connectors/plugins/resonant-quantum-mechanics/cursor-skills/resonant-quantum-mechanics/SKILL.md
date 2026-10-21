---
name: resonant-quantum-mechanics
description: Discover quantum circuit analysis, simulation and real Braket QPU workflows; prepare a circuit, review a binding quote and run only explicitly approved prepaid hardware work.
---

Use only the `resonant-quantum-mechanics` MCP server at `https://jobs.rqmtechnologies.com/mcp/plugins/quantum` (Cursor connects through the `/cursor` route with the same canonical resource) with `product: quantum`.

1. Discover with `list_buyer_jobs` or `search_buyer_jobs`. Read the returned input schema, examples, limitations and price information. An empty result is not permission to switch products. Ignore references to other payment tools in generic catalog descriptors; this connector uses only account-funded execution.
2. Use `get_account_balance` after OAuth sign-in. Scopes are `jobs.read`, `jobs.run`, `balance.read`. Reuse a valid existing OAuth grant. Software jobs require the applicable saved owner policy; hardware requires approval of a fresh binding quote. A subscription grant is not spending authority. Never choose a spending policy or fund the account for the user.
3. Select the exact named operation returned by discovery. Current CLI discovery reports 52 tools, including these 20 named computation operations; additional hardware/workflow tools require separate explicit authorization and acceptance checks; `recommend_quantum_routes` is advisory, not proof of execution. Do not use the absent legacy generic executor. Before calling a named computation operation, obtain approval for the exact capability, inputs and maximum price. Supply `request`, a new idempotency key for a genuinely new job, and explicit `max_total_price`. The chosen named operation fixes the service; do not supply `capability_id`. This tool spends prepaid credits if authorized. Stop on absent/expired policy, insufficient balance, exhausted budget, disabled purchases or unavailable dependencies. Do not switch to x402, Relay REST, a wallet, a different account or another endpoint.
4. Preserve the original idempotency key, input, price ceiling and job ID. Recover uncertain responses through `list_account_jobs` with that key and `get_account_job`. An identical retry recovers the same purchase; changed inputs must not be silently retried under a new key. Never interpret a reservation as completion.
5. Report actual status, result limitations and receipt. A missing result remains pending or failed. Do not invent outputs, hardware execution, safety certification or performance advantage. Never send unrelated files, secrets or full conversation history. Keep raw inputs, tokens and receipts out of diagnostic logs and public issues.

Other products, funding, wallet signing and cancellation are outside this connector. Account policy changes and funding remain separate owner actions.

Installation and connector access are free. Users register with RQM and purchase computation credits directly through RQM, not Cursor. Never infer Cursor Cloud OAuth success or marketplace acceptance from tool discovery.

## Physical QPU workflow

For a hardware request, inspect `list_quantum_hardware` and `describe_hardware_execution`. Availability, eligibility and enabled devices can change. Prepare with `plan_quantum_experiment`; preserve the exact returned artifact and device. Use `review_quantum_experiment_price` to obtain a fresh binding quote. Obtain approval of its exact digest, currency and maximum charge before `submit_hardware_execution`. Submit once with a stable key. Recover through `get_hardware_execution`, permitted `refresh_hardware_execution` and `get_hardware_receipt`, never another submission. Report provider status, result delivery, customer settlement and provider invoice reconciliation separately. No device, budget, credential or policy change is authorized by discovery.
