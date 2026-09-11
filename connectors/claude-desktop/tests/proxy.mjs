import { test } from "node:test";
import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createDiscoveryProxy } from "../src/proxy.mjs";

async function connected(remote) {
  const server = createDiscoveryProxy(remote);
  const client = new Client({ name: "test-host", version: "1.0.0" });
  const [a, b] = InMemoryTransport.createLinkedPair();
  await server.connect(a);
  await client.connect(b);
  return {
    client,
    close: async () => {
      await client.close();
      await server.close();
    },
  };
}
const tool = (name, readOnly = true) => ({
  name,
  inputSchema: { type: "object" },
  annotations: { readOnlyHint: readOnly },
});

test("paginates discovery and rejects paid tools even when advertised read-only", async () => {
  let calls = 0;
  const h = await connected({
    listTools: async ({ cursor }) =>
      cursor
        ? {
            tools: [
              tool("search_buyer_jobs"),
              tool("search_buyer_jobs", false),
            ],
          }
        : {
            tools: [tool("list_buyer_jobs"), tool("run_buyer_job")],
            nextCursor: "page2",
          },
    callTool: async () => {
      calls++;
      return { content: [] };
    },
  });
  try {
    assert.deepEqual(
      (await h.client.listTools()).tools.map((t) => t.name),
      ["list_buyer_jobs", "search_buyer_jobs", "get_multichannel_example"],
    );
    assert.equal(
      (await h.client.callTool({ name: "run_buyer_job", arguments: {} }))
        .isError,
      true,
    );
    assert.equal(calls, 0);
  } finally {
    await h.close();
  }
});
test("does not forward payment metadata and preserves discovery results", async () => {
  let received;
  const h = await connected({
    callTool: async (p) => {
      received = p;
      return {
        content: [{ type: "text", text: "synthetic example" }],
        structuredContent: { synthetic: true },
      };
    },
  });
  try {
    const r = await h.client.callTool({
      name: "search_buyer_jobs",
      arguments: { capability_id: "diagnose-multichannel-capture-v1" },
      _meta: { "x402/payment": "must-not-forward" },
    });
    assert.equal(received._meta, undefined);
    assert.equal(received.name, "search_buyer_jobs");
    assert.equal(r.structuredContent.synthetic, true);
  } finally {
    await h.close();
  }
});
test("bounds repeated pagination and returns a nonsensitive outage message", async () => {
  const h = await connected({
    listTools: async () => ({ tools: [], nextCursor: "loop" }),
    callTool: async () => {
      throw new Error("private response");
    },
  });
  try {
    await assert.rejects(h.client.listTools(), /pagination did not advance/);
    const r = await h.client.callTool({ name: "list_buyer_jobs" });
    assert.equal(r.isError, true);
    assert.equal(JSON.stringify(r).includes("private response"), false);
  } finally {
    await h.close();
  }
});

test("bundled example returns dated synthetic evidence without a remote call", async () => {
  const h = await connected({
    callTool: async () => {
      throw new Error("remote must not be called");
    },
  });
  try {
    const r = await h.client.callTool({
      name: "get_multichannel_example",
      arguments: {},
    });
    assert.equal(
      r.structuredContent.capability_id,
      "diagnose-multichannel-capture-v1",
    );
    assert.equal(r.structuredContent.payment_submitted, false);
    assert.match(r.structuredContent.provenance, /Not a new execution/);
    assert.equal(
      (
        await h.client.callTool({
          name: "get_multichannel_example",
          arguments: { key: "not-accepted" },
        })
      ).isError,
      true,
    );
  } finally {
    await h.close();
  }
});
