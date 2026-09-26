# Resonant Quantum Mechanics privacy notice

Publisher: RQM Technologies LLC. Privacy contact: jvg@rqmtechnologies.com.

This plugin sends the selected tool's necessary arguments to `https://jobs.rqmtechnologies.com/mcp/plugins/quantum` on RQM's Jobs service. Discovery uses a short query and product filter. Computation uses the chosen capability, bounded technical input (such as circuit source or signal samples), and an idempotency key. Status/result retrieval uses an operation ID. Do not include secrets, unnecessary personal data, unrelated files, or full conversation history.

Sign-in uses RQM Account Core at `account.rqmtechnologies.com` and the existing Firebase identity service. The host carries OAuth credentials; this package has no credential store. Account Core maintains identity, consent, included usage and job records. RQM's execution workflow and product backend process the submitted inputs and return results and evidence; the hosting provider processes workflow data to deliver the service.

Raw inputs are not written to application diagnostic logs. Necessary operational/security metadata, account records, usage reservations, idempotency records, execution records and results are retained to provide and secure the service. This is not a zero-retention service. Jobs enforces a 30-day result-access cutoff; that cutoff does not assert deletion of all provider copies or account records. Specific record deletion and infrastructure retention remain governed by RQM account policies and the provider's policies; contact the publisher for applicable retention or deletion requests.

The package itself contains only skills, manifests and remote MCP configuration. It has no local executable, analytics SDK, filesystem reader, wallet or payment client. Claude/Cursor retain conversation and tool data under their own policies. No financial transfer or automatic additional charge is initiated by these tools.

Use private email for privacy requests. Never post private inputs, tokens or results to a public GitHub issue.
