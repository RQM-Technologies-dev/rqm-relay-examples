---
name: waveengine
description: Discover bounded signal-processing service contracts and run approved jobs using prepaid RQM credits within an owner-saved spending policy.
---

Use only the `waveengine` MCP server at `https://jobs.rqmtechnologies.com/mcp/plugins/wave` with `product: wave`.

1. Discover with `list_buyer_jobs` or `search_buyer_jobs`. Read the returned input schema, examples, limitations and price information. An empty result is not permission to switch products. Ignore references to other payment tools in generic catalog descriptors; this connector uses only account-funded execution.
2. Use `get_account_balance` after OAuth sign-in. Scopes are `jobs.read`, `jobs.run`, `balance.read`. Fresh consent and a saved owner policy are required; a subscription grant is not spending authority. Never choose a spending policy or fund the account for the user.
3. Before `run_account_job`, obtain approval for the exact capability, inputs and maximum price. Supply `capability_id`, `request`, a new idempotency key for a genuinely new job, and explicit `max_total_price`. This tool spends prepaid credits if authorized. Stop on absent/expired policy, insufficient balance, exhausted budget, disabled purchases or unavailable dependencies. Do not switch to x402, Relay REST, a wallet, a different account or another endpoint.
4. Preserve the original idempotency key, input, price ceiling and job ID. Recover uncertain responses through `list_account_jobs` with that key and `get_account_job`. An identical retry recovers the same purchase; changed inputs must not be silently retried under a new key. Never interpret a reservation as completion.
5. Report actual status, result limitations and receipt. A missing result remains pending or failed. Do not invent outputs, hardware execution, safety certification or performance advantage. Never send unrelated files, secrets or full conversation history. Keep raw inputs, tokens and receipts out of diagnostic logs and public issues.

Other products, funding, wallet signing and cancellation are outside this connector. Account policy changes and funding remain separate owner actions.
