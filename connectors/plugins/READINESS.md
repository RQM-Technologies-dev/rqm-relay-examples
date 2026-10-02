# Three products across three hosts

The current target is exactly **Resonant Quantum Mechanics**, **WaveEngine** and **Robotics Lab**, separately scoped in **ChatGPT**, **Cursor** and **Claude**: nine product-host combinations. This target supersedes the older two-brand/deferred-Robotics scope for future engineering. Historical acceptance and submission receipts remain preserved in `acceptance.json`; they do not establish acceptance of this new target.

## Readiness matrix — October 2, 2026

`Historical` means recorded in this repository at an older exact release; `Unknown` means no current cell-specific evidence. Protocol checks are recorded separately below and cannot be promoted to host installation or sign-in evidence. Claude Code, Cowork, Claude web and Claude Desktop require separate subrecords within a Claude cell.

| Product | Host | Separate scoped wiring | Discovery in host | Sign-in | Canonical account identity | Authorization/policy | Paid terminal result | Useful result use | Original-job replay |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Resonant Quantum Mechanics | ChatGPT | Existing package points to shared federation; scoped subscription route is legacy | Unknown for target package | Unknown | Unknown | Unknown | Unknown | Unknown | Unknown |
| WaveEngine | ChatGPT | Existing package points to shared federation; scoped subscription route is legacy | Unknown for target package | Unknown | Unknown | Unknown | Unknown | Unknown | Unknown |
| Robotics Lab | ChatGPT | Existing package points to shared federation; scoped subscription route is legacy | Unknown for target package | Unknown | Unknown | Unknown | Unknown | Unknown | Unknown |
| Resonant Quantum Mechanics | Cursor | Separate `/mcp/plugins/quantum`, public static client `rqm-cursor-quantum` | Historical six-tool native CLI discovery at 0.3.0; current UI unverified | Unknown | Unknown | Unknown | Unknown | Unknown | Unknown |
| WaveEngine | Cursor | Separate `/mcp/plugins/wave`, public static client `rqm-cursor-wave` | Historical six-tool native CLI discovery at 0.3.0; current UI unverified | Unknown | Unknown | Unknown | Unknown | Unknown | Unknown |
| Robotics Lab | Cursor | Shared `/mcp/discovery`; package absent from current marketplace manifest | Historical two-tool shared discovery at 0.1.0 | Not supported by current package | Not supported by current package | Not supported by current package | Not supported by current package | Not supported by current package | Not supported by current package |
| Resonant Quantum Mechanics | Claude | Separate `/mcp/plugins/quantum`, client metadata registration | Historical six-tool Code discovery and web OAuth setup/tool inventory at 0.3.0; current conversational/UI acceptance unverified | Historical web OAuth connection setup; current sign-in/grant unverified | Unknown | Unknown | Unknown | Unknown | Unknown |
| WaveEngine | Claude | Separate `/mcp/plugins/wave`, client metadata registration | Historical six-tool Code discovery and web OAuth setup/tool inventory at 0.3.0; current conversational/UI acceptance unverified | Historical web OAuth connection setup; current sign-in/grant unverified | Unknown | Unknown | Unknown | Unknown | Unknown |
| Robotics Lab | Claude | Shared `/mcp/discovery`; separate folder only | Historical Claude Code/shared-web discovery at 0.1.0; branded web installation unverified | Not supported by current package | Not supported by current package | Not supported by current package | Not supported by current package | Not supported by current package | Not supported by current package |

No cell is accepted end to end. Host account identity must be read through that exact installed brand connection and compared with the canonical RQM account ID. Another plugin's balance, OAuth session, policy or completed job cannot prove this cell. An advertised execution tool, catalog readiness or a healthy Relay also cannot prove a paid result.

## Existing endpoint and client audit

Source snapshots: relay-examples main `b4150e3f251133168b4a98c3e427157decea4939`; Jobs main `586e93045edd83f65da06d366397bd4f234ba5f5`. Public checks used no credentials, signer or OAuth provider. Relay runtime was not edited.

- `/mcp/plugins/quantum` and `/mcp/plugins/wave`: existing six-tool prepaid account routes, respectively server-scoped quantum and wave, version 1.7.0. Cursor static client IDs are present in package configs; Claude configs rely on metadata registration. Anonymous catalog/search/no-match checks pass and cross-product inputs are rejected. Protected scopes are `jobs.read`, `jobs.run`, `balance.read`; resource audiences differ by brand.
- `/mcp/plugins/robotics`: HTTP 404 on initialization. Jobs `PLUGIN_PRODUCTS`, discovery-server scoped product type and account-job scoped output mapping currently cover only quantum/wave. Robotics is not a missing folder alone: the equivalent prepaid resource/audience, capability allowlist, Core authorization/client mapping and returned-product checks need implementation and local tests before client migration.
- `/mcp/robotics`: existing product endpoint, version 1.7.0, advertises 13 tools including public discovery and protected robotics execution/retrieval. Public source binds discovery to robotics. It is not the six-tool prepaid plugin route; its legacy resource metadata has issuer `https://account.rqmtechnologies.com` and broader jobs scopes. Do not silently switch the discovery-only plugin to this tool/auth contract.
- `/mcp/chatgpt/quantum`, `/mcp/chatgpt/wave`, `/mcp/chatgpt/robotics`: existing separate named routes, version 0.2.0, each advertising `list_rqm_services`, `search_rqm_services`, `get_rqm_subscription`, `run_rqm_job`, `get_rqm_job`, `get_rqm_result`. They are subscription contracts with `subscription.read`, `subscription.jobs.run`, `subscription.jobs.read`, not the intended current prepaid policy contract. They are not wired by the current ChatGPT brand packages. Current anonymous checks returned 20 scoped records per brand, matching searches (four quantum, five wave, two robotics), empty no-match results and cross-product rejection. This is legacy route evidence only.
- Current ChatGPT packages live in [Jobs `connectors/chatgpt`](https://github.com/RQM-Technologies-dev/RQM-Jobs-MCP/tree/586e93045edd83f65da06d366397bd4f234ba5f5/connectors/chatgpt). Each `.mcp.json` points to shared `/mcp`; product filtering in skills is guidance, not server-enforced isolation. Preserve these packages until replacement has been reviewed; do not advertise them as isolated prepaid plugins.
- Current Robotics Cursor/Claude configs use identical shared server name `rqm-jobs-discovery`, `/mcp/discovery`, no static client or scopes. Its skill supplies `product: robotics`. That route has two public tools and accepts all three filters. Existing discovery-only namespace reuse is recorded in historical acceptance. Its distinct folder/display name is not an execution isolation boundary.

The generic unsigned RQM Jobs Discovery Desktop archive remains a separate three-tool package. It is not any of these three branded plugins and does not satisfy any branded paid acceptance cell.

## Executable unpaid audit

After `npm ci`, run:

```sh
node scripts/probe-plugin-readiness.mjs
```

This probes six existing/intended scoped endpoints, records server/tool inventory, public catalog/search/no-match behavior and cross-product rejection, and reports missing routes without initiating setup. It never calls a protected or execution tool. Output is protocol evidence, with `hostAcceptance: not tested`, zero grants and zero payments. A missing robotics prepaid route or passing legacy route must remain visible; the script does not silently substitute endpoints. Any unavailable route or failed assertion sets a nonzero exit status; passing legacy checks are still not acceptance of the target prepaid contract.

## Smallest next engineering step

Extend the existing branded prepaid route to Robotics Lab in isolated Jobs/Core worktrees, reusing current account-job schemas and the existing robotics portfolio allowlist. First audit Core's resource/client and returned-product mapping; do not invent a `rqm-cursor-robotics` registration. Add local tests for scoped discovery, cross-product rejection, missing/wrong token audience, capability rejection before submit, returned-product validation, idempotent original-job recovery and outage refusal. No signer or live spending is needed for these tests. Prepare a draft PR with exact CI before proposing deployment or client migration.

Then wire Robotics Lab only to that verified route, restore its marketplace entry, and prepare three separate ChatGPT packages against the same reviewed prepaid brand resources using current supported app mappings. [Official OpenAI packaging guidance](https://developers.openai.com/plugins/build/plugins) distinguishes portable package manifests from compatibility manifests and registered `.app.json` app mappings. Existing legacy `.mcp.json` alone does not prove a ChatGPT installation. Reuse existing registered app IDs/drafts where available rather than making duplicates. [Developer mode connection instructions](https://developers.openai.com/plugins/deploy/connect-chatgpt) describe the user-facing setup; current workspace availability and administrator policy must be inspected rather than inferred from old plan notes. Current [official Developer mode documentation](https://developers.openai.com/api/docs/guides/developer-mode) describes read/write MCP support and Pro/Plus/Business/Enterprise/Education web eligibility; the older repository assertion that Pro is universally read-only is not treated as a present blocker. Actual host permissions remain unverified.

## Specific owner/host acceptance actions still needed

1. Inspect existing named installed connectors and grants read-only in the selected ChatGPT workspace, Cursor This Mac session and each claimed Claude surface. No signed-in Claude tab was exposed by the available browser tools in this task. Directory drafts and historical grants do not prove installed connections.
2. If a new or changed OAuth grant is needed, the owner must authorize that exact host, product, resource and scopes. No grant is inferred from this inventory or from another host. Robotics grants wait until its resource/client mapping exists and is reviewed. Host administrators may need to allow developer/custom connectors or local plugin imports; check actual policy first.
3. Canonical account matching and existing policy reads are separate from granting spending. Before any paid acceptance, obtain specific approval for the host/product, canonical account, service, synthetic input, explicit current price ceiling, total budget and expiry. Existing balances, expired Cursor policy and another surface's budget do not authorize spending.
4. Record one terminal result and receipt, explain its bounded useful output, then retrieve that same job using the original key/ID, reconnect and test revocation as separately authorized. No replacement purchase or funding action belongs to replay.
5. Inspect and update existing publisher drafts only after truthful host evidence. Final directory terms/legal attestations, broader access, new grants and purchases require their applicable specific owner action. No duplicate submission, automatic publication or new schedule is created here.
