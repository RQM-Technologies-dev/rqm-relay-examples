# RQM Relay buyer examples

Check coordinated I/Q samples before processing or archiving. The default service, `diagnose-multichannel-capture-v1`, returns bounded findings and a `nominal`, `degraded`, or `invalid` state. It does not identify physical causes or diagnose hardware failure.

## Install and check the protocol for free

Use Node.js 22 and npm. No private repository, RQM account, or wallet is needed.

```sh
git clone https://github.com/RQM-Technologies-dev/rqm-relay-examples.git
cd rqm-relay-examples
npm ci
npm run preflight
```

The check reads the public fixture, gets a fresh quote and verifies an unsigned x402 challenge. It performs no paid computation. Exit 0: protocol passed and public admission is open. Exit 2: protocol passed but admission is restricted or paused. Exit 1: check incomplete. Another service: `npm run preflight -- CAPABILITY_ID`.

## Understand the result

[Input](fixtures/multichannel-input.json): two complex channels, four samples each, at 1024 Hz. [Result excerpt](fixtures/multichannel-result-excerpt.json): nominal, with no findings. This is an actual existing operator-funded synthetic validation result retrieved September 10, 2026, not customer evidence. Purchase identifiers and artifact access paths are omitted.

- `nominal`: continue under your own downstream rules; this is not a general quality guarantee.
- `degraded`: inspect findings before processing or archiving.
- `invalid`: correct the capture before relying on the analysis.

Up to eight channels, 1,024 complex samples per channel, and a positive sample rate are supported. See the [live contract](https://api.rqm-relay.com/v1/capabilities/diagnose-multichannel-capture-v1). The kit does not silently truncate large recordings.

## Make one intentional purchase

Check [live status](https://rqm-relay.com/status/) first. This buyer refuses to authorize a new payment while purchasing is restricted or paused. Set an explicit six-decimal spending maximum and privately supply your authorized Base USDC buyer key through the process environment. The key is never sent to RQM.

```sh
mkdir -m 700 ./relay-purchase
export RQM_RELAY_RECOVERY_FILE="$PWD/relay-purchase/recovery.json"
export RQM_RELAY_CAPABILITY_ID=diagnose-multichannel-capture-v1
export RQM_RELAY_INPUT_JSON="$(cat fixtures/multichannel-input.json)"
# Inspect a fresh quote before choosing your ceiling. Example:
export RQM_RELAY_MAXIMUM_PRICE_USD=0.007000
# Set RQM_RELAY_BUYER_PRIVATE_KEY privately in the process environment.
npm run purchase
unset RQM_RELAY_BUYER_PRIVATE_KEY
```

The quote discloses provider price, Relay fee and total. Relay's fee is 5%, with a 0.002-USDC minimum; wallet gas is separate. The buyer validates x402 v2, Base, the published USDC token and receiver, and your maximum. There is no default spending ceiling.

Limits across Jobs and Relay: 1 USDC/call; 5 USDC or 100 operations per payer/day; 20 USDC or 500 operations globally/day; two concurrent operations. Capacity and budget holds can pause new purchases.

The retrieved result and receipt are saved privately as `verified-result.json` next to the recovery file. Console output contains only status and nonsensitive identifiers. Verification checks the signature, input, quote, capability, job, outcome and result hash. The receipt public key comes through authenticated HTTPS; this example does not provide independent out-of-band key attestation.

## Recover without paying again

```sh
# Keep RQM_RELAY_RECOVERY_FILE pointed to the ORIGINAL file.
unset RQM_RELAY_BUYER_PRIVATE_KEY
npm run recover
```

Recovery refuses to create a purchase even if a buyer key is set. Purchase refuses to replace an existing purchase. The original route, body, quote, idempotency key and PAYMENT-SIGNATURE are saved before submission. Recovery retries the same purchase for up to 45 minutes per invocation, including after quote expiry. Resume with the same file after timeout, lost response or restart; never sign again to resolve uncertainty. Respect Retry-After. Settlement can take minutes; no latency promise is made.

Keep the recovery directory mode 0700 and files mode 0600, outside version control. They contain confidential inputs and purchase authorization. Retrieve before the returned access expiry. Retain the original file until delivery or full compensation is verified.

Failed execution receives one full USDC refund including the Relay fee after reconciliation. Pending finality or uncertain execution can delay compensation. `pending` is not a completed refund. Rerun recovery to inspect the updated receipt.

## Discovery and support

[Developer guide](https://rqm-relay.com/developers/) · [Catalog](https://rqm-relay.com/) · [Support](https://github.com/RQM-Technologies-dev/rqm-relay-examples/issues)

Optional: unset `RQM_RELAY_CAPABILITY_ID` and set `RQM_RELAY_PROBLEM` to search Bazaar. Search has no RQM hostname filter; selection then applies this buyer's RQM merchant policy. Supply actual schema-valid input and your spending ceiling. Inspect semantic fit before running. No compatible listing means no payment. Indexing, selection and paid delivery are separate evidence.

Public issues must never include keys, signatures, tokens, recovery files, customer inputs or results. Share the example version, capability ID, Node version and public error code.

## Development

Run `npm run check`. CI never pays. The verifier and recovery format are extracted from Relay `4ec58460bff700defacd77ecc84a89166da3eccd`, with no private workspace dependencies. Backend source remains private. These examples are publicly inspectable; no license to proprietary backend code is granted.

## Find services across providers

```sh
npm run discover -- "document extraction"
```

This free command loads no wallet. Results distinguish `listed`, `connect_directly`, and `run_through_relay`. Descriptions from public registries are provider claims. Connecting directly uses the provider's authentication and terms; Relay does not charge for a directory link.

To check an approved listing, set `RQM_RELAY_LISTING_ID` to its exact returned ID and run `npm run preflight`. Imported outside-provider listings are not approved for Relay purchasing merely because they appear in search.

For an approved purchase, select **either** `RQM_RELAY_LISTING_ID` **or** `RQM_RELAY_CAPABILITY_ID` / problem discovery. Supply the documented input, environment-only buyer key, private recovery path, and explicit six-decimal spending maximum as above. Run `npm run purchase`. The quote must match the selected provider. One payment to RQM covers the provider price plus the greater of 0.002 USDC or 5% of that price. Outside-provider purchasing also requires public admission and all external-payment readiness flags.

If interrupted, run `npm run recover` with the original recovery file. Do not select a different provider, delete the file, or authorize another payment. Existing version-1 recovery files remain supported; newly selected listings also pin provider identity for receipt verification.
