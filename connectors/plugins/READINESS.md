# Three products across three hosts

The current target is exactly **Resonant Quantum Mechanics**, **WaveEngine** and **Robotics Lab**, separately scoped in **ChatGPT**, **Cursor** and **Claude**: nine product-host combinations. This target supersedes the older two-brand/deferred-Robotics scope for future engineering. Historical acceptance and submission receipts remain preserved in `acceptance.json`; they do not establish acceptance of this new target.

## Readiness matrix — October 2, 2026

`Historical` means recorded in this repository at an older exact release; `Unknown` means no current cell-specific evidence. Protocol checks are recorded separately below and cannot be promoted to host installation or sign-in evidence. Claude Code, Cowork, Claude web and Claude Desktop require separate subrecords within a Claude cell.

| Product | Host | Separate scoped wiring | Discovery in host | Sign-in | Canonical account identity | Authorization/policy | Paid terminal result | Useful result use | Original-job replay |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Resonant Quantum Mechanics | ChatGPT | Separate portable prepaid source candidate; registered ChatGPT connection unverified | Unknown for target package | Unknown | Unknown | Unknown | Unknown | Unknown | Unknown |
| WaveEngine | ChatGPT | Separate portable prepaid source candidate; registered ChatGPT connection unverified | Unknown for target package | Unknown | Unknown | Unknown | Unknown | Unknown | Unknown |
| Robotics Lab | ChatGPT | Separate portable prepaid source candidate; registered ChatGPT connection unverified | Unknown for target package | Unknown | Unknown | Unknown | Unknown | Unknown | Unknown |
| Resonant Quantum Mechanics | Cursor | Separate `/mcp/plugins/quantum`, public static client `rqm-cursor-quantum` | Historical six-tool native CLI discovery at 0.3.0; current UI unverified | Unknown | Unknown | Unknown | Verified prior paid result (inherited owner-task evidence) | Verified independent use (inherited owner-task evidence) | Live same-key replay unresolved |
| WaveEngine | Cursor | Separate `/mcp/plugins/wave`, public static client `rqm-cursor-wave` | Historical six-tool native CLI discovery at 0.3.0; current UI unverified | Unknown | Unknown | Unknown | Unknown | Unknown | Unknown |
| Robotics Lab | Cursor | Separate `/mcp/plugins/robotics`, public static client `rqm-cursor-robotics`; package 0.4.0 | Historical shared discovery at 0.1.0; current scoped host unverified | Unknown | Unknown | Unknown | Unknown | Unknown | Unknown |
| Resonant Quantum Mechanics | Claude | Separate `/mcp/plugins/quantum`, client metadata registration | Historical six-tool Code discovery and web OAuth setup/tool inventory at 0.3.0; current conversational/UI acceptance unverified | Historical web OAuth connection setup; current sign-in/grant unverified | Unknown | Unknown | Unknown | Unknown | Unknown |
| WaveEngine | Claude | Separate `/mcp/plugins/wave`, client metadata registration | Historical six-tool Code discovery and web OAuth setup/tool inventory at 0.3.0; current conversational/UI acceptance unverified | Historical web OAuth connection setup; current sign-in/grant unverified | Unknown | Unknown | Unknown | Unknown | Unknown |
| Robotics Lab | Claude | Separate `/mcp/plugins/robotics`, metadata registration; package 0.4.0 | Historical shared discovery at 0.1.0; current scoped host unverified | Unknown | Unknown | Unknown | Unknown | Unknown | Unknown |

Cursor quantum's prior paid result and independent useful use are **verified**, as supplied by the owner task on October 2; live same-key replay remains unresolved. Private job/receipt/use references and the original key are being requested for provenance and replay; this inventory does not erase the verified stages merely because those details were not inherited here. It does not infer new grants or spending permission. No cell is yet accepted end to end. Host account identity must be read through that exact installed brand connection and compared with the canonical RQM account ID. Another plugin's balance, OAuth session, policy or completed job cannot prove this cell. An advertised execution tool, catalog readiness or a healthy Relay also cannot prove a paid result.

## Verified runtime prerequisites — 17:48 UTC

Core82 is deployed as `a7afdd4aff4674230b9515a696376b9c377d4c98`; Jobs144 as `755584455b35d8fcdbcaeb71ac2b702c236407b7`. All three branded prepaid routes pass the exact six-tool inventory, 20 scoped catalog records each, positive/empty searches and cross-product rejection. Unauthenticated balance reads return HTTP 401 with each brand's own resource metadata. Stable public checks created zero grants and payments. Core health/database and readiness pass, with the public per-call cap still removed and retained controls unchanged.

This package adds three separate portable ChatGPT source candidates and migrates Robotics Cursor/Claude wiring to its verified audience. ChatGPT app registration, actual installation, consent, canonical identity, policy and paid/use/replay acceptance remain separate; no host stage is promoted from protocol evidence.

## Historical endpoint and client audit — before Robotics rollout

Source snapshots: relay-examples main `b4150e3f251133168b4a98c3e427157decea4939`; Jobs main `586e93045edd83f65da06d366397bd4f234ba5f5`; Core main `c3714c273294c1df8cbace7a6ff42b30e4c467f4`. Public checks used no credentials, signer or OAuth provider. Relay runtime was not edited.

- `/mcp/plugins/quantum` and `/mcp/plugins/wave`: existing six-tool prepaid account routes, respectively server-scoped quantum and wave, version 1.7.0. Cursor static client IDs are present in package configs; Claude configs rely on metadata registration. Anonymous catalog/search/no-match checks pass and cross-product inputs are rejected. Protected scopes are `jobs.read`, `jobs.run`, `balance.read`; resource audiences differ by brand.
- `/mcp/plugins/robotics`: HTTP 404 on initialization. Jobs `PLUGIN_PRODUCTS`, discovery-server scoped product type and account-job scoped output mapping currently cover only quantum/wave. Robotics is not a missing folder alone: the equivalent prepaid resource/audience, capability allowlist, Core authorization/client mapping and returned-product checks need implementation and local tests before client migration.
- `/mcp/robotics`: existing product endpoint, version 1.7.0, advertises 13 tools including public discovery and protected robotics execution/retrieval. Public source binds discovery to robotics. It is not the six-tool prepaid plugin route; its legacy resource metadata has issuer `https://account.rqmtechnologies.com` and broader jobs scopes. Do not silently switch the discovery-only plugin to this tool/auth contract.
- `/mcp/chatgpt/quantum`, `/mcp/chatgpt/wave`, `/mcp/chatgpt/robotics`: existing separate named routes, version 0.2.0, each advertising `list_rqm_services`, `search_rqm_services`, `get_rqm_subscription`, `run_rqm_job`, `get_rqm_job`, `get_rqm_result`. They are subscription contracts with `subscription.read`, `subscription.jobs.run`, `subscription.jobs.read`, not the intended current prepaid policy contract. They are not wired by the current ChatGPT brand packages. Current anonymous checks returned 20 scoped records per brand, matching searches (four quantum, five wave, two robotics), empty no-match results and cross-product rejection. This is legacy route evidence only.
- Core confirms the Robotics prerequisite: `plugin_oauth.PLUGIN_RESOURCES` includes only quantum/wave; `agent_resources.AGENT_RESOURCES` maps those to `rqm-studio`/`waveengine` and has no branded robotics audience. The generic credit service already has a Robotics quote branch, so a new backend is not necessary. The bounded client resolver registers only those two Cursor IDs and Claude's exact metadata namespace. Configured static browser clients are a separate path; current deployed ChatGPT prepaid client registration was not inspected and must not be assumed or invented. Relevant files: `plugin_oauth.py`, `agent_resources.py`, `browser_oauth_config.py`, `browser_oauth_service.py`, `agent_credits.py`.
- Current ChatGPT packages live in [Jobs `connectors/chatgpt`](https://github.com/RQM-Technologies-dev/RQM-Jobs-MCP/tree/586e93045edd83f65da06d366397bd4f234ba5f5/connectors/chatgpt). Each `.mcp.json` points to shared `/mcp`; product filtering in skills is guidance, not server-enforced isolation. Preserve these packages until replacement has been reviewed; do not advertise them as isolated prepaid plugins.
- Current Robotics Cursor/Claude configs use identical shared server name `rqm-jobs-discovery`, `/mcp/discovery`, no static client or scopes. Its skill supplies `product: robotics`. That route has two public tools and accepts all three filters. Existing discovery-only namespace reuse is recorded in historical acceptance. Its distinct folder/display name is not an execution isolation boundary.

The generic unsigned RQM Jobs Discovery Desktop archive remains a separate three-tool package. It is not any of these three branded plugins and does not satisfy any branded paid acceptance cell.

## Executable unpaid audit

After `npm ci`, run:

```sh
node scripts/probe-plugin-readiness.mjs
```

This probes six existing/intended scoped endpoints, records server/tool inventory, public catalog/search/no-match behavior and cross-product rejection, and reports missing routes without initiating setup. It never calls a protected or execution tool. Output is protocol evidence, with `hostAcceptance: not tested`, zero grants and zero payments. A missing robotics prepaid route or passing legacy route must remain visible; the script does not silently substitute endpoints. Any unavailable route or failed assertion sets a nonzero exit status; passing legacy checks are still not acceptance of the target prepaid contract.

## Remaining host integration work

Robotics route, exact Core audience/product mapping, client resolver extension, capability allowlist and package wiring are implemented, independently reviewed and tested. Local and hosted CI cover scope, token audience, before-submit refusal, recovery ownership and outages. Reuse these verified routes; do not widen products or substitute a legacy contract.

Audit actual configured ChatGPT registrations and host availability separately. Portable source candidates do not fabricate `.app.json` IDs or establish installation. Use [official OpenAI packaging guidance](https://developers.openai.com/plugins/build/plugins) and [Developer mode connection instructions](https://developers.openai.com/plugins/deploy/connect-chatgpt). Current [Developer mode documentation](https://developers.openai.com/api/docs/guides/developer-mode) describes read/write MCP support and Pro/Plus/Business/Enterprise/Education web eligibility; actual permissions remain unverified.

## Specific owner/host acceptance actions still needed

1. Inspect existing named installed connectors and grants read-only in the selected ChatGPT workspace, Cursor This Mac session and each claimed Claude surface. No signed-in Claude tab was exposed by the available browser tools in this task. Directory drafts and historical grants do not prove installed connections.
2. If a new or changed OAuth grant is needed, the owner must authorize that exact host, product, resource and scopes. No grant is inferred from this inventory or from another host. Robotics resource/client mapping now exists and is reviewed; any new grant still requires exact approval. Host administrators may need to allow developer/custom connectors or local plugin imports; check actual policy first.
3. Canonical account matching and existing policy reads are separate from granting spending. Before any paid acceptance, obtain specific approval for the host/product, canonical account, service, synthetic input, explicit current price ceiling, total budget and expiry. Existing balances, expired Cursor policy and another surface's budget do not authorize spending.
4. Record one terminal result and receipt, explain its bounded useful output, then retrieve that same job using the original key/ID, reconnect and test revocation as separately authorized. No replacement purchase or funding action belongs to replay.
5. Inspect and update existing publisher drafts only after truthful host evidence. Final directory terms/legal attestations, broader access, new grants and purchases require their applicable specific owner action. No duplicate submission, automatic publication or new schedule is created here.
