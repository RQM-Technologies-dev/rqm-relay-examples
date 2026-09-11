import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import assert from "node:assert/strict";
const client = new Client({
  name: "rqm-clean-install-probe",
  version: "0.1.0",
});
// Only this packaged entry point is needed at runtime; no private repositories.
const transport = new StdioClientTransport({
  command: process.execPath,
  args: [process.argv[2] ?? "dist/server/index.mjs"],
  env: {},
  stderr: "pipe",
});
try {
  await client.connect(transport);
  const tools = (await client.listTools()).tools;
  assert.equal(tools.length, 3);
  assert(tools.every((t) => t.annotations?.readOnlyHint === true));
  const found = await client.callTool({
    name: "search_buyer_jobs",
    arguments: { query: "multichannel capture", product: "wave" },
  });
  assert.notEqual(found.isError, true);
  assert(JSON.stringify(found).includes("diagnose-multichannel-capture-v1"));
  const example = await client.callTool({
    name: "get_multichannel_example",
    arguments: {},
  });
  assert.notEqual(example.isError, true);
  assert(JSON.stringify(example).includes("diagnose-multichannel-capture-v1"));
  console.log(
    JSON.stringify(
      {
        connected: true,
        freeTools: tools.length,
        multichannelFound: true,
        syntheticExampleRetrieved: true,
        payments: 0,
      },
      null,
      2,
    ),
  );
} finally {
  await client.close();
}
