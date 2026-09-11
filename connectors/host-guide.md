# Host setup and acceptance

Documentation checked September 11, 2026. Setup, directory review, authentication,
and paid execution are distinct checks.

- **Claude Desktop:** use the supplied MCPB for anonymous discovery. Remote
  connectors are also supported across Claude surfaces. The MCPB is deliberately
  limited to discovery and does not ask users to manage an operator credential.
  [Claude MCPB documentation](https://claude.com/docs/connectors/building/mcpb)
  and [remote versus local connectors](https://support.claude.com/en/articles/11725091-when-to-use-desktop-and-web-connectors).
- **Cursor:** use the generated native install link or `mcp.json`. A plugin
  package and marketplace manifest are provided for submission preparation.
  [Install links](https://prod.cursor.com/docs/mcp/install-links) and
  [plugin reference](https://prod.cursor.com/docs/reference/plugins).
- **Grok:** use New Connector → Custom in `grok.com/connectors`, then the public
  Jobs MCP URL. Team users may need an administrator to provision it. We have
  not verified a public custom-connector manifest import format, directory
  submission channel, or host-native x402 signing capability.
  [Grok connectors](https://docs.x.ai/grok/connectors) and
  [team management](https://docs.x.ai/grok/connector-management).
- **ChatGPT:** current OpenAI documentation uses Plugins. For developer testing,
  enable Settings → Security and login → Developer mode if available, then add
  the MCP URL through the plus button in Plugins. Review discovered tools before
  use. Account/workspace policy may restrict availability. A custom connection
  is not a reviewed public listing. No Actions schema or legacy plugin manifest
  is required for this MCP path.
  [Connect and test](https://developers.openai.com/plugins/deploy/connect-chatgpt).

OpenAI's published-plugin guidelines currently permit commerce only for physical
goods and prohibit selling digital services, tokens or credits. Access to
features already included in an existing paid subscription is described
separately. That does not establish permission for debiting metered RQM credits.
Do not submit the present paid Jobs endpoint as a compliant digital-service
checkout or hide a purchase behind a discovery label. A ChatGPT directory release
needs a useful free or eligible existing-account surface with enforced tool
boundaries, then policy review. Those surfaces are not implemented by this pack.
[OpenAI commerce rules](https://developers.openai.com/plugins/app-guidelines#commerce-and-monetization).

For each host, record its version/account tier, connector package commit,
negotiated protocol, visible tools, the first free search and synthetic example,
error handling, and uninstall behavior. For OAuth, verify discovery, PKCE,
resource binding, consent, refresh and revocation. Published OAuth metadata alone
is not proof that sign-in or paid-account eligibility works.

Only a separate paid acceptance run can demonstrate one approved collection,
one result, a verified receipt, restart recovery, and no duplicate accounting.
Do not put secrets, customer inputs, signatures, or retrieval tokens in public
evidence. Use [public issues](https://github.com/RQM-Technologies-dev/rqm-relay-examples/issues)
for nonsensitive host version, timestamp, error code and connector commit.
