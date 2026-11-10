# RQM ChatGPT hardware release candidate

Status: local 0.6.0 candidate, not submitted or published. Keep the publicly live
0.5.9 listing active. This candidate changes neither its identity nor its endpoint,
OAuth registration, approved artwork, support URLs or legal URLs. Source main's
0.5.4 package lagged the installed 0.5.9; reviewer connection-selection cases and
the named software-operation skill were reconciled from installed 0.5.9. The
host-local `.app.json` binding is deliberately not part of the portable ZIP.

## Separate release gates

1. **Runtime:** the deployed Jobs commit observed November 10 was
   `2c1a1ba0be23151963447d52090f0af112026d28`. The local Jobs candidate on
   `codex/chatgpt-braket-live-parity` makes hardware definitions stable under mixed
   authentication while moving account discovery into every call. Review and
   release that change on the deployed lineage; do not deploy stale `main` over
   other deployed features. No hardware authority is enabled by this change.
2. **Tool review:** OpenAI documents anonymous `initialize`/`tools/list` in
   [mixed authentication](https://developers.openai.com/api/docs/guides/custom-mcp-server#how-to-use).
   Verify anonymous definitions and OAuth-only hardware metadata in the candidate.
   Production must complete continuous tool review; a successful reconnect does
   not prove a published catalog refreshed. Do not duplicate a scheduled scan
   recheck or withdraw the current listing to force review.
3. **Package:** validate and build the candidate with `npm run publication:pack`.
   Confirm version availability and review the exact archive before an update to
   the existing listing. Imported skills and listing changes require a new version,
   review and publication according to
   [OpenAI's metadata guidance](https://developers.openai.com/plugins/deploy/connect-chatgpt#refresh-metadata).
   The historical software demo URL is not evidence of hardware acceptance.
4. **Account:** use only the selected authorized account. The connected account
   observed November 10 had no available funds. Funded-account eligibility is a
   separate Core policy requirement; tool visibility must not waive it. No funding,
   grant, policy change or paid test is authorized by this candidate.
5. **Native acceptance:** first verify tool selection, rejected unauthenticated and
   ineligible calls, eligible discovery and bounded planning. Then, only with a
   separately approved finite canary budget and exact-device quote, verify one
   submission, original-key recovery, verified QPU result and original receipt.
   Compare Claude using its own approved client identity; cross-client result
   access is not implied. Never replace uncertain jobs or substitute simulation.

## What this package changes

The public description and long copy preserve installed 0.5.9 positioning, with
one necessary correction: replace the categorical hardware exclusion with a
statement that software-analysis results alone do not establish hardware evidence.
The short description and starter prompts remain unchanged. A marketing rewrite is not required. The internal skill routes
hardware requests to the existing discovery/plan/quote/submit/recover/result flow.
It preserves software workflows and explains that result retrieval can acknowledge
delivery and settle the original approved charge. The privacy notice now discloses
Braket processing and hardware recovery records. The positive hardware review case
stops at discovery and eligibility; it cannot authorize a charge.

No upload, marketplace attestation, Actions run, deployment, production
authentication change, financial-policy change or paid hardware run is included
in the local checks. Passing package validation means structurally valid, not
submission-ready or end-to-end hardware-qualified.

Core production already includes the authenticated identity API at deployed commit
`1bb8d19689f2a72b4d9f17bb98812efe431beb2f`; browser recovery reuses it without
a funded-discovery prerequisite. No Core change or deployment is required.
Scoped machine OAuth retains its existing discovery path.
