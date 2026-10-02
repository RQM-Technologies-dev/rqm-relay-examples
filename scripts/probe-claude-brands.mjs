import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

// Anonymous discovery only: no OAuth provider, credentials, signer or paid call.
const expectedTools = ["list_buyer_jobs", "search_buyer_jobs", "get_account_balance", "run_account_job", "get_account_job", "list_account_jobs"].sort();
for (const [brand, query, expectedService] of [
  ["quantum", "openqasm", "openqasm3-preflight-v1"],
  ["wave", "capture", "diagnose-multichannel-capture-v1"],
]) {
  const endpoint = `https://jobs.rqmtechnologies.com/mcp/plugins/${brand}`;
  const client = new Client({ name: "rqm-unpaid-claude-path-check", version: "0.1.0" });
  const transport = new StreamableHTTPClientTransport(new URL(endpoint));
  try {
    await client.connect(transport);
    const tools = (await client.listTools()).tools;
    assert.deepEqual(tools.map((tool) => tool.name).sort(), expectedTools);
    const call = async (name, args) => {
      const result = await client.callTool({ name, arguments: args });
      assert.notEqual(result.isError, true);
      const data = result.structuredContent ?? JSON.parse(result.content.find((item) => item.type === "text").text);
      assert.equal(data.product, brand);
      return data;
    };
    const catalog = await call("list_buyer_jobs", {});
    assert(catalog.descriptors.length > 0);
    assert(catalog.descriptors.every((item) => item.product === brand));
    const matches = await call("search_buyer_jobs", { query });
    assert(matches.matches.some((item) => item.descriptor?.service_id === expectedService));
    const empty = await call("search_buyer_jobs", { query: "zzznomatchxyz" });
    assert.deepEqual(empty.matches, []);
    console.log(JSON.stringify({ endpoint, server: client.getServerVersion(), tools: expectedTools, catalogEntries: catalog.descriptors.length, searchMatches: matches.matches.length, emptySearch: true, oauthGrants: 0, payments: 0, claudeUiAcceptance: "not tested" }));
  } finally {
    await client.close();
  }
}
