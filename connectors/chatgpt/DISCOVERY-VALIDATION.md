# 0.5.2 validation record

Base: PR22 `adc9e4ecb2eace79a4dde33f18e0c2c8706e03e9`. Scope: ChatGPT packages, package validation, tests and documentation only.

- `npm run check`: passed; TypeScript check, 61 tests across 9 files, build and configured production dependency audit threshold. Audit reports two existing moderate vulnerabilities (`fast-uri`, `ip-address`); no dependency changes in this patch.
- `npm run publication:pack -- /absolute/output`: passed for three generic-name draft ZIPs. Tests validate deterministic ZIP output and unchanged legacy variant behavior.
- `git diff --check`: passed.
- All 63 baseline Claude/Cursor package files hash-match PR22; added-file checks cover their source directories. ChatGPT identity, MCP configuration, approved artwork, legal files and legal links are separately pinned.
- Independent reviewer: no blocking findings. Two low-priority test gaps were fixed: exact starter-prompt/mapping correspondence and added-file checks for `connectors/cursor`.
- Initial focused run exposed the fixture's additional `irrelevant` abstention case; assertion updated. Initial full run exceeded the default five-second timeout for five subprocess validations; the test now has a 30-second bound. Final full run passed.

| Generic draft ZIP | SHA-256 |
| --- | --- |
| resonant-quantum-mechanics-0.5.2-draft.zip | 98c2e8fda70543c13e100a02724438997516c00bdc8f359adf66ff8671936fbf |
| waveengine-0.5.2-draft.zip | 58db2c03dcd88d7b999292cdbdea3cd27811ae6fd254c633f9047f73d09014dd |
| robotics-lab-0.5.2-draft.zip | 0e414297cecf1ebc6f8bb55b8de09f60294afd0dbf1a4aea1712e32cc65151a0 |

Nine flagship contracts map to 40 proposed host cases. No ChatGPT model-routing evaluation or paid execution was run; no measured selection or success-rate claim is made. No portal upload, policy attestation, grant, budget, deployment or support contact occurred. The requested writing-style skill was unavailable; session writing instructions were followed.

## Approved main integration

PR22 merged as `3e88c0da25229f31a5eb204b104edd523923e2e9` after both updated CI runs passed. Integration preserves main’s owner-approved metal-only Robotics artwork (`d94a23433575108391242b81d9a494e9aa1c4dbfc13e10ac36f0e3df20f1fa88`). The table above contains the rebuilt ZIP hashes; the earlier Robotics ZIP is superseded. All 61 tests passed again against the refreshed 63-file Claude/Cursor baseline. Task-driven copy is unchanged from the first independent review.
