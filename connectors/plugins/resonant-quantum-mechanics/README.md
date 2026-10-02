# Resonant Quantum Mechanics

Discover and run bounded quantum circuit jobs with prepaid RQM credits and an owner-saved spending policy. No RQM subscription is required. Public catalog discovery is anonymous. Balance and job history require an authenticated RQM account. Execution also requires sufficient prepaid credits and an active owner-saved spending policy. Reuse a valid existing OAuth grant. A Claude or Cursor subscription does not fund RQM credits.

## Installation

This folder is self-contained. Cursor reads `.cursor-plugin/plugin.json` and `mcp.json`; Claude reads `.claude-plugin/plugin.json` and `.mcp.json`. Both use `https://jobs.rqmtechnologies.com/mcp/plugins/quantum`. Cursor's client ID is public, not a secret. Claude uses its client metadata registration. The package has no executable, wallet or credential store.

## Cursor connection and account check

Use a **This Mac** chat for the local Cursor connection. A Cloud chat has a separate execution environment; it cannot read a local Mac acceptance file or assume the local MCP connection is available.

Choose one source for this server: the installed plugin **or** the User configuration in `~/.cursor/mcp.json`. If both sources appear for the same server, inspect them and disable the duplicate source; preserve unrelated servers. For a manual native connection, merge this entry into the existing `mcpServers` object:

```json
{
  "rqm-quantum": {
    "url": "https://jobs.rqmtechnologies.com/mcp/plugins/quantum",
    "auth": {
      "CLIENT_ID": "rqm-cursor-quantum",
      "scopes": ["jobs.read", "jobs.run", "balance.read"]
    }
  }
}
```

The static client ID is public and has no client secret. Cursor's desktop callback is `http://localhost:8787/callback`; see [Cursor static OAuth documentation](https://prod.cursor.com/docs/mcp#static-oauth-for-remote-servers). Sign in with the intended RQM account. A connected indicator proves a connection, not which funded account it uses. **Logout** in the RQM connection settings changes the sign-in; **Reload** alone may retain it. New consent and spending authorization are separate owner actions.

Before funding or executing, call `get_account_balance` only and compare its account ID with the canonical RQM account ID on the [credits page](https://www.rqmtechnologies.com/account/credits). Do not infer identity from the host profile, payment method email or balance amount. If IDs differ, reconnect to the intended account before proceeding. Check the saved agent principal, allowed services, limits and expiry on that page. Reading a balance does not require enabling spending.

## Six tools

- `list_buyer_jobs` and `search_buyer_jobs`: public quantum contracts, required inputs, examples, price information and limitations. Discovery is not a binding quote or completed computation.
- `get_account_balance`: the connected account's prepaid balance.
- `run_account_job`: reserve credits and submit one job within the saved spending policy and explicit `max_total_price` ceiling.
- `get_account_job`: recover the original job, status, result and receipt by `job_id`.
- `list_account_jobs`: find this client's quantum jobs, optionally by the original idempotency key.

Inspect the actual service schema before supplying inputs. Approve the inputs and price ceiling before execution. Funding, wallet signing, cancellation and other products are unavailable. If credits, policy, budget or dependencies are unavailable, stop; never change payment methods. Use the existing account site to manage a policy or fund credits as a separate owner action.

After a timeout, use the same connector's `list_account_jobs` with the original key or `get_account_job` with the returned ID. A retry must preserve the key, inputs and price ceiling; changed input conflicts. Never make a replacement purchase to recover an uncertain response. Search matches, reservations and queued jobs do not prove completion; report actual terminal status and receipt. Results provide bounded software evidence, not hardware, safety, certification or quantum-advantage proof.

## Privacy and support

[Privacy notice](PRIVACY.md). Raw inputs are excluded from application diagnostic logs; necessary execution inputs, results and financial records are durably stored. Private support and privacy requests: jvg@rqmtechnologies.com. Keep inputs, credentials and receipts out of [public issues](https://github.com/RQM-Technologies-dev/rqm-relay-examples/issues).

## Release status

Version 0.3.0 is a candidate pending coordinated release and host acceptance. [Submission tracking](../SUBMISSION.md) distinguishes source validation, hosted acceptance, submission, approval and publication. Earlier discovery-only or subscription tests do not validate this release. No host surface is claimed accepted until its evidence is recorded.

Apache-2.0 covers this plugin folder only. Backend software and service terms retain their existing licenses.
