import { describe, expect, it } from "vitest";
import { encodePaymentRequiredHeader } from "@x402/core/http";
import { capabilityPreflight } from "../src/preflight.js";
import {
  RELAY_API,
  BASE_USDC,
  RQM_RECEIVER,
} from "../src/bazaar-discovery.js";

const id = "gate-signal-capture-v1";
function mock(
  options: {
    signature?: boolean;
    status?: number;
    amount?: string;
    source?: string;
  } = {},
) {
  const calls: RequestInit[] = [];
  const fetchImpl: typeof fetch = (url, init = {}) => {
    calls.push(init);
    const path = String(url);
    if (path.endsWith("/ready"))
      return Promise.resolve(
        Response.json({
          status: "ready",
          flags: {
            firstPartyExecutionEnabled: true,
            buyerPaymentEnabled: true,
            mainnetEnabled: true,
          },
          mode: {
            enabled: true,
            ready: true,
            payerAccessMode: "allowlist",
            accountCoreCompatible: true,
            publicPurchaseLimits: { admission_enabled: true },
          },
        }),
      );
    if (path.endsWith("/v1/quote"))
      return Promise.resolve(
        Response.json({
          quoteId: "quote",
          capabilityId: id,
          providerPrice: "0.005000",
          rqmFee: "0.002000",
          maximumTotalPrice: "0.007000",
          network: "eip155:8453",
          asset: "USDC",
          expiresAt: "2099-01-01T00:00:00Z",
        }),
      );
    if (path.endsWith("/run"))
      return Promise.resolve(
        new Response(null, {
          status: options.status ?? 402,
          headers: {
            "payment-required": encodePaymentRequiredHeader({
              x402Version: 2,
              resource: {
                url: `${RELAY_API}/v1/capabilities/${id}/run`,
                description: "test",
                mimeType: "application/json",
              },
              accepts: [
                {
                  scheme: "exact",
                  network: "eip155:8453",
                  asset: BASE_USDC,
                  payTo: RQM_RECEIVER,
                  amount: options.amount ?? "7000",
                  maxTimeoutSeconds: 60,
                  extra: { name: "USD Coin", version: "2" },
                },
              ],
            }),
          },
        }),
      );
    return Promise.resolve(
      Response.json({
        id,
        inputSchema: { type: "object", required: ["sample_rate_hz"], properties: { sample_rate_hz: { type: "number", exclusiveMinimum: 0 } } },
        source: { registry: options.source ?? "rqm-jobs-mcp" },
        validation: {
          fixtures: [{ id: "synthetic", input: { sample_rate_hz: 1024 } }],
        },
      }),
    );
  };
  return { calls, fetchImpl };
}

describe("general capability protocol demo", () => {
  it("rejects an invalid timestamp fixture before quoting or requesting execution", async () => {
    const m = mock();
    const fetchImpl: typeof fetch = async (url, init) => {
      if (String(url).endsWith(`/v1/capabilities/${id}`)) return Response.json({
        id, source: { registry: "rqm-jobs-mcp" },
        inputSchema: { type: "object", required: ["captured_at"], properties: { captured_at: { type: "string", format: "date-time" } } },
        validation: { fixtures: [{ id: "invalid-date", input: { captured_at: "not-a-date" } }] },
      });
      return m.fetchImpl(url, init);
    };
    await expect(capabilityPreflight(id, fetchImpl)).rejects.toThrow("does not match");
    expect(m.calls.filter(call => call.method === "POST")).toHaveLength(0);
  });
  it("uses a public fixture and returns restricted availability without payment or wallet headers", async () => {
    const m = mock();
    expect(await capabilityPreflight(id, m.fetchImpl)).toMatchObject({
      purchaseState: "restricted",
      total: "0.007000",
      paymentSubmissions: 0,
      paidExecutionVerified: false,
      unpaidFixtureChallengeVerified: true,
    });
    for (const call of m.calls) {
      const headers = new Headers(call.headers);
      expect(headers.has("payment-signature")).toBe(false);
      expect(headers.has("authorization")).toBe(false);
    }
    expect(m.calls.filter((c) => c.method === "POST")).toHaveLength(2);
  });
  it("fails on a rejected fixture, mismatched challenge, or non-RQM contract", async () => {
    for (const options of [
      { status: 400 },
      { amount: "8000" },
      { source: "contract-only" },
    ])
      await expect(
        capabilityPreflight(id, mock(options).fetchImpl),
      ).rejects.toThrow();
  });
});
