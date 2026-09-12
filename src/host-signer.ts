import type { PaymentRequired } from "@x402/core/types";
import { HostError } from "./host-store.js";
import { boundedRqmPaymentPolicy } from "./purchase-recovery.js";

/** Imported and called only after confirmation. Never exposes the key to MCP. */
export async function createHostSigner(): Promise<
  (challenge: PaymentRequired, maximum: string) => Promise<string>
> {
  const key = process.env.RQM_RELAY_BUYER_PRIVATE_KEY;
  if (!key || !/^0x[a-fA-F0-9]{64}$/.test(key))
    throw new HostError("buyer_key_not_configured");
  const [
    { x402Client },
    { ExactEvmScheme },
    { toClientEvmSigner },
    { privateKeyToAccount },
    { encodePaymentSignatureHeader },
  ] = await Promise.all([
    import("@x402/core/client"),
    import("@x402/evm/exact/client"),
    import("@x402/evm"),
    import("viem/accounts"),
    import("@x402/core/http"),
  ]);
  const account = privateKeyToAccount(key as `0x${string}`);
  return async (challenge, maximum) => {
    const client = new x402Client()
      .register("eip155:8453", new ExactEvmScheme(toClientEvmSigner(account)))
      .registerPolicy(boundedRqmPaymentPolicy(maximum));
    // This creates an authorization only. The caller fsyncs it before any submission.
    return encodePaymentSignatureHeader(
      await client.createPaymentPayload(challenge),
    );
  };
}
