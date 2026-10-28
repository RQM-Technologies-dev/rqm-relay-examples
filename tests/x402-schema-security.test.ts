import { describe, expect, it } from "vitest";
import { wrapFetchWithPayment, x402Client } from "@x402/fetch";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { boundedRqmPaymentPolicy } from "../src/purchase-recovery.js";
import { getAddress } from "viem";
import {
  Any, PaymentPayloadV1Schema, PaymentPayloadV2Schema,
  PaymentRequiredV1Schema, PaymentRequiredV2Schema,
} from "@x402/core/schemas";

const requirement = {
  scheme: "exact", network: "eip155:8453", amount: "7000",
  asset: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
  payTo: "0x8f43274b121663b18a0246e9908bac8eac866c12",
  maxTimeoutSeconds: 300, extra: { name: "USD Coin", version: "2" },
};
const resource = { url: "https://relay.example/v1/jobs", description: "Synthetic fixture" };
const payload = { signature: "synthetic-not-a-signature", authorization: { value: "7000" } };

describe("x402 patched payment schemas (synthetic, no signing or network)", () => {
  it.each([200, 402, 500])("does not create another authorization after paid HTTP %s without recovery hooks", async (status) => {
    let authorizations = 0;
    const typedMessages: unknown[] = [];
    const scheme = new ExactEvmScheme({
      address: "0x0000000000000000000000000000000000000001",
      signTypedData: async (data) => {
        authorizations++;
        typedMessages.push(data);
        return "0x00";
      },
    });
    const client = new x402Client().register("eip155:8453", scheme)
      .registerPolicy(boundedRqmPaymentPolicy("0.007000"));
    let requests = 0;
    const fakeFetch: typeof fetch = async (input, init) => {
      const request = new Request(input, init);
      requests++;
      if (requests === 1) return new Response(null, { status: 402, headers: {
        "PAYMENT-REQUIRED": Buffer.from(JSON.stringify({ x402Version: 2, resource,
          accepts: [requirement] })).toString("base64"),
      } });
      expect(request.headers.has("PAYMENT-SIGNATURE")).toBe(true);
      return new Response(null, { status });
    };
    const result = await wrapFetchWithPayment(fakeFetch, client)(resource.url);
    expect(result.status).toBe(status);
    expect(requests).toBe(2);
    expect(authorizations).toBe(1);
    expect(typedMessages[0]).toMatchObject({ primaryType: "TransferWithAuthorization",
      message: { to: getAddress(requirement.payTo), value: 7000n } });
  });
  it("preserves nonempty scheme-specific records and exact V2 payment bindings", () => {
    expect(Any.parse(payload)).toEqual(payload);
    const payment = { x402Version: 2, accepted: requirement, resource, payload,
      extensions: { fixture: { nested: true } } };
    expect(PaymentPayloadV2Schema.parse(payment)).toEqual(payment);
    const required = { x402Version: 2, resource, accepts: [requirement] };
    expect(PaymentRequiredV2Schema.parse(required)).toEqual(required);
  });
  it("retains V1 parsing without changing its protocol version", () => {
    const payment = { x402Version: 1, scheme: "exact", network: "base", payload };
    expect(PaymentPayloadV1Schema.parse(payment)).toEqual(payment);
    const required = { x402Version: 1, accepts: [{ scheme: "exact", network: "base",
      maxAmountRequired: "7000", resource: resource.url, description: "Synthetic fixture",
      payTo: requirement.payTo, maxTimeoutSeconds: 300, asset: requirement.asset,
      outputSchema: { type: "object" }, extra: requirement.extra }] };
    expect(PaymentRequiredV1Schema.parse(required)).toEqual(required);
  });
  it("rejects invalid discriminators, empty accepts, malformed records and networks", () => {
    for (const bad of [
      { x402Version: 3, resource, accepts: [requirement] },
      { x402Version: 2, resource, accepts: [] },
      { x402Version: 2, resource, accepts: [{ ...requirement, network: "base" }] },
      { x402Version: 2, resource, accepts: [{ ...requirement, maxTimeoutSeconds: 0 }] },
    ]) expect(PaymentRequiredV2Schema.safeParse(bad).success).toBe(false);
    expect(PaymentPayloadV2Schema.safeParse({ x402Version: 2, accepted: requirement,
      payload: [payload] }).success).toBe(false);
  });
  it("bounds payment-choice collections before unbounded validation work", () => {
    for (const schema of [PaymentRequiredV1Schema, PaymentRequiredV2Schema]) {
      const result = schema.safeParse({ x402Version: schema === PaymentRequiredV1Schema ? 1 : 2,
        resource, accepts: Array(1025).fill(requirement) });
      expect(result.success).toBe(false);
    }
  });
});
