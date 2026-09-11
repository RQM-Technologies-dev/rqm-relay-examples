# RQM Jobs Discovery privacy

This extension sends the arguments of its two remote discovery tools to
`https://jobs.rqmtechnologies.com/mcp/waveengine`, operated by RQM Technologies LLC.
Use synthetic examples and nonsensitive search terms. Your MCP host decides which
conversation details to include in a tool call; review the arguments before use.
`get_multichannel_example` returns bundled synthetic data locally and sends no
request to RQM. RQM receives normal network metadata, including the request time and IP address.
The service may retain operational logs under its operating policies; this
extension does not promise that remote requests are unlogged.

The extension does not read local files, load wallet or service credentials,
collect payment information, write recovery records, or execute paid jobs. It
keeps tool responses in process memory and returns them to your MCP host, whose
own privacy and retention rules apply. It adds no analytics or enrollment.

For privacy questions, open an issue at
https://github.com/RQM-Technologies-dev/rqm-relay-examples/issues using only
nonsensitive diagnostic information. Never post inputs, keys, tokens or receipts.
