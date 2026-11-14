---
name: run-quantum-hardware
description: Plan an eligible real quantum hardware experiment, review and explicitly approve its exact quote, submit once, or reopen its original result and receipt. Use only advertised account-authorized hardware capabilities; not for free lessons or software simulation.
---

# Run Quantum Hardware

Use the existing Resonant Quantum Mechanics connection at
`https://jobs.rqmtechnologies.com/mcp/plugins/quantum` with `product: quantum`.
Select the intended connected account; ask if connections are ambiguous, rather
than probing other accounts. Enabling this skill, signing in or seeing a balance
never grants eligibility or spending authority. Preserve server-side access,
policy, quote, consent and accounting controls. Never fund, grant access,
select a policy, raise a budget or change credentials/settings.

## Return to an already-settled result without financial actions

For a read-only return visit, use `get_settled_hardware_result` with the original
execution ID only when advertised. If the ID was lost, use the advertised
read-only `list_hardware_executions` with `held_only: false` and bounded pagination
when the user authorizes that account lookup. Preserve ownership/principal
checks and return the original result and saved receipt, never a replacement.

If the tool is missing, denies access, or the result is pending, held, unsupported
or inconsistent, explain the exact boundary and stop. Never fall back to
`get_hardware_execution`, `get_quantum_experiment` or `get_hardware_receipt` for a
no-spend/read-only request: those paths can acknowledge delivery and settle the
original charge. Do not refresh, poll providers, quote, reserve or submit to
satisfy read-only recovery. Matching email does not grant cross-client rights.

## Plan and approve one new real hardware run

1. Use only advertised tools and their current complete schemas. Start with
   `describe_hardware_execution` and `list_quantum_hardware`. Report actual
   eligibility, account, funding, policy and device blockers. Hardware support is
   limited to what the installed service actually advertises, currently eligible
   Amazon Braket workflows; never promise arbitrary devices or circuits.
2. Preserve the user's scientific goal, exact circuit, shots, device and readout.
   Obtain missing inputs. Use `plan_quantum_experiment` for a supported supplied
   circuit or a recipe the user explicitly selected. Planning is not hardware
   execution. Do not replace the workload with a Bell demo or simulator.
3. Read fresh review/eligibility for the exact target. Preserve its ARN,
   `target_snapshot_id` and `target_review_sha256`. When a quote is requested, use
   `quote_hardware_execution` or `review_quantum_experiment_price` as advertised.
   Show exact circuit, shots, verified location evidence, provider estimate, RQM
   fee/rounding, fixed total, currency, expiry and frozen terms. Public list
   pricing is not a binding customer quote. Stop on quote-only admission.
4. Require current saved policy, sufficient available funds and explicit approval
   of this exact quote and finite maximum charge. A request to inspect hardware
   is not permission to quote or spend. Submit once via the advertised
   `submit_hardware_execution` or `submit_quantum_experiment`, binding the quote
   digest, amount, currency and one stable idempotency key. Do not substitute a
   target, change shots, raise a ceiling or switch payment rails/account.
5. Preserve original execution ID, full bound request and submission key. After
   timeout or uncertainty, recover the original key via advertised recovery or
   bounded execution listing; never create a new key or buy a replacement.
   Changed inputs require separate approval after the original is resolved.
6. For the original newly approved run, follow the advertised delivery contract.
   Retrieval through `get_hardware_execution`, `get_quantum_experiment` or
   `get_hardware_receipt` may acknowledge verified delivery and settle its frozen
   charge; use it only within that original approval, never under a later
   read-only/no-spend instruction. Refresh only the same execution when explicitly
   permitted by `recovery.can_refresh` and the user's authorized task. Preserve
   pending holds and uncertain acceptance; unknown provider cost is not zero.
7. Report hardware success only from verified completed provenance/result and
   receipt for that exact run. Distinguish software planning, ideal simulation,
   hardware measurements, customer settlement and provider invoice reconciliation.
   Failed/canceled does not prove a refund. Cancel only when explicitly requested.
   Explain evidence limits; counts alone do not establish fidelity, entanglement
   certification or quantum advantage.

Provider execution/retrieval runs server-side. Do not ask the customer to configure
AWS, run workers or deploy infrastructure. Stop at missing tools or admission
gates rather than using another endpoint, provider or account. Variational child
runs need their separate aggregate-budget workflow and explicit approval.

For a free learning/explanation request, use **Learn & Explore Quantum Circuits**
when available, or answer conceptually without hardware/account operations. Never
quote a hardware run as a fallback for a failed lesson viewer. Skill selection
is guidance, not an authorization boundary or a promise of free hardware.
