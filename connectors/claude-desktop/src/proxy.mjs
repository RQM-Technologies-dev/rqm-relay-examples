import input from "../../../fixtures/multichannel-input.json" with { type: "json" };
import resultExcerpt from "../../../fixtures/multichannel-result-excerpt.json" with { type: "json" };
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Reviewed anonymous discovery operations only. Metadata alone cannot grant access.
export const DISCOVERY_TOOLS = new Set([
  "list_buyer_jobs",
  "search_buyer_jobs",
]);
const exampleTool = {
  name: "get_multichannel_example",
  title: "Inspect a synthetic multichannel example",
  description:
    "Return the bundled synthetic input and dated nominal result excerpt from the public buyer kit. Does not run a diagnostic or establish a current price.",
  inputSchema: { type: "object", properties: {}, additionalProperties: false },
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
};

export function createDiscoveryProxy(remote) {
  const server = new Server(
    { name: "rqm-jobs-discovery", version: "0.1.0" },
    {
      capabilities: { tools: {} },
      instructions:
        "Discover bounded signal checks and inspect synthetic examples. This connector cannot purchase, load a wallet, or execute paid jobs.",
    },
  );
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    const tools = [];
    const cursors = new Set();
    let cursor;
    for (let page = 0; page < 20; page++) {
      const result = await remote.listTools(cursor ? { cursor } : {});
      tools.push(
        ...result.tools.filter(
          (tool) =>
            DISCOVERY_TOOLS.has(tool.name) &&
            tool.annotations?.readOnlyHint === true,
        ),
      );
      if (!result.nextCursor)
        return {
          tools: [
            ...new Map(tools.map((tool) => [tool.name, tool])).values(),
            exampleTool,
          ],
        };
      if (cursors.has(result.nextCursor))
        throw new Error("Discovery pagination did not advance.");
      cursors.add(result.nextCursor);
      cursor = result.nextCursor;
    }
    throw new Error("Discovery pagination exceeded its bound.");
  });
  server.setRequestHandler(CallToolRequestSchema, async ({ params }) => {
    if (params.name === exampleTool.name) {
      if (Object.keys(params.arguments ?? {}).length)
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: "This bundled example accepts no arguments.",
            },
          ],
        };
      const example = {
        capability_id: "diagnose-multichannel-capture-v1",
        provenance:
          "Existing operator-funded synthetic validation, retrieved September 10, 2026. Not a new execution or customer evidence.",
        input,
        result_excerpt: resultExcerpt,
        interpretation: {
          nominal:
            "Continue under your downstream rules; not a general quality guarantee.",
          degraded: "Inspect findings before processing or archiving.",
          invalid: "Correct the capture before relying on the analysis.",
        },
        limits: {
          maximum_channels: 8,
          maximum_complex_samples_per_channel: 1024,
          sample_rate: "positive",
        },
        current_contract_url:
          "https://api.rqm-relay.com/v1/capabilities/diagnose-multichannel-capture-v1",
        current_price: "unknown; use a fresh quote",
        payment_submitted: false,
      };
      return {
        content: [{ type: "text", text: JSON.stringify(example) }],
        structuredContent: example,
      };
    }
    if (!DISCOVERY_TOOLS.has(params.name))
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: "This connector supports free discovery only. No purchase was submitted.",
          },
        ],
      };
    try {
      // Do not forward host metadata, payment authorizations or credentials.
      return await remote.callTool({
        name: params.name,
        arguments: params.arguments ?? {},
      });
    } catch {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: "RQM discovery is temporarily unavailable. Retry the free check later.",
          },
        ],
      };
    }
  });
  return server;
}
