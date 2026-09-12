import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { z } from "zod";
import {
  HostBuyer,
  HOST_CAPABILITY,
  type HostBuyerOptions,
} from "./host-buyer.js";
import { HostError, HostStore } from "./host-store.js";
import { capabilityPreflight } from "./preflight.js";

const id = {
  type: "string" as const,
  format: "uuid",
  description:
    "Stable UUID for this purchase. Reuse it on every retry and after restart.",
};
const strictObject = (
  properties: Record<string, unknown>,
  required: string[],
) => ({
  type: "object" as const,
  properties,
  required,
  additionalProperties: false,
});
const tools = [
  {
    name: "get_multichannel_example",
    description:
      "Free bundled synthetic input and result excerpt. Illustrative evidence; no wallet or execution.",
    inputSchema: strictObject({}, []),
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: "check_multichannel",
    description:
      "Free live contract, readiness, quote and unsigned 402 check. No wallet is loaded or payment submitted.",
    inputSchema: strictObject({}, []),
    annotations: { readOnlyHint: true, openWorldHint: true },
  },
  {
    name: "prepare_multichannel_purchase",
    description:
      "Validate input and save one free quote with provider price, RQM fee, total, expiry and explicit maximum. Choose a UUID once; reuse it for retries. Does not sign or pay.",
    inputSchema: strictObject(
      {
        purchaseId: id,
        input: { type: "object" },
        maximum: {
          type: "string",
          pattern: "^[0-9]+\\.[0-9]{6}$",
          description: "Explicit six-decimal USDC ceiling, at most 1.000000.",
        },
      },
      ["purchaseId", "input", "maximum"],
    ),
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  {
    name: "purchase_multichannel",
    description:
      "Request a human confirmation in the host for the saved quote, then sign and submit exactly one purchase. Requires a locally configured environment-only key and ceiling. Tool invocation is not approval. Hosts without form elicitation cannot buy. If already signed, this only recovers the original purchase.",
    inputSchema: strictObject({ purchaseId: id }, ["purchaseId"]),
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  {
    name: "recover_purchase",
    description:
      "Recover the saved original authorization, poll delivery and verify its receipt. Needs no signing key or new approval. Never re-quotes or signs. On pending status call this same tool with the same purchaseId; do not prepare another purchase.",
    inputSchema: strictObject({ purchaseId: id }, ["purchaseId"]),
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
];

export function createHostBuyerServer(options: HostBuyerOptions) {
  const server = new Server(
    { name: "rqm-local-buyer", version: "0.1.0" },
    { capabilities: { tools: {} } },
  );
  const buyer = new HostBuyer(options);
  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));
  server.setRequestHandler(CallToolRequestSchema, async ({ params }, extra) => {
    try {
      let value: unknown;
      if (params.name === "get_multichannel_example") {
        z.strictObject({}).parse(params.arguments ?? {});
        value = {
          capabilityId: HOST_CAPABILITY,
          input: JSON.parse(
            readFileSync(
              new URL("../fixtures/multichannel-input.json", import.meta.url),
              "utf8",
            ),
          ),
          resultExcerpt: JSON.parse(
            readFileSync(
              new URL(
                "../fixtures/multichannel-result-excerpt.json",
                import.meta.url,
              ),
              "utf8",
            ),
          ),
          paymentSubmitted: false,
          liveExecution: false,
        };
      } else if (params.name === "check_multichannel") {
        z.strictObject({}).parse(params.arguments ?? {});
        value = await capabilityPreflight(HOST_CAPABILITY, options.fetchImpl);
      } else if (params.name === "prepare_multichannel_purchase") {
        const args = z
          .strictObject({
            purchaseId: z.string().uuid(),
            input: z.record(z.string(), z.unknown()),
            maximum: z.string().regex(/^\d+\.\d{6}$/),
          })
          .parse(params.arguments);
        value = await buyer.prepare(args.purchaseId, args.input, args.maximum);
      } else if (
        params.name === "purchase_multichannel" ||
        params.name === "recover_purchase"
      ) {
        const args = z
          .strictObject({ purchaseId: z.string().uuid() })
          .parse(params.arguments);
        const elicitation = server.getClientCapabilities()?.elicitation;
        const supportsForm =
          elicitation !== undefined &&
          (elicitation.form !== undefined ||
            Object.keys(elicitation).length === 0);
        value =
          params.name === "recover_purchase"
            ? await buyer.recover(args.purchaseId)
            : await buyer.purchase(
                args.purchaseId,
                supportsForm
                  ? async (details) => {
                      const response = await server.elicitInput(
                        {
                          mode: "form",
                          message: details.message,
                          requestedSchema: {
                            type: "object",
                            properties: {
                              approve: {
                                type: "boolean",
                                title: `Pay ${details.total} USDC for this purchase`,
                                default: false,
                              },
                            },
                            required: ["approve"],
                          },
                        },
                        { signal: extra.signal, timeout: 120_000 },
                      );
                      return (
                        !extra.signal.aborted &&
                        response.action === "accept" &&
                        response.content?.approve === true
                      );
                    }
                  : undefined,
                extra.signal,
              );
      } else throw new HostError("unknown_tool");
      const structuredContent = value as Record<string, unknown>;
      return {
        content: [{ type: "text", text: JSON.stringify(value) }],
        structuredContent,
      };
    } catch (error) {
      // SDK/provider exceptions may embed confidential inputs or signatures.
      const code =
        error instanceof HostError
          ? error.code
          : "request_failed_retain_purchase_id";
      return {
        isError: true,
        content: [{ type: "text", text: code }],
        structuredContent: { error: code },
      };
    }
  });
  return server;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    const store = new HostStore(
      process.env.RQM_HOST_RECOVERY_DIR ??
        join(homedir(), ".local", "share", "rqm-relay", "purchases"),
    );
    const server = createHostBuyerServer({ store });
    process.once("SIGINT", () => {
      void server.close();
    });
    process.once("SIGTERM", () => {
      void server.close();
    });
    await server.connect(new StdioServerTransport());
  } catch {
    process.stderr.write(
      "RQM local buyer could not start. Check private recovery directory permissions.\n",
    );
    process.exitCode = 1;
  }
}
