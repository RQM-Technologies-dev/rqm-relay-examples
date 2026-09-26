# Cursor and Claude submissions

## Release boundary

Publish three discovery packages: Resonant Quantum Mechanics (`quantum`),
WaveEngine (`wave`), Robotics Lab (`robotics`). Submit the shared **RQM Jobs
Discovery** server separately as a Claude MCP connector. The new endpoint is
`https://jobs.rqmtechnologies.com/mcp/discovery`; it must advertise exactly
`list_buyer_jobs` and `search_buyer_jobs`. No account, OAuth, wallet, payment,
execution, funding, cancellation, or local runtime is part of these packages.

The main `/mcp` endpoint exposes additional tools and is not the endpoint for
this release. Existing OpenAI packages and the existing `rqm-jobs` Cursor entry
are separate. Apache-2.0 licenses only the three new package folders.

## Publisher routes

- Cursor: https://cursor.com/marketplace/publish — submit the public repository
  https://github.com/RQM-Technologies-dev/rqm-relay-examples and identify the
  three new entries in `.cursor-plugin/marketplace.json`.
- Claude: https://claude.ai/directory/manage — inspect existing submissions,
  then submit each folder below as **Plugin bundle**, and the new endpoint as
  **MCP connector**. A local MCPB archive is not this submission route.

| Name | Plugin folder | Product |
| --- | --- | --- |
| Resonant Quantum Mechanics | connectors/plugins/resonant-quantum-mechanics | quantum |
| WaveEngine | connectors/plugins/waveengine | wave |
| Robotics Lab | connectors/plugins/robotics-lab | robotics |

Use each folder's `listing.json` for title, description, links and starter
prompt. The shared connector uses the same endpoint and public support issue
tracker. Its documentation is this directory's README; its privacy notice is
`https://github.com/RQM-Technologies-dev/rqm-relay-examples/blob/main/connectors/plugins/PRIVACY.md`.
Authentication: none. No test credentials are necessary for the public catalog.
Choose scheduled update checks and disable automatic publication where offered.

## Acceptance and reviewer prompts

For each host and package, record host version, exact package commit, endpoint,
tool list, actual response, and any connection or policy limitations.

1. Quantum: “Find a service for repairing OpenQASM. Show required inputs and
   limitations. Do not execute or purchase.” Expect a quantum match such as
   `openqasm3-repair-v1`.
2. Wave: “Find a service for signal capture analysis. Show required inputs and
   limitations. Do not execute or purchase.” Expect wave matches such as
   `gate-signal-capture-v1` or `diagnose-multichannel-capture-v1`.
3. Robotics: “Find a service for frame convention validation. Show required
   inputs and limitations. Do not execute or purchase.” Expect a robotics match
   such as `frame-convention-validation-v1`.
4. Browse each product and verify all returned descriptors match its filter.
5. Search `zzznomatchxyz`; report no matches without changing product.
6. Ask to purchase or execute: explain the discovery-only limitation. Do not
   change the endpoint or provide payment credentials.
7. Verify invalid filters and unavailable catalogs return errors rather than
   invented answers; check rate limiting in the local backend test suite.
8. Disable/remove the plugin and confirm the host removes its components.

The shared endpoint intentionally offers all three public families. Product
selection is a relevance rule in each skill, not tenant isolation.

## Submission facts and owner inputs

The package sends short search/list arguments to the declared RQM endpoint.
It contains no executable, file reader, credentials or analytics SDK. The
server's discovery handlers do not persist raw queries, charge accounts, or
execute jobs. The host and infrastructure process normal network metadata.
Do not assert an unverified log-retention period, legal eligibility, or privacy
policy beyond the implemented behavior. Confirm any required owner contact,
retention, audience, and legal attestations before final submission.

Use native Cursor/Claude demonstrations for review. The existing ChatGPT demo
is not evidence of a successful Cursor or Claude installation.

## Current publisher status (2026-09-26)

Cursor displays **Thanks for applying** and confirms receipt of the repository
application requesting all three new branded entries. It exposes no submission
ID or individual entry review outcomes. Approval and publication remain
unverified; scheduled updates and automatic publication settings were requested
in the application but no controls were exposed.

The Claude account is created and signed in. Directory Management displays
**Directory submissions need a paid plan** and names Pro, Max, Team, and
Enterprise as eligible. The current Free account cannot open the three plugin
bundle forms or the shared MCP connector form. Continue after the owner
upgrades or selects an eligible account; then inspect existing drafts before
creating submissions. Claude native host acceptance also remains pending.

## Receipt record

Record in `acceptance.json`: backend commit/deploy, package commit, tests,
host acceptance, submission URL and ID for each listing, submitted time, review
state, approval state and publication state. Unknown or pending steps remain
explicit. A manifest, successful local validation or completed form is not a
submission receipt.

## Official references

- https://prod.cursor.com/docs/reference/plugins
- https://claude.com/docs/plugins/submit
- https://claude.com/docs/plugins/pre-submission-checklist
- https://claude.com/docs/connectors/building/submission
