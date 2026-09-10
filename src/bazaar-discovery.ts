/** Public, zero-payment discovery. Search is never restricted to an RQM host or payer. */
export const BAZAAR_API =
  "https://api.cdp.coinbase.com/platform/v2/x402/discovery";
export const RELAY_API = "https://api.rqm-relay.com";
export const RQM_RECEIVER = "0x8f43274b121663b18a0246e9908bac8eac866c12";
export const BASE_USDC = "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913";

export interface BazaarResource {
  resource: string;
  description?: string;
  type: string;
  x402Version: number;
  accepts?: Array<{
    scheme?: string;
    network?: string;
    asset?: string;
    amount?: string;
    maxAmountRequired?: string;
    payTo?: string;
  }>;
  extensions?: Record<string, unknown>;
}

export async function searchBazaar(
  problem: string,
  maximumUsd: string,
  fetchImpl: typeof fetch = fetch,
): Promise<{
  resources: BazaarResource[];
  partialResults: boolean;
  searchMethod?: string;
}> {
  if (!problem.trim() || problem.length > 400)
    throw new Error("Use a problem description of 1 to 400 characters.");
  if (
    !/^\d+\.\d{6}$/.test(maximumUsd) ||
    BigInt(maximumUsd.replace(".", "")) <= 0n ||
    BigInt(maximumUsd.replace(".", "")) > 1_000_000n
  )
    throw new Error("Use a positive six-decimal budget at most 1 USDC.");
  const query = new URLSearchParams({
    query: problem,
    maxUsdPrice: maximumUsd,
    network: "eip155:8453",
    asset: BASE_USDC,
    scheme: "exact",
    limit: "20",
  });
  const response = await fetchImpl(`${BAZAAR_API}/search?${query}`, {
    redirect: "error",
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok)
    throw new Error(`Bazaar search returned ${response.status}`);
  const value = (await response.json()) as {
    resources: BazaarResource[];
    partialResults: boolean;
    searchMethod?: string;
  };
  if (
    !Array.isArray(value.resources) ||
    typeof value.partialResults !== "boolean"
  )
    throw new Error("Invalid Bazaar search response.");
  return value;
}

/** Apply the caller's RQM merchant policy AFTER a normal marketplace search. */
export function chooseRelayResource(
  resources: BazaarResource[],
  maximumUsd: string,
) {
  const maximum = BigInt(maximumUsd.replace(".", ""));
  for (const [index, resource] of resources.entries()) {
    let url: URL;
    try {
      url = new URL(resource.resource);
    } catch {
      continue;
    }
    const match = /^\/v1\/capabilities\/([a-z0-9][a-z0-9.-]*)\/run$/.exec(
      url.pathname,
    );
    if (
      url.origin !== RELAY_API ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      !match ||
      resource.type !== "http" ||
      resource.x402Version !== 2
    )
      continue;
    const accepted = resource.accepts?.some((a) => {
      const amount = a.amount ?? a.maxAmountRequired ?? "";
      return (
        a.scheme === "exact" &&
        a.network === "eip155:8453" &&
        a.asset?.toLowerCase() === BASE_USDC &&
        a.payTo?.toLowerCase() === RQM_RECEIVER &&
        /^\d+$/.test(amount) &&
        BigInt(amount) > 0n &&
        BigInt(amount) <= maximum
      );
    });
    if (accepted)
      return {
        capabilityId: match[1]!,
        resourceUrl: url.href,
        rank: index + 1,
        description: resource.description ?? "",
      };
  }
  throw new Error(
    "No policy-compatible Relay result was found. No payment authorized.",
  );
}
