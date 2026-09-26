# Resonant Quantum Mechanics

Find public quantum service contracts, required inputs, examples and limitations. Discovery only; no computation or payment.

This plugin helps you find relevant RQM services before deciding how to prepare your work. It searches the shared public catalog with the `quantum` filter and explains contracts returned by the service. It does not perform the advertised scientific or engineering jobs.

## Use

After installing in Cursor or Claude, enable the included RQM Jobs Discovery connection. No RQM account, API key, local runtime or wallet is required. Ask:

> Find the Resonant Quantum Mechanics service for repair OpenQASM. Show its required inputs, examples and limitations. Do not execute or purchase a job.

The connection is `https://jobs.rqmtechnologies.com/mcp/discovery`. It exposes exactly `list_buyer_jobs` and `search_buyer_jobs`. The three brands share that connection; only their discovery focus differs. Network availability and host administrator policy can affect access.

If no matching service is returned, the plugin says so. If the catalog is unavailable or rate limited, retry later. Catalog readiness and prices describe the returned records; they do not prove execution availability or establish a binding quote.

## Installation and removal

Cursor: install this package from the RQM marketplace once listed, or copy this complete folder into `~/.cursor/plugins/local/resonant-quantum-mechanics` for local testing and reload Cursor. The Cursor manifest reads `mcp.json`.

Claude Code: use `claude --plugin-dir /absolute/path/to/resonant-quantum-mechanics` for local testing. The Claude manifest reads `.mcp.json`. Once reviewed and published, install through the Claude directory in supported Claude surfaces. A repository package is not proof of directory approval.

Disable or remove the plugin in the host's plugin settings to disconnect it. For a local Cursor test, remove only the copied plugin folder and reload; do not remove unrelated host settings.

## Privacy and support

Read [PRIVACY.md](PRIVACY.md). Use only nonsensitive queries. Support: https://github.com/RQM-Technologies-dev/rqm-relay-examples/issues. Never include credentials, personal data or private customer content in public issues.

## License

Apache-2.0 covers this plugin folder. See [LICENSE](LICENSE) and [NOTICE](NOTICE). Hosted services and proprietary backend code are outside this grant.
