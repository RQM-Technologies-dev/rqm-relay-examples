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

The previous official CLI dependency, `@anthropic-ai/mcpb@2.1.2`, imports node-forge affected by [GHSA-86w9-cpqp-85rv](https://github.com/advisories/GHSA-86w9-cpqp-85rv). Its official advisory lists affected versions through 1.4.0 and no patched release. This repository's packaging flow now uses a minimal unsigned ZIP writer with pinned `fflate` and Ajv dependencies, the unchanged official MCPB 0.3 schema and its MIT license. The full high-severity audit still runs before an archive is written.

The earlier `mcpb pack` command also produced an unsigned ZIP: signing was a separate command that this product did not invoke. The replacement does not create, consume, strip or verify signatures or certificates, and does not modify host certificate validation. It accepts only five generated files, validates the manifest, fixes the launch command and rejects links, credential configuration and unexpected files. See the [packaging security rationale](claude-desktop/PACKAGING.md).

The archive is **unsigned**, with no authenticated publisher identity. Its SHA-256 reports byte integrity, not publisher authentication. Obtain it from a trusted reviewed repository/CI run and review Claude's install prompt. Organizations requiring signed extensions must not treat this artifact as meeting that requirement. Claude's install and organization controls still apply; native UI acceptance remains unverified. The hosted brand paths above do not need a local archive.

## Verified boundaries

From a clean worktree at `0f2f7ac7583c8d6203bc8ac1345f468597fa42a7`, the root typecheck, 46 fixture tests, build and production high-severity audit gate passed. That prior desktop build failed its full audit on node-forge and MCPB (two high entries). The replacement has nine passing tests, a successful build/schema validation and a passing full high-severity audit, with two existing moderate entries.

On October 2, 2026, anonymous SDK checks against both hosted endpoints negotiated MCP successfully, listed exactly six tools, and retrieved 20 correctly scoped catalog descriptors per brand. Quantum search `openqasm` returned four matches including `openqasm3-preflight-v1`; WaveEngine search `capture` returned five including `diagnose-multichannel-capture-v1`. Search `zzznomatchxyz` returned no matches on either endpoint. Both reported server version 1.7.0.

Reproduce the unpaid checks from the repository root after `npm ci`:

```sh
node scripts/probe-claude-brands.mjs
```

This probe has no OAuth provider or signer and calls only discovery tools. It does not verify Claude UI acceptance, account identity, consent, policy, paid execution, durable receipts or revocation. Those remain host acceptance checks. No directory approval or publication is implied.
