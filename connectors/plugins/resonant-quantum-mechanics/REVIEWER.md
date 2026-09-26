# Resonant Quantum Mechanics reviewer instructions

Submission prerequisite: the publisher must supply a dedicated RQM reviewer login and a bounded, expiring reviewer allowance through the directory's private reviewer fields. No credentials belong in this repository. A Claude subscription is separate from RQM allowance. Do not use paid checkout or a wallet for review.

Connect the plugin's declared endpoint. Public search works before sign-in. The first protected call should produce the host's Connect prompt; sign in to the dedicated RQM account, inspect the displayed scopes, and authorize the connection. If sign-in fails, stop and report the actual error rather than substituting a shared API key or disabling authentication.

## Three reviewer prompts

1. “Find the Resonant Quantum Mechanics service `circuit-assurance-report-v1`. Show its input schema and limitations. Do not run it yet.”
2. “Check my included RQM allowance. If active and sufficient, run the following synthetic fixture once. This is my confirmation of these exact inputs; use a fresh review idempotency key. Stop without purchase if allowance is unavailable.”
3. “Read the status and result for the operation just returned. Explain its actual findings and limitations; do not rerun it.”

Synthetic fixture, copied from the Jobs native-result test corpus; this text is not evidence of production execution:

```json
{
  "product": "quantum",
  "capability_id": "circuit-assurance-report-v1",
  "request": {
    "source": "OPENQASM 3.0; qubit[1] q;"
  },
  "idempotency_key": "directory-review-quantum-replace-with-unique-id"
}
```

For retry after interruption, retain the actual original idempotency key and identical input. Never create a new purchase or new job to recover an uncertain result. Expected behavior is a product-scoped operation followed by bounded software findings. A terminal result is required before claiming computation completed; neither a reservation nor this example proves it.

Negative checks: unrelated product input must be rejected; inactive/exhausted allowance must stop without extra charge; expired credentials must trigger reconnect. Payment, funding, wallet and cancellation tools must be absent. Do not include real customer inputs in screenshots, logs or public support issues.

Host sign-in and live computation acceptance for version 0.2.0 are pending. The directory form's self-test confirmation must remain unset until those checks actually pass.
