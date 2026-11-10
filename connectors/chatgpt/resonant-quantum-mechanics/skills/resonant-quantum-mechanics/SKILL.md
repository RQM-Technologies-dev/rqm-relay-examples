---
name: resonant-quantum-mechanics
description: Use when a user needs OpenQASM 3 validation or conservative repair, circuit equivalence or preservation checks, or supported local simulation from supplied circuit artifacts. Also use for eligible account-authorized Amazon Braket hardware preparation, quoted execution and original-result recovery; never claim hardware evidence from software analysis.
---

Use the `resonant-quantum-mechanics` MCP server at `https://jobs.rqmtechnologies.com/mcp/plugins/quantum` with `product: quantum` for this workflow. Respect the user's chosen provider; a general explanation without an artifact or engineering decision need not call these tools.

For hardware requests, use the hardware workflow below instead of the software-job selection steps. Never substitute a simulator or a Bell demo for a requested hardware workload.

On onboarding, explain the supported tasks and ask which artifact and decision the user has in mind. Discovery is sufficient to get started; installation or onboarding never authorizes execution.

1. Identify the artifact and desired decision. Identify the circuit source or supported artifact format, the intended validation, repair, comparison or simulation decision, and any supplied reference circuit. Ask for missing phase conventions, repair permissions, simulation settings and tolerances required by the selected schema. For repair or optimization, keep the original artifact; release a candidate only when the completed result explicitly validates the required preservation checks. Unsupported equivalence is not proof of equivalence.
2. Search with `search_buyer_jobs` using the user's natural task wording and this product scope; use `list_buyer_jobs` to inspect alternatives when needed. Compare the returned `use_when`, `do_not_use_when`, accepted formats, input schema, examples, readiness and limitations. Select only a supported match; explain unsupported or empty results without switching products. Catalog examples illustrate shape, not the user's measurements. For any later execution, select the matching separately exposed named operation from the current tool definitions, such as `quantum_openqasm3_preflight_v1`, `quantum_openqasm3_repair_v1` or `quantum_supported_circuit_equivalence_v1`. Confirm that its description and complete input schema match the intended service. Do not infer tool names by transforming a service ID, use an arbitrary capability selector, or route work through a generic executor. If no applicable named tool is exposed, explain the limitation and stop before execution.
3. Collect every missing measurement, unit, convention and tolerance required by the selected contract and named tool. Construct arguments exactly from that named tool's exposed input schema and the user's supplied data, including any request envelope it actually declares. Do not invent values, copy example measurements or add undeclared fields. Show the chosen task, exact inputs and limitations before seeking execution approval.
4. Require actual service readiness and valid owner-saved spending-policy evidence for this principal and product, plus explicit approval for these inputs and a finite maximum total price. OAuth sign-in, a subscription grant and `get_account_balance` alone do not establish policy readiness or spending authority. Scopes are `jobs.read`, `jobs.run`, `balance.read`. If the available tools cannot establish policy/readiness, say it is unverified and stop before execution; do not invent a readiness tool or probe by spending. Never select a policy, create a budget, grant access or fund the account. Stop on absent/expired policy, insufficient balance, exhausted budget, disabled purchases or unavailable dependencies.
5. For an approved new job, invoke only the matching separately exposed named Quantum operation, using its complete input schema. The operation binds its scientific service; do not choose a different service through an arbitrary capability ID or generic request dispatcher. Supply the approved `max_total_price` decimal string and one stable `idempotency_key` where required by that tool. Preserve its exact argument shape. Price guidance is not a binding quote or permission to raise the ceiling. Starting a prepaid job spends credits if authorized; do not switch to x402, Relay REST, wallets, another account or another endpoint. Discovery and account reads never authorize a named execution tool.
6. Preserve the selected named tool, original service identity, complete arguments, approved ceiling, idempotency key and returned job ID. After a timeout or uncertain response, use `list_account_jobs` with the original key, then `get_account_job` with the recovered job ID. Never create a fresh key to resolve uncertainty or make a second purchase. Any retry must use the same named operation and original full argument envelope; if recovery remains uncertain, report that state. Changed inputs require a separately approved new job after the original is resolved. Recovery never authorizes another payment.
7. Use only completed, typed results that match the selected service and actual submitted request as engineering evidence. A reservation, pending job or successful transport response is not a completed result. Explain unsupported, withheld, partial or failed outcomes; do not turn them into a passing verdict. Report the actual job status, measurements, criteria, evidence/artifact references, receipt and limitations, and distinguish what was verified from what remains unknown. Preserve the original and any withheld-candidate status; never present these software results as hardware execution, physical certification or performance advantage.

Send only the artifacts needed for the selected task. Never send secrets, unrelated files or full conversation history. Keep raw inputs, tokens and receipts out of diagnostic logs and public issues. Other products, funding, wallet signing and account-policy changes are outside this connector. Hardware cancellation is available only through its advertised tool when explicitly requested.


## Real Amazon Braket hardware

1. Select the intended connected RQM account. If multiple connections are ambiguous,
   ask which one; do not probe other accounts. Use only advertised hardware tools.
   Start with `describe_hardware_execution` and `list_quantum_hardware`. Tool
   visibility is not eligibility. Report actual authentication, funding, policy or
   availability blockers; do not enable gates, create grants or fund an account.
2. Preserve the user's exact device, scientific goal, circuit and readout. Use
   `plan_quantum_experiment` for a supported supplied circuit or an explicitly
   selected recipe. Planning is not hardware execution. Do not silently change
   device, circuit, shots or use a simulator. Obtain missing scientific inputs.
3. Read the exact device's fresh review and eligibility. Preserve its ARN,
   `target_snapshot_id` and `target_review_sha256`. Request a fresh bound quote via
   `quote_hardware_execution` or `review_quantum_experiment_price` using the actual
   tool schema. Show circuit, shots, physical-location evidence, itemized provider
   estimate, RQM fee and rounding, fixed total, currency, expiry and frozen terms.
   A quote-only response cannot be submitted; stop without changing policy.
4. Require the current saved spending policy, sufficient available funds and
   explicit approval of this exact quote and finite maximum charge. Installation,
   OAuth, a balance or a request to inspect hardware does not authorize spending.
   Submit once using `submit_hardware_execution` or `submit_quantum_experiment`,
   binding the original quote digest, amount, currency and one stable idempotency
   key. Never increase a ceiling, substitute a device or switch payment rails.
5. Save the original execution ID and submission key. After uncertainty use
   `recover_quantum_experiment` with the original key, or
   `list_hardware_executions` and its unchanged cursor/filter to locate the original
   execution. Do not submit a replacement. Matching email across OAuth clients
   does not grant cross-client recovery rights.
6. Use `get_hardware_execution`, `get_quantum_experiment` or `get_hardware_receipt`
   for the original approved run. These may acknowledge verified delivery and
   settle its original frozen charge; they are not account-inspection reads and
   must not be used for unrelated software-job recovery. When explicitly allowed
   by `recovery.can_refresh`, refresh only the existing execution. Preserve pending
   holds, uncertain acceptance and unreconciled provider costs literally.
7. Report hardware success only from verified completed result/provenance and
   receipt evidence for that exact run. Distinguish customer settlement from AWS
   invoice reconciliation. Failure or cancellation alone never proves a refund;
   use the original terms and actual receipt. Cancel only if the user requests it.
   Counts alone do not certify entanglement, full fidelity or quantum advantage.

The service runs provider submission and retrieval server-side. Do not ask users
to configure AWS, run a terminal worker or deploy infrastructure. If the installed
catalog or current admission lacks a required tool, explain that limitation;
never route around it. Variational multi-job budgets require their separate
explicit workflow and aggregate-budget approval; a single-run approval cannot
be reused for children.
