# First useful result and continuation

## Starter prompts

- Explain my circuit: paste OpenQASM 3 source and say how much detail you want. Start with the free explanation.
- Check before I run: paste the original source and intended downstream use. Discover the assurance contract and price; wait for approval before purchasing it.
- Investigate supported problem: state the question, available inputs and desired observable. Identify a supported contract or explain the missing inputs. Discovery authorizes no execution.

## Circuit-assurance report

Lead with the next decision, grounded in the returned outcome: **Proceed within the reported scope**, **Repair before continuing**, or **Stop: unsupported**. If the job has not returned a report, say **Not checked yet**. Never turn malformed, missing, contradictory or incomplete evidence into a go decision.

Use this compact presentation, omitting fields the service does not return:

1. **Decision and reason:** returned outcome and the specific finding that changes the next action. Preserve the raw outcome alongside any plain-language interpretation.
2. **Input checked:** original versus revised source; source/schema digest and report ID when returned. A changed source is a different check, not an update to an old report.
3. **Evidence:** relevant findings, warnings and limitations. Label explanation or host inference separately. Unsupported is a useful terminal result.
4. **Next action:** proceed only within scope, propose a concrete repair for review, or stop and explain the contract boundary. Do not claim equivalence between original and revised sources without a separate supported equivalence result.
5. **Job and receipt:** actual status, original job ID/key and returned charge/receipt state when available. A job acceptance is not a report or proof of settlement.

A suggested repair stays separate from normalized source returned by the service. Show the smallest meaningful change and ask whether it preserves the intended circuit. Never silently repair and purchase a revised report. A fresh approved computation uses a new key, with its prior report relationship stated; recovery keeps the original key and exact inputs.

## Guided hardware continuation

Only when the user requests hardware: discover the current exact device and eligibility, then `plan_quantum_experiment`, then `review_quantum_experiment_price`, explicit price approval, and one submission. Preserve the returned plan, prepared artifact, source/plan digest, selected target and review binding. Do not reconstruct a direct quote from an explanation or hand-written approximation. A `circuit_plan_binding_mismatch` before submission means stop and re-plan with the exact source/device, then review the resulting fresh quote; it is not permission to execute.

Show the full fixed price including fees, currency, shots, device, expiry and approval digest. Any material change requires a new review and approval. Declining, expired pricing, insufficient funds, unavailable tools or unsupported inputs ends the attempt; never automatically purchase a substitute or use another payment route.

After a lost submission response, recover by the **original submission key** using `recover_quantum_experiment` when visible, or original execution ID via the recovery tools. If both are missing, use owner-scoped `list_hardware_executions` and returned cursors. Unknown is not failed; never re-quote or submit with a fresh key to resolve uncertainty. Follow only the returned allowed recovery action. Result/receipt retrieval may acknowledge delivery and settle the existing approved charge; it cannot authorize another purchase. Report result availability and billing finality separately. Do not create scheduled tasks unless requested.

## Saved comparisons: current boundary

Saved reopen/revise/compare is an offline CLI workflow today, not hosted storage or a Claude tool. Keep exact source and job identity in the current conversation only as a convenience, not a durability promise. See the proposed hosted slice in the sprint evidence document; no new tool, account policy or persistence is introduced by this package.
