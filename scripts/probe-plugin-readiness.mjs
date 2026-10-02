import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

// Public protocol/catalog checks only. No OAuth provider, signer, protected call
// or runtime configuration change. This does not record any host UI acceptance.
const brands = [
  { name: "Resonant Quantum Mechanics", product: "quantum", query: "openqasm" },
  { name: "WaveEngine", product: "wave", query: "capture" },
  { name: "Robotics Lab", product: "robotics", query: "frame convention" },
];
for (const brand of brands) {
  for (const contract of ["prepaid", "legacy-subscription"]) {
    const path = contract === "prepaid" ? `plugins/${brand.product}` : `chatgpt/${brand.product}`;
    const endpoint = `https://jobs.rqmtechnologies.com/mcp/${path}`;
    const client = new Client({ name: "rqm-nine-cell-unpaid-readiness", version: "0.1.0" });
    const evidence = { checkedAt: new Date().toISOString(), brand: brand.name, product: brand.product, endpoint, contract, hostAcceptance: "not tested", oauthGrants: 0, payments: 0 };
    try {
      await client.connect(new StreamableHTTPClientTransport(new URL(endpoint)));
      const tools = (await client.listTools()).tools;
      evidence.server = client.getServerVersion();
      evidence.tools = tools.map((tool) => tool.name);
      const expected = contract === "prepaid"
        ? ["list_buyer_jobs", "search_buyer_jobs", "get_account_balance", "run_account_job", "get_account_job", "list_account_jobs"]
        : ["list_rqm_services", "search_rqm_services", "get_rqm_subscription", "run_rqm_job", "get_rqm_job", "get_rqm_result"];
      assert.deepEqual([...evidence.tools].sort(), expected.sort());
      const list = contract === "prepaid" ? "list_buyer_jobs" : "list_rqm_services";
      const search = contract === "prepaid" ? "search_buyer_jobs" : "search_rqm_services";
      const call = async (name, args) => {
        const result = await client.callTool({ name, arguments: args });
        assert.notEqual(result.isError, true);
        return result.structuredContent ?? JSON.parse(result.content.find((item) => item.type === "text").text);
      };
      const catalog = await call(list, {});
      const descriptors = catalog.descriptors ?? catalog.services;
      assert.equal(descriptors.length, 20);
      assert(descriptors.every((item) => item.product === brand.product));
      const positive = await call(search, { query: brand.query });
      const matches = positive.services ?? positive.matches.map((item) => item.descriptor);
      assert(matches.length > 0 && matches.every((item) => item.product === brand.product));
      const empty = await call(search, { query: "zzznomatchxyz" });
      assert.deepEqual(empty.services ?? empty.matches, []);
      const otherProduct = brand.product === "quantum" ? "wave" : "quantum";
      const rejected = await client.callTool({ name: list, arguments: { product: otherProduct } });
      assert.equal(rejected.isError, true, "Cross-product input must fail rather than widen the catalog");
      Object.assign(evidence, { state: "public scoped discovery passed", catalogEntries: descriptors.length, searchMatches: matches.length, emptySearch: true, crossProductRejected: true });
    } catch (error) {
      Object.assign(evidence, { state: "unavailable or failed", error: error.message });
      process.exitCode = 1;
    } finally { await client.close(); }
    console.log(JSON.stringify(evidence));
  }
}
