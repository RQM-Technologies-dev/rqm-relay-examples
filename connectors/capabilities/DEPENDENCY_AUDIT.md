# Narrow adapter dependency remediation, 2026-10-17

The audit grouped four affected packages; `ip-address` carries two distinct
advisories, so there are five advisory IDs. No application, authentication,
payment, product contract, source snapshot, or host-package behavior is changed.

| Package / dependency path | Installed before | Affected range / minimum fixed | Selected |
| --- | --- | --- | --- |
| Direct `@modelcontextprotocol/sdk` | 1.30.0 | >=1.12.0 <1.31.0 / 1.31.0 | 1.31.0 |
| `ajv` -> `fast-uri` | 3.1.7 | >=3.0.0 <3.1.8 / 3.1.8 | 3.1.8 |
| SDK -> `express-rate-limit` -> `ip-address` | 10.7.0 | <=10.7.0 / 10.7.1 | 10.7.4 |
| SDK -> `express` -> `proxy-addr` | 2.0.7 | >=1.1.0 <2.0.8 / 2.0.8 | 2.0.8 |

Only the SDK direct dependency changes, by one minor release. The three
transitive lock entries update within their existing ranges; npm resolved
`ip-address` to the current compatible patch 10.7.4. No new override, direct
transitive dependency, SDK major migration, or unrelated lockfile update is used.

CI subsequently reached the separately locked `connectors/claude-desktop`
package and exposed the same findings plus `@modelcontextprotocol/client` 2.0.0
under the same OAuth advisory. That package now uses client 2.2.0 and its required
core 2.2.0, SDK 1.31.0, and the same three transitive patches. Client 2.2.0 is the
advisory's minimum fixed 2.x release. Its existing Zod versions and nested lock
topology are preserved rather than accepting npm's unrelated deduplication and
Zod version changes. No desktop source, manifest, auth configuration, artwork,
remote endpoint, or publication state is changed. The desktop's outgoing client
also has no OAuth authProvider; its local bridge is stdio.

The protected-host regression retains the original PR22 baseline and exact
hashes for every other file. Only these two reviewed dependency files receive
explicit replacement hashes in the test; added/removed file detection remains
unchanged. This is not an arbitrary baseline regeneration or a host-file waiver.

## Reachability and evidence limits

- **SDK OAuth credential issuer binding (high):** the vulnerable client path
  requires an HTTP OAuth provider, middleware or direct token call and stored
  credentials. `scripts/capability-sync.mjs`, `probe-plugin-readiness.mjs` and
  `probe-claude-brands.mjs` construct anonymous clients without an `authProvider`.
  `src/host-mcp.ts` uses a stdio server. No application imports/calls to SDK OAuth
  credential providers, `withOAuth` or `fetchToken` were found. This is a source
  reachability assessment, not a claim about every possible downstream use of
  the installed SDK. The 1.x fix is 1.31.0; no saved OAuth credentials are read,
  migrated or cleared by this adapter change.
  [Maintainer advisory](https://github.com/advisories/GHSA-6qxp-vccf-f47h).
- **fast-uri host canonicalization (moderate):** Ajv imports this resolver, so
  URI processing during schema compilation is reachable through
  `src/schema-validation.ts` and SDK schema validation. The vulnerable security
  decision is a case-sensitive host allow/deny comparison using fast-uri's
  scheme-relative URI output. The adapter has no direct fast-uri import or such
  host-decision call site; its resource URL checks use WHATWG `URL`. Update the
  parser regardless rather than relying on that limited reachability.
  [Maintainer advisory](https://github.com/advisories/GHSA-hrr3-gc8f-f4qj).
- **ip-address cross-family subnet comparison and unbounded IPv6 diagnostic
  (moderate):** installed through SDK HTTP auth-server rate limiting. The supported
  adapter is not an Express/OAuth HTTP server and has no direct `Address6`,
  `isInSubnet` or `isHostInSubnet` call. No unbounded attacker body is passed to
  that parser by application code. Both issues are fixed from 10.7.1.
  [Subnet advisory](https://github.com/advisories/GHSA-j6r3-76f7-8jcv),
  [diagnostic advisory](https://github.com/advisories/GHSA-h3mg-xc3c-68pw).
- **proxy-addr mapped-subnet trust (critical):** Express imports this package
  for request IP handling. Exploitation requires the affected proxy trust subnet
  configuration and an HTTP request path relying on it. No Express server or
  `trust proxy` configuration is created by the adapter. Its shipped server is
  stdio; anonymous observer clients are outbound HTTP clients.
  [Maintainer advisory](https://github.com/advisories/GHSA-jqcg-44mw-7w3h).

TypeScript compilation does not itself invoke these network/auth paths. Tests
exercise local stdio/in-memory/fixture transports, while the live observer invokes
only anonymous `tools/list` and descriptive catalog reads. No signer, OAuth
credentials, protected account call, purchase or production operation is needed.

## Validation

The root lockfile diff changes exactly the four package versions listed above.
`npm audit --omit=dev --json` reports zero vulnerabilities after the update.
Run the existing `npm run check`, `npm run capabilities:check` and
`npm run publication:check`; no new tests that duplicate package implementation
are needed. The named/legacy regression suite continues to exercise the actual
adapter with the updated SDK. Live drift must still be reported rather than
converted to success.

The desktop lockfile changes only six advisory-related package versions (client,
core, SDK and the same three transitive patches). A clean locked install and
`npm run pack --prefix connectors/claude-desktop` pass: nine tests, bundled-build,
archive validation, full audit with zero vulnerabilities and unsigned local MCPB
generation. This generates a local artifact; it does not install, sign or publish
the desktop connector. Root `npm run check` passes all 77 tests, typecheck, build
and audit; capability/package checks pass. The live contract hash is identical
before and after the root SDK upgrade.

## Descriptor/tool drift versus deployment mismatch

Compared using tracked adapter source-contract, observed live anonymous contract,
and exact Jobs PR191 candidate `3354b9b91b041860bf673536a9039b2ec8d9b941`:

| Comparison | Wave | Quantum | Robotics |
| --- | --- | --- | --- |
| Tracked source -> current live service rows | No service-row change | All 20 execution mappings changed to named references; only OpenQASM repair's descriptor hash changed | No service-row change |
| Current live -> PR191 candidate service rows | All 20 provider/descriptor/execution hashes change; request schema hashes change only for optimize-processing-pipeline and compare-pipeline-responses | Identical | Identical |
| Current live -> PR191 candidate tool inventory | Six -> 25: add 20 fixed named tools, remove run_account_job; metadata changes on list_account_jobs/list_buyer_jobs/search_buyer_jobs | Identical 28 tools, including hashes | Identical six tools, including hashes |

Wave's planned provider change is `9149ee33...` -> `6e0bf0e1...`, with repaired
catalog digest `fff80e7d...`. Its two changed request schemas add the nested
fixture bounds. All result schema hashes remain unchanged. The candidate's
Quantum and Robotics rows/tool hashes exactly match current live observations.
No unexplained additional candidate mismatch was found.

The tracked adapter snapshot is older: all common tool hashes have changed
since that snapshot, Quantum already moved from six generic tools to its named
surface, and the OpenQASM repair descriptor metadata was corrected. PR191 does
not undo those existing changes. Deploying PR191 will align live Wave with its
candidate, but **will not clear tracked-source drift by itself**. A reviewed
snapshot import with actual Jobs producer revision/provenance and regenerated
host coverage is still needed; do not silently promote a live observation.

The independent infrastructure error is currently Wave provider revision versus
the new approved gitlink. That clears only after coordinated Jobs/catalog and
Workflow deployment/binding. Compatibility support, dependency remediation and
snapshot refresh do not prove execution, financial admission or host acceptance.

## Reviewed candidate import after this comparison

The tracked contract and synthetic fixture are now regenerated/imported from
actual Jobs PR191 producer `de0bab012a68e0453ad7a0ab958f4654d5c47e20`,
with byte hashes and separate provenance. This supersedes the earlier snapshot
blocker above; it is not a live observation or a production promotion. The live
observer now retains producer interest guidance and flags guidance-only drift.
Wave source instructions use the selected service's exact named operation and
three-field purchase envelope; Quantum packages are unchanged. Historical host
file protection stays intact with exact reviewed Wave instruction hashes.
No existing submitted ZIP, grant, listing, or host acceptance evidence changes.
