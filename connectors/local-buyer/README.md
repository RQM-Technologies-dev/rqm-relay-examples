# Buy and recover a multichannel diagnosis inside a local MCP host

This local buyer lets an agent prepare, purchase and retrieve
`diagnose-multichannel-capture-v1` with standard MCP tools. It uses the existing
Relay HTTP purchase path. The human approves the exact quote in the host; the
key stays in the local process environment. No custom TypeScript buyer script
is needed.

**Acceptance status:** standard MCP protocol tests cover confirmation, signing,
submission, receipt verification and restart recovery against a simulated
payment service. Native host approval UI and a live paid host run require
separate acceptance. A successful free check proves neither.

## Install

Use Node 22. From a clean checkout of this public repository:

```sh
npm ci
npm run check
npm run mcp:install
```

The install command prints a Cursor install link and the local configuration
using your actual Node and checkout paths. It includes no environment values or
credentials. Review the configuration in Cursor when opening that link.

Alternatively add the following local server to Cursor's `.cursor/mcp.json` or Claude
Desktop's local MCP configuration. Replace both paths with absolute paths.
The host should launch Node directly; `npm run` writes banners to stdout,
which is reserved for the MCP protocol.

```json
{
  "mcpServers": {
    "rqm-local-buyer": {
      "command": "/absolute/path/to/node",
      "args": ["/absolute/path/to/rqm-relay-examples/dist/host-mcp.js"]
    }
  }
}
```

Cursor documents [elicitation support](https://prod.cursor.com/docs/mcp).
Claude Desktop is a local configuration target, but its actual advertised form
elicitation and approval UI must be checked in the installed version. The buyer
refuses new purchases if the host does not advertise this capability. A remote
Jobs install link, Claude.ai, ChatGPT or Grok connection does not install this
local buyer or gain access to its key.

## Free first

Ask the host to call `get_multichannel_example`, then `check_multichannel`.
These tools load no signer and require no key. The live check reports the
provider price, Relay fee, total and public admission state. At the September
11 inventory the quote was 0.005000 + 0.002000 = **0.007000 USDC**; use the
current quote, not this dated example, for approval.

You can also run `npm run mcp:check:live` to launch the built stdio server through
a standard SDK client with wallet variables deliberately excluded. This checks
the live unpaid challenge and quote preparation without invoking purchase.

For your own request, call `prepare_multichannel_purchase` with:

- `purchaseId`: a new UUID chosen once for this intended purchase;
- `input`: the structured capture, following the public example and contract;
- `maximum`: an explicit six-decimal USDC ceiling no greater than `1.000000`.

Reuse that UUID on retries. Preparation validates the input and the unsigned
challenge, pins the provider, contract, input hash, quote, route and expiry, and
saves the intent privately. It does not authorize payment.

## Authorize one purchase

For new purchases the **server process** must inherit:

- `RQM_RELAY_BUYER_PRIVATE_KEY`: a buyer-controlled Base wallet key, held only in
  the environment. Do not enter it into chat, tool arguments, JSON configuration,
  source, a repository `.env` file, support issues, or seller settings.
- `RQM_RELAY_MAXIMUM_PRICE_USD`: the user's explicit ceiling, such as `0.010000`.
  The requested maximum cannot exceed this configured ceiling or 1 USDC.
- Optionally `RQM_HOST_RECOVERY_DIR`: an absolute private directory owned by
  the user, mode 0700. Default: `~/.local/share/rqm-relay/purchases`.

Provide the key through your existing environment/secret launcher and start
the local host so its MCP subprocess inherits it. A GUI app already running
will not inherit variables set later in a terminal. There is intentionally no
key field in the MCP tools or install configuration.

Call `purchase_multichannel` with the saved `purchaseId`. It asks the host to
display the provider price, RQM fee, total, network/receiver, maximum, expiry and
request hash. **Only the user's affirmative confirmation authorizes signing.**
Leave automatic responses to this buyer's elicitation requests disabled. A
tool-call approval or installation is not the payment confirmation.

After confirmation, the buyer rechecks admission, contract and challenge. A
changed price, destination, provider, schema or expired quote stops before
signing. The signed authorization is fsynced in `recovery.json` before the first
paid HTTP request. A durable exclusive signing marker prevents concurrent or
restarted processes from creating another authorization for that purchase.

The first-party route is fixed. This version does not purchase from outside
providers, switch providers, fund wallets, sweep funds, or change backend
financial limits. Account Core remains the financial authority.

## Recover and retrieve

If delivery is pending, a response is lost, the host restarts, or receipt
verification is incomplete, call **`recover_purchase` with the original
`purchaseId`**. This needs no buyer key, configured spending maximum or new
confirmation. It replays only the saved original body, route, idempotency key
and payment authorization. It never re-quotes or signs.

The buyer saves accepted delivery access privately, polls the job and validates
the result against the pinned output schema. It verifies the signed receipt
and its request, provider, price, execution and settlement identities. The host
receives the verified result, receipt ID and refund state. Payment signatures,
access tokens and private recovery files never enter tool output.

`execution_pending` or `recovery_required` means continue the same recovery.
A failed result with a pending refund or credit remains unresolved; the buyer
does not equate credit with a finalized cash refund. Relay/Core's existing
recovery handles full-total refunds. The buyer reports their signed state; it
cannot initiate a new refund or independently verify its on-chain finality.

Keep the entire purchase directory, including `intent.json`, `recovery.json`,
`accepted.json`, `signing-started.json` and `verified-result.json`. These are
private customer data and must never be committed or sent to support. The
`recovery.json` retains the existing version-1 buyer-kit format and can also be
recovered with the existing `npm run recover` command and
`RQM_RELAY_RECOVERY_FILE` pointing at it.

An interruption during signing **before a recovery file exists** produces
`signing_interrupted_reconciliation_required`. Nothing can be submitted without
a saved authorization, but the buyer still refuses to sign again for that ID.
Retain the directory and reconcile the interrupted operation; do not delete
the marker to make an automatic retry spend again. An expired unsigned quote
requires a newly prepared purchase and a new human confirmation.

## Support and limits

[Open a public issue](https://github.com/RQM-Technologies-dev/rqm-relay-examples/issues/new/choose)
with only the host/version, tool name and nonsensitive error code. Never include
keys, signatures, input captures, outputs, tokens or recovery files.

The diagnosis accepts at most eight channels and 1,024 complex samples per
channel. `nominal`, `degraded` and `invalid` are bounded data findings for deciding
whether to proceed, inspect or repair input. They do not identify physical
causes or establish hardware failure, safety or performance.
