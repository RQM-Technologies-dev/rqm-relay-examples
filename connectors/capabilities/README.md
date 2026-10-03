# Deterministic capability propagation artifacts

Jobs is the authoritative producer. `source-contract.json` is a **generated
release snapshot**, not an editable capability registry. `SOURCE.json` identifies
the producing Jobs commit. Each descriptor's public provider revision is retained;
provider HEAD is never assumed active. Host-specific packages remain owned here.

```sh
# In RQM-Jobs-MCP, after reviewing an approved source change:
npm run connectors:export
# Copy that generated contract into connectors/capabilities/source-contract.json
# and update SOURCE.json with the actual producer commit and file hash.

# In this repository:
node scripts/capability-sync.mjs compare old-contract.json new-contract.json
npm run capabilities:generate
npm run capabilities:check
npm run check

# Free public discovery; writes candidates only under dist/, exits 2 on drift:
npm run capabilities:live -- dist/capability-sync
```

Default/check mode never writes. Generate writes only `generated/`; live mode
never promotes its observation into the tracked release snapshot. A network,
schema, missing-product or unknown-tool failure must not be accepted as parity.
The infrastructure repository owns scheduled/manual coordination using an
immutable adapter commit. Source contract drift is caught in Jobs CI before
deployment; package/auth/artifact drift is caught here on push and PR.

There are nine derived cells: three products times ChatGPT, Claude and Cursor.
All three hosts for a product share the same endpoint, catalog hash, tool hash
and buyer service IDs. Host metadata, referenced skills and MCP config have
separate hashes and versions. The manifest includes generator and artifact hashes.
These are reproducible source artifacts, **not imported host state**. They do not
replace the existing ChatGPT package validator or deterministic nine-file ZIP
packer. Existing Cursor and Claude auth wiring is checked without normalization.

| Change | Report / required action |
| --- | --- |
| Descriptor copy only, unchanged schemas/tools | `catalog_data_changed`; review claims; approved Jobs deployment makes it available on next discovery |
| New service | `capability_added_readiness_review_required`; provider, allowlist, tariff, Core/Workflow mapping and pins must agree before deployment |
| Removed/renamed service | Removal is breaking; preserve old IDs or coordinate a versioned migration |
| Schema or service version | Compatibility review; no automatic claim that new schemas are backward compatible |
| Execution guidance/readiness | Review semantics and saved-policy prerequisites; do not infer permission from balance/readiness |
| Provider revision | Coordinated deployment review; infrastructure gitlink check fails mismatches |
| Tool definition hash | Host metadata review/refresh; unchanged source artifact is not proof of host refresh |
| Manifest/skill/MCP hash | Generated drift fails CI; review package version/update route separately |

## Host update boundaries (checked 2026-10-03)

- **ChatGPT:** stable tool output data can evolve without a new package. Changed
  tool definitions undergo continuous review, with old definitions active until
  checks pass. Imported skills/listing changes need a new reviewed version. See
  [OpenAI app review](https://developers.openai.com/plugins/deploy/app-review).
- **Claude:** remote MCP tool changes can be served without connector resubmission;
  displayed listing tool names need listing edits/review. Plugin commits are
  rescanned; default publication is reviewed, and automatic publishing requires an
  eligible Anthropic-enabled setting. See [after publishing](https://claude.com/docs/connectors/building/after-publishing),
  [listing management](https://claude.com/docs/connectors/building/managing-your-listing)
  and [plugin submission](https://claude.com/docs/plugins/submit).
  Claude Code [supports tool-list notifications](https://code.claude.com/docs/en/mcp#dynamic-tool-updates);
  do not generalize that guarantee to every hosted Claude surface.
- **Cursor:** Marketplace package updates require manual review; pushing source
  does not update installed listings. See [Marketplace security](https://prod.cursor.com/help/security-and-privacy/marketplace-security)
  and [MCP documentation](https://cursor.com/docs/mcp). No cross-client mid-session
  metadata-refresh guarantee is assumed.

For Claude and Cursor, catalog-result propagation through stable discovery tools
is an architectural inference from the common endpoint, not a host approval claim.
Use a fresh connection and native-host read-only discovery evidence after a
metadata change. Track deployed, discovered and published evidence separately.

## Protected releases and operator handoff

Current submitted ChatGPT releases are Quantum **0.5.6**, Wave **0.5.5** and
Robotics **0.5.5**. Their immutable ZIP hashes are recorded in
`protected-submissions.json`; main-branch source package versions can be older.
Never treat generated source versions as the submitted versions. Never overwrite
submitted ZIPs or auto-use `PORTAL_RECORD_NAMES` in the existing publication
script: those identifiers refer to older records. Current record selection must
come from verified release evidence. Published Claude connections and the existing
Cursor application remain unchanged by this tooling.

After reviewing a candidate, explicitly coordinate provider/Workflow/Jobs
deployment. Re-run infrastructure pin and public catalog checks. Then collect
fresh host discovery evidence in all nine cells. If package copy must change,
coordinate the current draft/update route with the package owner, increment the
appropriate version, run existing validators/packer and complete host review.
No tool here deploys, changes OAuth grants, funds accounts, executes paid jobs,
withdraws applications, submits packages, merges PRs or publishes a host listing.
