# Current discovery plugin submissions

The Cursor and Claude discovery release is documented in
[plugins/SUBMISSION.md](plugins/SUBMISSION.md). It uses three branded packages
and a shared two-tool `/mcp/discovery` endpoint. The earlier Desktop MCPB is
retained for existing users; Claude now requires local MCP servers to be
packaged as plugins for new directory submissions.

No submission, approval or publication is established by repository files.
See [plugins/acceptance.json](plugins/acceptance.json) for exact evidence.

## Historical preparation (September 11, 2026)

The following checklist describes the earlier connector work and is not the
current Cursor/Claude release checklist.


| Directory | Prepared here                                                                 | Remaining before submission                                                                                  |
| --------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Claude    | Desktop MCPB source, reproducible build, free workflow, privacy/support links | macOS/Windows UI acceptance; release artifact; owner review of directory terms; full submission checks       |
| Cursor    | Plugin and marketplace manifests; native install link                         | Jobs compatibility deployment; actual host install and tool validation; owner submission                     |
| OpenAI    | Current setup/policy inventory                                                | A useful policy-eligible service surface and OAuth acceptance; current paid digital checkout is not eligible |
| Grok      | Documented custom-connector setup                                             | Actual host acceptance and a verified vendor publication route                                               |

No submission or listing approval is claimed. The MCP Registry, Coinbase Bazaar,
Claude Connectors Directory, Cursor Marketplace and OpenAI plugin directory are
independent catalogs. A generated manifest does not publish into any of them.

For Claude, authenticated directory services require OAuth 2.0; include tool
titles/annotations, clear examples, support and privacy information. Review
[Claude's requirements](https://claude.com/docs/connectors/building/submission).
The supplied local bundle is free and anonymous; its user-visible functionality
must match its three-tool allowlist.

For Cursor, the public example repository includes `.cursor-plugin/marketplace.json`
and `connectors/cursor/.cursor-plugin/plugin.json`. Validate and test the package,
then review [Cursor's publication steps](https://prod.cursor.com/docs/reference/plugins).
Backend repositories remain private; submit only the public connector package.
