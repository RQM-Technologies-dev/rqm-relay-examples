# Inspect the evidence behind your OpenQASM 3 check

Updated October 4, 2026 after a read-only catalog check. Inspect the current contract and availability before any paid job.

Working on a small quantum circuit in Claude? Before sending it to another compiler, simulator, or submission workflow, inspect what the circuit check actually established. RQM's hosted quantum connector can return a structured, bounded software report and let your agent retrieve the same paid job after an interruption.

Start with [free contract discovery in Claude](claude-setup.md). Use the **Resonant Quantum Mechanics** custom remote connector at `https://jobs.rqmtechnologies.com/mcp/plugins/quantum`.

## Current assurance request-contract hold

**Do not submit a paid `circuit-assurance-report-v1` job using this guide yet.** A read-only check at 09:53 UTC on October 4 through an existing ChatGPT quantum connection returned source-only request schemas for both preflight and assurance. That observation did not expose the backing MCP URL and does not establish the exact Claude endpoint, consent, saved policy or paid execution path.

The maintained prepaid routing distinguishes the two assurance shapes. On the exact branded quantum audience, an assurance request containing `circuit` enters the artifact adapter and pinned v1 provider path. A new source-only assurance request selects a different catalog path, v2. The discovery example therefore does not establish the accepted paid assurance envelope. Do not guess, translate the envelope, switch endpoints or make a trial purchase to resolve this mismatch. Paid assurance stays on hold here until the route-specific execution contract is verified and aligned.

Preflight is separate: its maintained route uses the source-based v1 request. For preflight, use **only the `balanced` profile** in this guide, inspect the current schema and obtain the approvals below. If discovery disagrees with that route, stop before spending. The fresh discovery check did not verify a live paid preflight result.

## Choose the smallest check that answers your question

`circuit-assurance-report-v1` returns a report-shaped `go`, `no_go`, or `unsupported` decision for supported OpenQASM 3. It costs **$0.10 per job from prepaid RQM credits** at the documented tariff. **The smallest funding package is $5.** Existing sufficient credits can fund a job; a Claude subscription does not provide RQM credits. Inspect the current contract and total ceiling before approving a purchase.

Also inspect `openqasm3-preflight-v1`, listed at **$0.01 per prepaid job**. In the pinned v1 workflow compared here, the two services share the underlying assurance computation, and preflight can include adapter evidence and a report ID. Do not pay for the report-shaped service on the assumption that it performs a stronger check. Ask the agent to compare the current contracts and prices, then choose the least expensive adequate service. If you need only local computation, consider the public [rqm-qiskit library](https://github.com/RQM-Technologies-dev/rqm-qiskit); hosted account execution and recovery are a convenience choice.

## What the assurance report means

- `go`: the submitted artifact cleared bounded canonical/numerical preservation checks in this supported software-assurance path. This does not establish that the algorithm does what you intended. Review the evidence and limitations before your next step.
- `no_go`: the report does not support proceeding under that path. This can include an unsupported import or preserved-original fallback. Inspect the nested reason; repair is a separate decision and service.
- `unsupported`: verification was unsupported or not established under this path. Inspect the nested reason; this is not a passed check.

The catalog allows up to **65,536 source bytes**. Numerical verification is limited to supported circuits of **at most three qubits**. These are separate limits: a source that fits the byte limit can still be unsupported. Measurement, classical data, control flow, declared nonzero global phase, and other unsupported constructs do not become verified merely because the circuit is small.

The maintained assurance artifact adapter accepts ASCII source in `circuit.source`, `circuit.format: "openqasm3"`, and a `balanced` or `aggressive` profile. This describes the adapter, not permission to construct a paid request from the conflicting discovery schema. Follow the assurance hold above. Preflight retains its own source-based request with `source`, optional `source_format: "openqasm3"`, and `profile: "balanced"`. Do not copy either service's envelope into the other or treat a catalog example as overriding a runtime restriction.

Malformed source can raise a parse error instead of returning one of these decisions. Useful compiler evidence may be nested inside `report.result`; empty top-level metrics or warnings should not be expanded into invented findings.

This report provides bounded software evidence. It does not run a simulator or QPU, establish physical hardware correctness, certify safety, or provide a universal formal proof. A report digest helps identify the report; it does not independently establish its correctness.

## Copy this prompt into Claude

```text
Use only the Resonant Quantum Mechanics connector at
https://jobs.rqmtechnologies.com/mcp/plugins/quantum.

First do free discovery. Find circuit-assurance-report-v1 and
openqasm3-preflight-v1, and inspect their current input schemas,
returned evidence, limits, price and availability. Explain their actual
differences. Recommend the least expensive service that answers my question;
do not assume assurance means a stronger underlying check.

Treat discovery as descriptive metadata, not proof of an accepted paid
execution envelope. This guide has a known assurance request-contract
mismatch. Do not run circuit-assurance-report-v1 or convert its source-only
example into a circuit wrapper. Explain the hold and request route-specific
contract verification first; do not test another envelope with a purchase.

For openqasm3-preflight-v1, use its source-based request and only the balanced
profile. If the current schema or route differs, stop before spending.
A production_live catalog label does not establish consent or saved policy.

Ask me for the OpenQASM 3 source and the downstream decision I need to make.
Do not invent an input, silently repair it, or submit unrelated files.
Tell me if the source is unsupported before proposing a paid run.

Before any paid job, show me the exact service, exact request, expected
charge and maximum total price. Explain that jobs spend prepaid RQM
credits and that the smallest funding package is $5. Ask for my approval.
Check the signed-in account and its existing owner-saved spending policy.
If consent, credits, policy or access is missing, stop and explain the
owner action required. Do not fund the account or change its policy.

Only after approval, submit one preflight job within that policy and ceiling.
Keep the original idempotency key, exact request, ceiling and job ID.
If the response is uncertain, retrieve the original job by its ID or key.
Never change its request envelope under the original idempotency key.
Do not create a replacement purchase, switch accounts or payment methods,
or change endpoints. Report completion only with a terminal result and
receipt. Explain the actual verdict, method and limitations without
claiming a simulator run, QPU execution, safety certification or a
general proof of correctness.
```

## A small example, with its provenance

[Example source](../fixtures/quantum-assurance-example.qasm):

```qasm
OPENQASM 3.0;
include "stdgates.inc";
qubit q;
h q;
```

In an operator-reported internal paid test on October 3, 2026, the service returned `go` / `VERIFIED` for this source through the prepaid quantum route. Its evidence was local compiler/unitary numerical equivalence. No simulator or QPU ran. The operator verified a $0.10 settled receipt and recovery with the original key.

This is a one-input internal smoke test, not a customer testimonial, broad compatibility benchmark, or evidence that another buyer's setup will work. The result above is a sanitized summary, not an exported response or publicly verifiable signed receipt. No account, job, payment, receipt, or recovery identifiers are included. See [example provenance](../fixtures/quantum-assurance-example.PROVENANCE.md).

## Before spending

Follow the [Claude setup guide](claude-setup.md), review the [privacy notice](plugins/resonant-quantum-mechanics/PRIVACY.md), and manage credits and owner-saved policies only through the [RQM account site](https://www.rqmtechnologies.com/account/credits). Confirm that the connector and credits page refer to the same account. Submit only source you are authorized to send to RQM.

Free discovery, host connection, account access, a reserved charge, and a queued job are different stages. None proves that a paid result was delivered. Stop when a required stage fails. Use `list_account_jobs` with the original idempotency key or `get_account_job` with the original job ID after an interruption; do not purchase again to resolve uncertainty.

The documented source contract is pinned in [connector capability provenance](capabilities/source-contract.json). Host acceptance and live availability must be checked in your session. This guide does not claim ChatGPT or Cursor directory publication.
