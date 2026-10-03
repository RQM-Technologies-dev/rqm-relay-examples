# ChatGPT public publication preparation

Current package draft: **0.5.2**, described in [DISCOVERY.md](DISCOVERY.md). The three new public drafts use generic package names; legacy record variants are not for those drafts. The material below records the earlier 0.5.1 publication investigation and does not establish current portal state.

These three packages are reviewable preparation artifacts, not proof of OpenAI approval. The live portal worker reports three separate v0.1.0 records already In review and Not published in RQM Technologies / RQM Studio. Business identity and domains are verified. Submitted legacy MCP paths /mcp/studio, /mcp/waveengine and /mcp/robotics show No authentication, Needs attention / Complete MCP setup and Tools Not live; uploads are disabled during review. Preserve those IDs and use the supported self-service correction route. Reviewer fields were inaccessible and remain unverified, not absent. PR22 package contents were not established as the submitted version. User declined support outreach; no message was sent. Their existing six-tool MCP endpoints and skills remain unchanged. No public upload, policy attestation, legal acceptance, distribution activation, grant, credential or runtime change is authorized by this PR.

## Package and listing format

Each ZIP contains root `plugin.json`, `mcp.json`, `skills/`, bundled original PNG artwork and the package notices. Identity uses Agent Plugins 1.0.0; OpenAI listing metadata is in `plugin.json` → `extensions.com.openai.interface`. `logo` and `composerIcon` are `./` paths to the actual packaged PNG. Public MCP `serverInfo.icons` is separate from listing metadata and is not proof of a graphical host listing. No `.app.json`, invented registration ID, lifecycle hook or standalone Codex overlay is included.

| Package | Display name | Product audience | Official artwork SHA256 |
| --- | --- | --- | --- |
| resonant-quantum-mechanics | Resonant Quantum Mechanics | /mcp/plugins/quantum | 59c0e77394f411979214606d8c19af7e90a2735d84154e9390aab8c3e9f9e354 |
| waveengine | WaveEngine | /mcp/plugins/wave | dab197da82677d489445c1322c0583f837fed5e54ae288bb1c953d749e722633 |
| robotics-lab | Robotics Lab | /mcp/plugins/robotics | d94a23433575108391242b81d9a494e9aa1c4dbfc13e10ac36f0e3df20f1fa88 |

Names and subtitles meet the documented 30-character submission limits. The descriptions distinguish public discovery, existing job retrieval and policy-gated prepaid computation without claiming hardware execution, physical safety, marketplace acceptance or performance advantage. Original Quantum/Wave provenance is recorded beside their PNGs; Robotics uses the current approved metal-only gimbal.

Run `npm run publication:check` for offline schema/metadata/asset checks. Run `npm run publication:pack -- /absolute/output/directory` to create deterministic ZIPs and a readiness report. The fixed file allowlist excludes other hosts, runtime files, secrets and review-account credentials. `npm run publication:check -- --require-submission-ready` intentionally fails while the documented blockers remain. The custom OpenAI-field checks are a documented-field preflight, not an authoritative replacement for dashboard validation.

## Release gates

| Gate | Current evidence | Required before public submission |
| --- | --- | --- |
| Portable package and MCP schema | Vendored official 1.0.0 schemas; local validation | Run platform upload validation after owner review |
| Listing images | Three byte-identical original PNGs, square, under 5 MiB | Inspect imported listing graphics; metadata does not prove host rendering |
| Publisher website | Public HTTPS www.rqmtechnologies.com, RQM publisher identity | Confirm it adequately describes each submitted product |
| Customer support | Verified HTTPS prepaid support notice and existing private contact addresses | No response-time promise; do not post private data in public issues |
| Privacy | Verified HTTPS prepaid privacy notice discloses durable Core content and no automatic expiration schedule | No invented automatic cleanup or universal deletion promise |
| Terms | Verified HTTPS prepaid service notice preserves existing generic/purchase and subscription terms | No new price, refund, credit-expiration, cancellation or delivery promise |
| Commerce classification | Current run_account_job debits prepaid credits per job | Resolve digital-services/credits policy question; no false commerce=false declaration |
| Publisher/project | Browser worker reports business approved and RQM Technologies / RQM Studio selected; remaining permission/residency checks are separate | Verified developer identity, correct owner organization/project, Apps Management Write and eligible residency |
| Category | Developer Tools is a documented example, not a verified portal selection | Confirm the exact available dashboard category |
| Domain verification | Browser worker reports existing domains verified; new OAuth path migration must preserve records | Plan separate eligible challenge origins/hostnames if needed; never replace another app's token |
| Distribution countries | Deliberately omitted | Owner determine lawful supported countries; do not infer from old subscription US terms |
| Reviewer access | No account created or credentials included by this package task; portal fields inaccessible and unverified | Dedicated synthetic test account with correct scopes/data, usable without MFA or private network |
| Five positive / three negative cases | Proposed in each manifest, not dedicated-account executed | Execute every case with reviewer account and retain redacted evidence |
| Walkthrough | No recording URL in this draft package; current submitted field remains unverified | Record/review a reviewer-accessible walkthrough; no invented URL |
| Runtime paid acceptance | Coordinated separately in main conversation | Use that owner's dated evidence; this PR does not perform paid tests or claim repair success |
| Final attestations | None accepted | Owner review, then explicit authorization before platform attestations/submission |

## Verified URL findings

On 2026-10-02, anonymous HTTPS checks returned 200 for the publisher homepage and existing GitHub privacy/support pages. A 200 SPA shell alone is not legal-content verification. The homepage-loaded route source identifies `/rqm/privacy`, `/rqm/terms` and `/rqm/support`; its public `RqmSubscriptionPages-C1_4qS6H.js` content explicitly covers the three products as a legacy subscription.

That legal text advertises $2.50/month, ten completed jobs and fifteen attempts, and 30-day input/result retention. Current package privacy notices instead describe prepaid-credit reservations and durable execution/recovery/ledger storage, explicitly without asserting the legacy 30-day result cutoff. These statements conflict for the current prepaid package. The legacy terms URL is therefore not inserted into the manifest. Do not invent a refund policy, legal effective date, retention interval, countries, or revised terms in package metadata. Missing matching terms remains a blocking review item.

## Proposed review cases and evidence boundaries

Each package imports five positive cases (list, search, explain schema/limits, dedicated-account balance, existing-job list) and three negative cases (funding/checkout, cross-account/product bypass, unapproved computation). They are proposals, not an executed reviewer test report. Public `tools/list` and one `list_buyer_jobs` call per product were inspected anonymously; no protected tool, grant, signer or paid call was used. No checkout, top-up, subscription upgrade or funding CTA was found in those public results. Existing catalog links point to legacy product executors; the skill instructs against switching endpoints, but a public-specific surface should remove those irrelevant execution links. Source/error audit is in [TOOL-AUDIT.md](TOOL-AUDIT.md).

The proposed cases do not exercise run_account_job or get_account_job. That coverage gap must be resolved after policy classification: do not claim a six-tool app has complete acceptance just because five submitted cases are present. Preserve the existing key for recovery of any separately approved paid test; do not spend again to manufacture reviewer evidence.

## Minimal ChatGPT-specific surface proposal — not implemented

The guidelines currently prohibit sales of digital products/services, tokens and credits, including indirect upsells, while allowing features already included in an existing subscription. A purchase/debit per compute request is not automatically equivalent to that subscription exception. Do not hide the debit behind a renamed tool, suppress an honest price warning, claim commerce=false, or silently waive/change fees.

A conservative publication alternative is a separately approved public ChatGPT profile exposing only `list_buyer_jobs`, `search_buyer_jobs`, `get_account_job` and `list_account_jobs`: inspect noncommercial capability schemas and retrieve already-owned results, without starting any new job. Omit run_account_job and get_account_balance; remove prices/offers, purchase CTAs, funding/upgrade links and unrelated direct-executor URLs from public discovery; use neutral existing-results wording and minimum jobs.read authorization. Enforce this on the server, not merely in a skill or client tool toggle. Distinct public endpoints/client scopes and any resulting grants would need approval; none is fabricated in these manifests. Preserve current private prepaid connectors and all Cursor/Claude surfaces. This is a proposal for review, not a guarantee of policy approval.

If paid compute is the required public product, obtain an explicit review interpretation or choose an owner-approved entitlement design before submission. External support contact is a separate approval step. Do not weaken runtime controls or change economics as a packaging shortcut.

## Source-of-truth references

- [Package guide](https://developers.openai.com/plugins/build/plugins)
- [Submission and exact field reference](https://developers.openai.com/plugins/deploy/submission)
- [Remote MCP review requirements](https://developers.openai.com/plugins/deploy/app-review)
- [Plugin guidelines and commerce policy](https://developers.openai.com/plugins/plugin-guidelines)
- [Portable plugin schema](https://agent-plugins.org/schemas/1.0.0/plugin.schema.json)
- [Portable MCP schema](https://agent-plugins.org/schemas/1.0.0/mcp.schema.json)

Checked 2026-10-02. Platform validation and policy review remain authoritative; recheck current requirements before upload.

## Current correction decision

Keep the current prepaid implementation truthful, without inventing an automatic deletion/refund promise. The separate Storefront patch adds three current-behavior notices, local CSP-safe CSS and exact routing exclusions; it preserves subscription pages and all security headers. Listing descriptions explain useful product functions without subscription/pricing promotion. Spending warnings remain in tool/skill consent flows. No new commerce declaration, fee waiver, entitlement design, grant or runtime change is introduced. Public policy acceptance remains unconfirmed. Storefront PR41 merged as 61706bf724919944a548ce24dad0bf78cd446599 after final content approval. Its normal production deployment succeeded. On October 3, all three notices and local CSS returned HTTPS200 and matched approved source bytes, with correct content types and unchanged security headers. Package supportURL, privacyPolicyURL and termsOfServiceURL now point to those verified public notices. The protected preview was not verified and no protection bypass was used.

## Existing portal record ZIP variants

The portal rejected a product slug when updating an existing record: its root `plugin.json` name must preserve the original record name. Run `npm run publication:pack -- /absolute/output --portal-records` to generate deterministic `*-0.5.1-portal-record.zip` variants for the three existing records. Only the root manifest name changes to the fixed `app-...` record name; generic source identities, display branding, version, URLs, MCP configuration, skills, artwork and safeguards remain unchanged. Portable schemas validate those names, and tests compare every other file byte-for-byte. Use the variant matching the existing record; this neither creates a new record nor attests review readiness.
