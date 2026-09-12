import { expect, it, vi } from "vitest";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { verifyTypedData } from "viem";
import { decodePaymentSignatureHeader } from "@x402/core/http";
import { createHostSigner } from "../src/host-signer.js";
import { BASE_USDC, RELAY_API, RQM_RECEIVER } from "../src/bazaar-discovery.js";

it("signs the bounded x402 authorization offline with an ephemeral test key and no network calls", async () => {
  const previous = process.env.RQM_RELAY_BUYER_PRIVATE_KEY;
  // Generated test-only identity, never funded, persisted or printed.
  const key = generatePrivateKey();
  process.env.RQM_RELAY_BUYER_PRIVATE_KEY = key;
  const network = vi
    .spyOn(globalThis, "fetch")
    .mockRejectedValue(new Error("offline test"));
  try {
    const sign = await createHostSigner();
    const payment = decodePaymentSignatureHeader(
      await sign(
        {
          x402Version: 2,
          resource: {
            url: `${RELAY_API}/v1/capabilities/diagnose-multichannel-capture-v1/run`,
            description: "offline fixture",
            mimeType: "application/json",
          },
          accepts: [
            {
              scheme: "exact",
              network: "eip155:8453",
              asset: BASE_USDC,
              payTo: RQM_RECEIVER,
              amount: "7000",
              maxTimeoutSeconds: 120,
              extra: { name: "USD Coin", version: "2" },
            },
          ],
        },
        "0.010000",
      ),
    );
    const payload = payment.payload as {
      authorization: {
        from: `0x${string}`;
        to: `0x${string}`;
        value: string;
        validAfter: string;
        validBefore: string;
        nonce: `0x${string}`;
      };
      signature: `0x${string}`;
    };
    expect(payment.accepted.amount).toBe("7000");
    expect(payload.authorization.from.toLowerCase()).toBe(
      privateKeyToAccount(key).address.toLowerCase(),
    );
    expect(payload.authorization.to.toLowerCase()).toBe(RQM_RECEIVER);
    expect(
      await verifyTypedData({
        address: payload.authorization.from,
        domain: {
          name: "USD Coin",
          version: "2",
          chainId: 8453,
          verifyingContract: BASE_USDC,
        },
        types: {
          TransferWithAuthorization: [
            { name: "from", type: "address" },
            { name: "to", type: "address" },
            { name: "value", type: "uint256" },
            { name: "validAfter", type: "uint256" },
            { name: "validBefore", type: "uint256" },
            { name: "nonce", type: "bytes32" },
          ],
        },
        primaryType: "TransferWithAuthorization",
        message: {
          ...payload.authorization,
          value: BigInt(payload.authorization.value),
          validAfter: BigInt(payload.authorization.validAfter),
          validBefore: BigInt(payload.authorization.validBefore),
        },
        signature: payload.signature,
      }),
    ).toBe(true);
    expect(network).not.toHaveBeenCalled();
  } finally {
    network.mockRestore();
    if (previous === undefined) delete process.env.RQM_RELAY_BUYER_PRIVATE_KEY;
    else process.env.RQM_RELAY_BUYER_PRIVATE_KEY = previous;
  }
});
