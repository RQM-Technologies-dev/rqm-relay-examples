# Resonant Quantum Mechanics

Discover and run bounded quantum computations through RQM Jobs using your existing RQM subscription allowance. Public catalog discovery needs no account. Computation, allowance, job status and results require signing in to an eligible RQM account through the host's OAuth flow. A Claude Pro or Cursor plan does not itself include RQM service allowance.

## Installation

This folder is a self-contained Cursor and Claude plugin. Cursor reads `.cursor-plugin/plugin.json` and `mcp.json`; Claude reads `.claude-plugin/plugin.json` and `.mcp.json`. Both connect to `https://jobs.rqmtechnologies.com/mcp/plugins/quantum`. Cursor uses a public client ID (not a secret); Claude uses its client metadata registration. No local executable or wallet is included.

## Tools and use

- `list_rqm_services` and `search_rqm_services`: service IDs, descriptions, input schemas, outputs and limitations for `product: quantum`.
- `get_rqm_subscription`: current included usage.
- `run_rqm_job`: one authorized, idempotent computation against existing allowance.
- `get_rqm_job` and `get_rqm_result`: status and verified results for the connected account's operation.

Start with “Find a service for repair OpenQASM; show the inputs and limitations.” Then “Check my included RQM allowance.” After reviewing a real schema and supplying nonsensitive inputs, explicitly ask to run that specific computation and inspect its result. No example text is evidence that a live job completed.

Inactive or exhausted allowance stops execution without an extra charge. There are no purchase, transfer, funding or cancellation tools. Search matches and accepted jobs are not completed computations. Results are bounded software evidence; no hardware, safety, certification or advantage claim is implied. Empty searches, invalid input, rate limits and outages are reported honestly.

## Privacy and support

See [PRIVACY.md](PRIVACY.md). Do not put private inputs, results, credentials or personal information in [public support issues](https://github.com/RQM-Technologies-dev/rqm-relay-examples/issues). Private support: jvg@rqmtechnologies.com.

## Release status

Version 0.2.0 prepares the subscription computation integration. Submission, host authentication acceptance, successful live computation, review approval and publication are separate gates; consult [submission tracking](../SUBMISSION.md). The previous discovery-only acceptance does not validate this version.

Apache-2.0 covers only this plugin folder. RQM services and backend software retain their existing licensing and account terms.
