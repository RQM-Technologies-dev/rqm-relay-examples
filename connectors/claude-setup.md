# RQM quantum and WaveEngine in Claude

## Hosted connectors in Claude.ai and Claude Desktop

Use **Customize → Connectors → Add custom connector** and the corresponding remote MCP URL:

| Name | Remote MCP URL |
| --- | --- |
| Resonant Quantum Mechanics | `https://jobs.rqmtechnologies.com/mcp/plugins/quantum` |
| WaveEngine | `https://jobs.rqmtechnologies.com/mcp/plugins/wave` |

Follow [Claude's custom remote connector instructions](https://claude.com/docs/connectors/custom/remote-mcp), including your organization's owner controls where applicable. These remote connectors do not require a `.mcpb` archive. A `.claude-plugin/plugin.json` manifest belongs to the Claude Code plugin path; it does not install a custom connector in Claude.ai.

Start with public `list_buyer_jobs` and `search_buyer_jobs`. Each brand exposes six tools, scoped to its own catalog. Inspect the actual service's schema and limits. Discovery does not purchase a job or prove a useful computation completed.

Protected balance and history need an authenticated RQM account. Reuse valid existing consent where supported; new consent is an owner action. Before execution, compare the canonical account ID returned by `get_account_balance` with the account shown on the [credits page](https://www.rqmtechnologies.com/account/credits). Execution additionally needs sufficient prepaid RQM credits, an active owner-saved policy for this agent and service, and explicit approval of the inputs and price ceiling. A Claude subscription does not fund RQM credits. Existing balances and another host's spending authorization do not authorize Claude purchases.

After an uncertain response, retrieve the original job using its ID or original idempotency key. Preserve the inputs, key and ceiling; do not make a replacement purchase. Claim completion only with the terminal result and receipt. See each brand's [quantum](plugins/resonant-quantum-mechanics/REVIEWER.md) or [WaveEngine](plugins/waveengine/REVIEWER.md) acceptance procedure; paid review steps require separate authorization.

## Desktop discovery bundle is a separate package

`connectors/claude-desktop` builds the generic **RQM Jobs Discovery** local stdio extension. It exposes three free discovery/example tools, without brand account execution. It is not either six-tool hosted brand connector.

As of October 2, 2026, desktop packaging is blocked by the retained high-severity npm audit gate: `@anthropic-ai/mcpb@2.1.2` depends on node-forge affected by [GHSA-86w9-cpqp-85rv](https://github.com/advisories/GHSA-86w9-cpqp-85rv). The official advisory lists affected versions through 1.4.0 and no patched release. These remain the current official MCPB and node-forge versions at this check. Tests, build and manifest validation pass, but `npm run pack` stops before producing an archive.

Do not lower the audit threshold, omit build-tool dependencies from this audit, or substitute an unreviewed crypto implementation. A package or crypto replacement needs independent security review, including signature verification and certificate-chain behavior, before release. The hosted path above avoids this local packaging dependency; it does not repair MCPB.

## Verified boundaries

From a clean worktree at `0f2f7ac7583c8d6203bc8ac1345f468597fa42a7`, the root typecheck, 46 fixture tests, build and production high-severity audit gate passed. The desktop's four tests, bundled build and manifest validation passed; its full audit failed on node-forge and MCPB (two high entries), with two additional moderate entries.

On October 2, 2026, anonymous SDK checks against both hosted endpoints negotiated MCP successfully, listed exactly six tools, and retrieved 20 correctly scoped catalog descriptors per brand. Quantum search `openqasm` returned four matches including `openqasm3-preflight-v1`; WaveEngine search `capture` returned five including `diagnose-multichannel-capture-v1`. Search `zzznomatchxyz` returned no matches on either endpoint. Both reported server version 1.7.0.

Reproduce the unpaid checks from the repository root after `npm ci`:

```sh
node scripts/probe-claude-brands.mjs
```

This probe has no OAuth provider or signer and calls only discovery tools. It does not verify Claude UI acceptance, account identity, consent, policy, paid execution, durable receipts or revocation. Those remain host acceptance checks. No directory approval or publication is implied.
