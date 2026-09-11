# Use RQM Jobs in your agent

Find a bounded check for coordinated I/Q samples before further processing or
archiving. Start with `diagnose-multichannel-capture-v1`, inspect its input
contract and synthetic example, and decide whether its findings answer your
question. A `nominal`, `degraded`, or `invalid` result is a bounded assessment of
the supplied capture, not evidence of physical causes or hardware failure.

## Install paths

| Host           | Package or setup                                                                                                                            | Current limit                                                                                                                                                           |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Claude Desktop | Build the [RQM Jobs Discovery MCPB](claude-desktop/) below; open the `.mcpb` file and review the install prompt.                            | Three free discovery tools; no wallet or paid execution.                                                                                                                |
| Cursor         | [Native MCP configuration](cursor/mcp.json), [plugin manifest](cursor/.cursor-plugin/plugin.json), and the install link below.              | Live direct connection rejected default 2025 protocol negotiation on September 11; requires the Jobs compatibility release. Installation alone does not enable signing. |
| Claude.ai      | Settings → Connectors → Add custom connector; use `https://jobs.rqmtechnologies.com/mcp`.                                                   | Remote setup, not an installable Desktop bundle. Host connection and OAuth still need acceptance testing after the compatibility release.                               |
| Grok           | [Connectors](https://grok.com/connectors) → New Connector → Custom; use `https://jobs.rqmtechnologies.com/mcp`.                             | No vendor-supported import manifest or one-click custom URL was established by the cited documentation. Host/payment acceptance remains unverified.                     |
| ChatGPT        | Enable Developer mode where available; [Plugins](https://chatgpt.com/plugins) → plus → public MCP URL. See the [host guide](host-guide.md). | Developer testing only. The current published-plugin commerce policy excludes selling digital services. No paid directory route is claimed.                             |

MCP endpoint: `https://jobs.rqmtechnologies.com/mcp`. Discovery is anonymous.
Do not enter the operator's Account Core growth credential or a buyer private
key into a connector URL, manifest, prompt, or tool argument.

<!-- cursor-install:start -->

[Add RQM Jobs to Cursor](https://cursor.com/en/install-mcp?name=rqm-jobs&config=eyJ1cmwiOiJodHRwczovL2pvYnMucnFtdGVjaG5vbG9naWVzLmNvbS9tY3AifQ%3D%3D)

<!-- cursor-install:end -->

The Cursor link asks Cursor to review a remote MCP configuration. It contains
only the server name and HTTPS endpoint; no commands, keys, or payment approval.
If a connection reports unsupported protocol version `2025-11-25`, the Jobs
compatibility release has not reached that endpoint. Retain the error for
[public support](https://github.com/RQM-Technologies-dev/rqm-relay-examples/issues),
without including credentials or inputs.

## Build the Claude Desktop install pack

From a clean checkout, with Node 22:

```sh
cd connectors/claude-desktop
npm ci
npm run pack
npm run probe:live
```

Open `rqm-jobs-discovery.mcpb` in Claude Desktop, review the extension details,
and complete installation. No user configuration or key is required. The archive
bundles its runtime JavaScript and does not need npm or private repositories on
the recipient's machine. Claude Desktop supplies Node; the bundle requires Node
22 or later. Generated binaries are CI artifacts, not committed source.

The bundle bridges the desktop MCP protocol to Jobs' current remote revision.
It exposes `list_buyer_jobs` and `search_buyer_jobs` against the live service,
plus `get_multichannel_example` from the bundled, dated synthetic input/result pair.
It does not expose execution, funding, wallet access, or receipt retrieval.
See its [privacy notice](claude-desktop/PRIVACY.md).

Validation distinguishes the packaged stdio protocol probe from installation in
the Claude Desktop UI. A passing probe is not a claim of native UI acceptance.
macOS and Windows UI acceptance remain release checks.

## First conversation

> Find the RQM multichannel capture diagnostic. Show me its supported input
> shape, synthetic example, limits, and how nominal, degraded, and invalid
> findings affect my next step. Do not buy or execute anything.

Expected: the host searches buyer jobs, identifies the multichannel service,
reads its contract/example, and explains the findings. No key or payment is
needed. The existing [free Relay protocol check](../README.md#install-and-check-the-protocol-for-free)
remains available for developers; an unsigned challenge does not execute a job.

## Paid execution is a separate capability

Jobs already accepts an x402 authorization in MCP `_meta["x402/payment"]` and
returns purchase/retrieval data. These install packs do not create that
signature. The [paid-run implementation plan](paid-run-plan.md) defines the
remaining host-side authorization and recovery work. The existing standalone
[buyer and recovery commands](../README.md) remain supported.

Directory inclusion requires a separate vendor review. None of the supplied
manifests, links or artifacts establishes a Claude, OpenAI, Cursor, or Grok
listing. See the [directory preparation checklist](directory-readiness.md).
