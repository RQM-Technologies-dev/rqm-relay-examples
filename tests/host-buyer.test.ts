import { afterEach, describe, expect, it, vi } from "vitest";
import {
  generateKeyPairSync,
  randomUUID,
  sign as signReceipt,
} from "node:crypto";
import {
  chmodSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  symlinkSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  encodePaymentRequiredHeader,
  encodePaymentResponseHeader,
} from "@x402/core/http";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { ElicitRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { HostBuyer, HOST_CAPABILITY } from "../src/host-buyer.js";
import { HostStore } from "../src/host-store.js";
import { createHostBuyerServer } from "../src/host-mcp.js";
import { canonicalJson, sha256 } from "../src/receipts.js";
import { BASE_USDC, RELAY_API, RQM_RECEIVER } from "../src/bazaar-discovery.js";
import { readPurchase } from "../src/purchase-recovery.js";

const directories: string[] = [];
afterEach(() => {
  for (const path of directories.splice(0))
    rmSync(path, { recursive: true, force: true });
});
const input = {
  channels: [{ channel_id: "one", samples: [{ real: 1, imaginary: 0 }] }],
  sample_rate_hz: 1024,
};
const maximum = "0.010000";
const signature = "private-original-payment-authorization";
const token = "private-result-access-token";

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "rqm-host-buyer-"));
  directories.push(root);
  const store = new HostStore(root);
  const purchaseId = randomUUID();
  const quoteId = randomUUID();
  const jobId = randomUUID();
  const receiptId = randomUUID();
  const transaction = `0x${"a".repeat(64)}`;
  let clock = Date.now();
  let providerId = `rqm:wave:${HOST_CAPABILITY}`;
  let amount = "7000";
  let recipient = RQM_RECEIVER;
  let contractVersion = "1.0.0";
  let ready = true;
  let expiresAt = new Date(clock + 120_000).toISOString();
  let status = "succeeded";
  let refund = "not_applicable";
  let tamper = false;
  let receiptAmount = "0.007000";
  let receiptInput: string | undefined;
  let paidResponses: Array<() => Response | never> = [];
  const paidRequests: Array<{ body: string; headers: Headers }> = [];
  const uniqueAuthorizations = new Set<string>();
  const result = { diagnostic_state: "nominal", findings: [] };
  const { privateKey, publicKey } = generateKeyPairSync("ed25519");
  const contract = () => ({
    id: HOST_CAPABILITY,
    version: contractVersion,
    source: { registry: "rqm-jobs-mcp" },
    inputSchema: {
      type: "object",
      required: ["channels", "sample_rate_hz"],
      properties: {
        channels: { type: "array", minItems: 1, maxItems: 8 },
        sample_rate_hz: { type: "number", exclusiveMinimum: 0 },
      },
      additionalProperties: false,
    },
    outputSchema: {
      type: "object",
      properties: {
        diagnostic_state: { enum: ["nominal", "degraded", "invalid"] },
        findings: { type: "array" },
      },
      required: ["diagnostic_state", "findings"],
      additionalProperties: false,
    },
    validation: { fixtures: [{ id: "synthetic-fixture", input }] },
  });
  const fetchImpl = vi.fn<typeof fetch>(async (resource, init) => {
    const url = String(resource);
    expect(url.startsWith(RELAY_API + "/")).toBe(true);
    expect(init?.redirect).toBe("error");
    const path = new URL(url).pathname;
    if (path === "/ready")
      return Response.json(
        {
          status: ready ? "ready" : "not_ready",
          mode: {
            enabled: true,
            ready,
            accountCoreCompatible: true,
            payerAccessMode: "public",
            publicPurchaseLimits: { admission_enabled: ready },
          },
          flags: {
            firstPartyExecutionEnabled: true,
            buyerPaymentEnabled: true,
            mainnetEnabled: true,
          },
        },
        { status: ready ? 200 : 503 },
      );
    if (path === `/v1/capabilities/${HOST_CAPABILITY}`)
      return Response.json(contract());
    if (path === "/v1/quote")
      return Response.json({
        quoteId,
        capabilityId: HOST_CAPABILITY,
        capabilityVersion: contractVersion,
        providerId,
        fallbackProviderIds: [],
        providerPrice: "0.005000",
        rqmFee: "0.002000",
        maximumTotalPrice: "0.007000",
        network: "eip155:8453",
        asset: "USDC",
        expiresAt,
      });
    if (path === `/v1/capabilities/${HOST_CAPABILITY}/run`) {
      const headers = new Headers(init?.headers);
      if (!headers.has("payment-signature"))
        return new Response(null, {
          status: 402,
          headers: {
            "payment-required": encodePaymentRequiredHeader({
              x402Version: 2,
              resource: {
                url,
                description: "fixture",
                mimeType: "application/json",
              },
              accepts: [
                {
                  scheme: "exact",
                  network: "eip155:8453",
                  asset: BASE_USDC,
                  payTo: recipient,
                  amount,
                  maxTimeoutSeconds: 120,
                  extra: { name: "USD Coin", version: "2" },
                },
              ],
            }),
          },
        });
      // The original authorization must be fsynced before the first paid request.
      expect(
        readPurchase(store.path(purchaseId, "recovery.json"))?.paymentSignature,
      ).toBe(signature);
      paidRequests.push({ body: String(init?.body), headers });
      uniqueAuthorizations.add(headers.get("payment-signature")!);
      const queued = paidResponses.shift();
      if (queued) return queued();
      return Response.json(
        {
          jobId,
          resultAccessToken: token,
          resultAccessExpiresAt: new Date(clock + 60_000).toISOString(),
        },
        {
          status: 202,
          headers: {
            "payment-response": encodePaymentResponseHeader({
              success: true,
              network: "eip155:8453",
              transaction,
            }),
          },
        },
      );
    }
    expect(new Headers(init?.headers).get("authorization")).toBe(
      `Bearer ${token}`,
    );
    if (path === `/v1/jobs/${jobId}`)
      return Response.json({ status, receiptId });
    if (path === `/v1/jobs/${jobId}/result`)
      return Response.json({
        jobId,
        result: status === "succeeded" ? result : null,
        resultHash: status === "succeeded" ? sha256(result) : null,
        receiptId,
      });
    if (path === `/v1/receipts/${receiptId}`) {
      const payload = {
        receiptId,
        relayJobId: jobId,
        quoteId,
        capabilityId: HOST_CAPABILITY,
        capabilityVersion: "1.0.0",
        providerId,
        inputHash: receiptInput ?? sha256(input),
        resultHash: status === "succeeded" ? sha256(result) : null,
        providerPrice: "0.005000",
        rqmFee: "0.002000",
        totalAmount: receiptAmount,
        network: "eip155:8453",
        asset: "USDC",
        tokenContract: BASE_USDC,
        idempotencyKeyHash: sha256(purchaseId),
        buyerPaymentTransactionHash: transaction,
        outcome: status,
        schemaValid: true,
        refundOrCreditStatus: refund,
        ...(refund === "refunded"
          ? { buyerRefundTransactionHash: `0x${"b".repeat(64)}` }
          : {}),
      };
      return Response.json({
        ...payload,
        signature: tamper
          ? "bad-signature"
          : signReceipt(
              null,
              Buffer.from(canonicalJson(payload)),
              privateKey,
            ).toString("base64url"),
        publicKey: publicKey.export({ type: "spki", format: "pem" }),
      });
    }
    throw new Error("unexpected test route");
  });
  const signer = vi.fn(async () => signature);
  const options = {
    store,
    fetchImpl,
    sign: signer,
    configuredMaximum: () => maximum,
    now: () => clock,
    sleep: async (ms: number) => {
      clock += ms;
    },
    recoveryTimeoutMs: 1000,
  };
  const buyer = new HostBuyer(options);
  return {
    store,
    root,
    buyer,
    options,
    purchaseId,
    signer,
    fetchImpl,
    paidRequests,
    uniqueAuthorizations,
    prepare: () => buyer.prepare(purchaseId, input, maximum),
    change: (value: {
      price?: string;
      recipient?: string;
      version?: string;
      ready?: boolean;
      expired?: boolean;
      status?: string;
      refund?: string;
      tamper?: boolean;
      receiptAmount?: string;
      receiptInput?: string;
      providerId?: string;
      clockAdvance?: number;
    }) => {
      amount = value.price ?? amount;
      recipient = value.recipient ?? recipient;
      contractVersion = value.version ?? contractVersion;
      ready = value.ready ?? ready;
      status = value.status ?? status;
      refund = value.refund ?? refund;
      tamper = value.tamper ?? tamper;
      receiptAmount = value.receiptAmount ?? receiptAmount;
      receiptInput = value.receiptInput ?? receiptInput;
      providerId = value.providerId ?? providerId;
      clock += value.clockAdvance ?? 0;
      if (value.expired) clock += 300_000;
    },
    responses: (values: Array<() => Response | never>) => {
      paidResponses = values;
    },
  };
}

describe("local host buyer authorization and recovery", () => {
  it("prepares without a signer, repeats the same quote and rejects changed input under the same identity", async () => {
    const f = fixture();
    const first = await f.prepare();
    const repeated = await f.prepare();
    expect(first).toMatchObject({
      total: "0.007000",
      providerPrice: "0.005000",
      rqmFee: "0.002000",
      paymentSubmitted: false,
    });
    expect(repeated.purchaseId).toBe(first.purchaseId);
    expect(f.signer).not.toHaveBeenCalled();
    expect(f.paidRequests).toHaveLength(0);
    await expect(
      f.buyer.prepare(
        f.purchaseId,
        { ...input, sample_rate_hz: 2048 },
        maximum,
      ),
    ).rejects.toThrow("purchase_id_conflict");
  });
  it.each([undefined, async () => false])(
    "does not sign without explicit host confirmation (%s)",
    async (confirm) => {
      const f = fixture();
      await f.prepare();
      if (confirm)
        expect(await f.buyer.purchase(f.purchaseId, confirm)).toMatchObject({
          status: "declined",
        });
      else
        await expect(f.buyer.purchase(f.purchaseId)).rejects.toThrow(
          "host_confirmation_unsupported",
        );
      expect(f.signer).not.toHaveBeenCalled();
      expect(f.paidRequests).toHaveLength(0);
    },
  );
  it.each(["price", "recipient", "version", "ready", "expired"])(
    "revalidates %s after confirmation and fails before signing",
    async (kind) => {
      const f = fixture();
      await f.prepare();
      await expect(
        f.buyer.purchase(f.purchaseId, async () => {
          f.change({
            price: kind === "price" ? "8000" : undefined,
            recipient: kind === "recipient" ? `0x${"c".repeat(40)}` : undefined,
            version: kind === "version" ? "2.0.0" : undefined,
            ready: kind === "ready" ? false : undefined,
            expired: kind === "expired",
          });
          return true;
        }),
      ).rejects.toThrow();
      expect(f.signer).not.toHaveBeenCalled();
      expect(f.paidRequests).toHaveLength(0);
    },
  );
  it("rejects an outside provider and an excessive configured ceiling", async () => {
    const f = fixture();
    f.change({ providerId: "outside-provider" });
    await expect(f.prepare()).rejects.toThrow("quote_mismatch");
    f.change({ providerId: `rqm:wave:${HOST_CAPABILITY}` });
    await f.prepare();
    const buyer = new HostBuyer({
      ...f.options,
      configuredMaximum: () => "0.006000",
    });
    await expect(
      buyer.purchase(f.purchaseId, async () => true),
    ).rejects.toThrow("configured_ceiling_exceeded");
    expect(f.signer).not.toHaveBeenCalled();
  });
  it("persists once before sending and recovers lost responses and delayed finality after restart without signing", async () => {
    const f = fixture();
    await f.prepare();
    f.responses([
      () => {
        throw new Error(`lost ${signature}`);
      },
    ]);
    expect(
      await f.buyer.purchase(f.purchaseId, async (details) => {
        expect(details.message).toContain("0.002000 USDC");
        return true;
      }),
    ).toMatchObject({ status: "recovery_required" });
    const recovery = readPurchase(f.store.path(f.purchaseId, "recovery.json"));
    expect(
      statSync(f.store.path(f.purchaseId, "recovery.json")).mode & 0o777,
    ).toBe(0o600);
    const mustNotSign = vi.fn(async () => {
      throw new Error("recovery must not sign");
    });
    const restarted = new HostBuyer({
      ...f.options,
      configuredMaximum: () => undefined,
      sign: mustNotSign,
    });
    f.responses([
      () =>
        Response.json(
          { error: "settlement_pending_finality" },
          { status: 503 },
        ),
    ]);
    expect(await restarted.recover(f.purchaseId)).toMatchObject({
      status: "recovery_required",
    });
    f.change({ expired: true });
    const completed = await restarted.recover(f.purchaseId);
    expect(completed).toMatchObject({
      status: "succeeded",
      receiptVerified: true,
      total: "0.007000",
    });
    expect(f.signer).toHaveBeenCalledOnce();
    expect(mustNotSign).not.toHaveBeenCalled();
    expect(f.uniqueAuthorizations.size).toBe(1);
    for (const request of f.paidRequests) {
      expect(request.body).toBe(recovery?.body);
      expect(request.headers.get("idempotency-key")).toBe(f.purchaseId);
      expect(request.headers.get("payment-signature")).toBe(
        recovery?.paymentSignature,
      );
    }
    expect(JSON.stringify(completed)).not.toContain(signature);
    expect(JSON.stringify(completed)).not.toContain(token);
    expect(await restarted.purchase(f.purchaseId)).toMatchObject({
      status: "succeeded",
    });
  });
  it("keeps a failed purchase pending until its original full-total refund is reported", async () => {
    const f = fixture();
    await f.prepare();
    f.change({ status: "failed", refund: "pending" });
    expect(
      await f.buyer.purchase(f.purchaseId, async () => true),
    ).toMatchObject({
      status: "failed",
      refundStatus: "pending",
      recoveryPending: true,
    });
    f.change({ refund: "refunded" });
    expect(await new HostBuyer(f.options).recover(f.purchaseId)).toMatchObject({
      status: "failed",
      refundStatus: "refunded",
      total: "0.007000",
    });
    expect(f.signer).toHaveBeenCalledOnce();
    expect(f.paidRequests).toHaveLength(1);
  });
  it.each(["tamper", "receiptAmount", "receiptInput"])(
    "withholds unverified results on receipt %s mismatch",
    async (kind) => {
      const f = fixture();
      await f.prepare();
      f.change({
        tamper: kind === "tamper",
        receiptAmount: kind === "receiptAmount" ? "0.008000" : undefined,
        receiptInput: kind === "receiptInput" ? "f".repeat(64) : undefined,
      });
      const result = await f.buyer.purchase(f.purchaseId, async () => true);
      expect(result).toMatchObject({
        status: "recovery_required",
        authorizeAgain: false,
      });
      expect(result).not.toHaveProperty("result");
    },
  );
  it("never signs again after a crash during signing and never signs a concurrent duplicate", async () => {
    const f = fixture();
    await f.prepare();
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const once = vi.fn(async () => {
      await gate;
      return signature;
    });
    const buyer = new HostBuyer({ ...f.options, sign: once });
    const first = buyer.purchase(f.purchaseId, async () => true);
    await vi.waitFor(() => expect(once).toHaveBeenCalledOnce());
    await expect(
      new HostBuyer(f.options).purchase(f.purchaseId, async () => true),
    ).rejects.toThrow("signing_interrupted_reconciliation_required");
    expect(await buyer.purchase(f.purchaseId, async () => true)).toMatchObject({
      status: "busy",
    });
    release();
    expect(await first).toMatchObject({ status: "succeeded" });
    expect(f.signer).not.toHaveBeenCalled();
  });
  it("fails closed on shared private-state directories and symlinks", () => {
    const f = fixture();
    chmodSync(f.root, 0o755);
    expect(() => new HostStore(f.root)).toThrow("private_directory_required");
    chmodSync(f.root, 0o700);
    const target = join(f.root, "target");
    symlinkSync(f.root, target);
    expect(() => new HostStore(target)).toThrow();
    expect(() => f.store.directory("../../elsewhere")).toThrow(
      "invalid_purchase_id",
    );
  });
});

describe("MCP host protocol", () => {
  it("completes an approved purchase through standard MCP with no script or secrets in tool arguments/results", async () => {
    const f = fixture();
    const server = createHostBuyerServer(f.options);
    const client = new Client(
      { name: "simulated-confirming-host", version: "1.0.0" },
      { capabilities: { elicitation: { form: {} } } },
    );
    const approval = vi.fn(async () => ({
      action: "accept" as const,
      content: { approve: true },
    }));
    client.setRequestHandler(ElicitRequestSchema, async (request) => {
      expect(request.params.message).toContain("total: 0.007000 USDC");
      expect(request.params.message).not.toContain(signature);
      return approval();
    });
    const [a, b] = InMemoryTransport.createLinkedPair();
    await Promise.all([server.connect(a), client.connect(b)]);
    try {
      const example = await client.callTool({
        name: "get_multichannel_example",
        arguments: {},
      });
      expect(example.isError).not.toBe(true);
      const prepared = await client.callTool({
        name: "prepare_multichannel_purchase",
        arguments: { purchaseId: f.purchaseId, input, maximum },
      });
      expect(prepared.isError).not.toBe(true);
      const spoofed = await client.callTool({
        name: "purchase_multichannel",
        arguments: { purchaseId: f.purchaseId, approve: true },
      });
      expect(spoofed.isError).toBe(true);
      expect(f.signer).not.toHaveBeenCalled();
      const result = await client.callTool({
        name: "purchase_multichannel",
        arguments: { purchaseId: f.purchaseId },
      });
      expect(result.structuredContent).toMatchObject({
        status: "succeeded",
        receiptVerified: true,
      });
      expect(approval).toHaveBeenCalledOnce();
      expect(f.signer).toHaveBeenCalledOnce();
      const recovered = await client.callTool({
        name: "recover_purchase",
        arguments: { purchaseId: f.purchaseId },
      });
      expect(recovered.structuredContent).toMatchObject({
        status: "succeeded",
      });
      expect(approval).toHaveBeenCalledOnce();
      expect(JSON.stringify([result, recovered])).not.toContain(signature);
      expect(JSON.stringify([result, recovered])).not.toContain(token);
    } finally {
      await client.close();
      await server.close();
    }
  });
  it("a host without elicitation can inspect and prepare but cannot spend", async () => {
    const f = fixture();
    const server = createHostBuyerServer(f.options);
    const client = new Client({ name: "unsupported-host", version: "1.0.0" });
    const [a, b] = InMemoryTransport.createLinkedPair();
    await Promise.all([server.connect(a), client.connect(b)]);
    try {
      expect(
        (await client.callTool({ name: "check_multichannel", arguments: {} }))
          .isError,
      ).not.toBe(true);
      await client.callTool({
        name: "prepare_multichannel_purchase",
        arguments: { purchaseId: f.purchaseId, input, maximum },
      });
      const rejected = await client.callTool({
        name: "purchase_multichannel",
        arguments: { purchaseId: f.purchaseId },
      });
      expect(rejected.structuredContent).toEqual({
        error: "host_confirmation_unsupported",
      });
      expect(f.signer).not.toHaveBeenCalled();
    } finally {
      await client.close();
      await server.close();
    }
  });
});
