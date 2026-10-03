# ChatGPT task discovery — draft 0.5.2

This follow-on to PR22 changes only the three ChatGPT package descriptions, starter prompts and skills, plus package validation and test evidence. Source names, display names, artwork, scoped OAuth MCP endpoints, legal URLs and subscription terms are preserved. Claude/Cursor package files are pinned byte for byte to PR22 commit `adc9e4ecb2eace79a4dde33f18e0c2c8706e03e9` in `tests/fixtures/chatgpt-protected-hosts.json`.

The three new public drafts use the generic package names. Build with `npm run publication:pack -- /absolute/output`. Do not use the legacy `--portal-records` variants for those new drafts. No portal upload, deployment, paid call, grant, budget or support contact is part of this change.

## Discovery and execution

The descriptions begin with the engineering task and input artifacts, then state execution prerequisites and claim boundaries. Each app supplies three distinct starter prompts, no longer than 128 characters, without mentions. Exact copy is in each `plugin.json`; skills contain the product-specific workflow. General conceptual questions need no service execution. No instruction prefers RQM over another provider.

The product skill is also the onboarding entry point: explain supported tasks, identify an artifact and desired decision, then discover contracts without spending. The official submission reference documents `extensions.com.openai.onboardingSkill`. The portable schema permits namespace objects but does not validate OpenAI-specific fields. Our additional preflight validates that the onboarding path is the included product `SKILL.md`; this is not a claim of dashboard acceptance. No new capability labels are added.

Execution uses the returned buyer `service_id` in `capability_id`, the exact returned request schema and supplied measurements. Authorization needs actual readiness/policy evidence plus an explicit finite price ceiling. The current six-tool surface has no separate policy-readiness reader; balance and OAuth do not establish that evidence. The skill therefore stops if readiness remains unverified and does not invent a tool or spend to test access. Any future readiness contract is owned by the Jobs task. Recovery uses the original key/job and never authorizes a second payment. Only completed typed results support engineering conclusions; withheld or unsupported outputs remain withheld or unsupported.

## Proposed host evaluation mapping

`tests/fixtures/chatgpt-discovery.json` maps the nine coordinated Jobs flagship contracts below to exact Jobs fixture IDs and proposed brand-free prompts. It includes positive, negative, missing-input and confusable cases, starter-prompt service mappings, source fixture hashes and a separate price/permission/recovery rubric. The copied fixture is a dated working snapshot from the Jobs task, not an implementation dependency. Tests are standalone and never read another workspace.

| Product | Buyer service IDs |
| --- | --- |
| Quantum | `openqasm3-preflight-v1`, `circuit-assurance-report-v1`, `optimization-preservation-audit-v1` |
| Wave | `gate-signal-capture-v1`, `wave.validate-spectral-criteria.v1`, `wave.compare-pipeline-responses.v1` |
| Robotics | `frame-convention-validation-v1`, `robotics.validate-trajectory-timing.v1`, `robotics.validate-closed-loop-stability.v1` |

The broader starter prompts also cover source-verified repair, equivalence, local simulation, waveform comparison, phase drift and trajectory comparison contracts. No synthetic result fixture is presented as successful execution. `observed_host_results` is empty. Local tests check package validity, mapping consistency, deterministic ZIPs and host non-regression; they do not measure ChatGPT selection, recall, precision, valid live envelopes or completed engineering outcomes. Those require separately authorized host evaluations with actual tools, request/result evidence and explicit policy/price prerequisites. Rich catalog content alone does not demonstrate routing quality.

## Sources checked October 3, 2026

- [Optimize Metadata](https://developers.openai.com/plugins/guides/optimize-metadata): task triggers, exclusions and direct/indirect/negative evaluation cases.
- [Skills](https://developers.openai.com/plugins/concepts/skills): metadata selects the workflow; the body guides tool sequence and incomplete-result handling.
- [Submission field reference](https://developers.openai.com/plugins/deploy/submission): subtitles, default prompts and onboarding path.
- [Package guide](https://developers.openai.com/plugins/build/plugins): root manifest and namespaced OpenAI fields.
- Source contract excerpts and provenance: `tests/fixtures/chatgpt-discovery.json`, based on Jobs `agent-selection-benchmark.v1.json` and the coordinated `model-discovery-eval.v1.json`.

The requested writing-style skill was not available in the skill catalog or local skill directories during authoring. Copy follows the session's plain-language writing instructions; this limitation is not a claim that the missing skill was applied.
