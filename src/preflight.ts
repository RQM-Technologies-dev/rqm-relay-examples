import { pathToFileURL } from "node:url";
import { decodePaymentRequiredHeader } from "@x402/core/http";
type CapabilityContract = { id: string; source: { registry: string }; validation: { fixtures: Array<{ id: string; input: unknown }> } };
import { buyerQuote, purchaseState } from "./protocol.js";
import { RELAY_API, BASE_USDC, RQM_RECEIVER } from "./bazaar-discovery.js";

/** Public fixtures and an unsigned 402 request only. Never loads a wallet. */
export async function capabilityPreflight(
  id: string,
  fetchImpl: typeof fetch = fetch,
) {
  if (!/^[a-z0-9][a-z0-9.-]{0,159}$/.test(id))
    throw new Error("Invalid capability ID");
  const request = (path: string, init: RequestInit = {}) =>
    fetchImpl(`${RELAY_API}${path}`, {
      ...init,
      redirect: "error",
      signal: AbortSignal.timeout(30000),
    });
  const readyResponse = await request("/ready");
  const readiness: unknown = await readyResponse.json();
  const contractResponse = await request(`/v1/capabilities/${id}`);
  if (!contractResponse.ok) throw new Error("Capability unavailable");
  const capability = (await contractResponse.json()) as CapabilityContract;
  const fixture = capability.validation?.fixtures?.[0];
  if (
    capability.id !== id ||
    capability.source?.registry !== "rqm-jobs-mcp" ||
    !fixture?.id ||
    fixture.input === undefined
  )
    throw new Error("First-party public fixture missing");
  const quoteResponse = await request("/v1/quote", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      capabilityId: id,
      maximumPriceUsd: "1.000000",
      requiredNetwork: "eip155:8453",
      requiredAsset: "USDC",
    }),
  });
  const quote = buyerQuote(await quoteResponse.json(), id);
  if (!quoteResponse.ok || !quote || Date.parse(quote.expiresAt) <= Date.now())
    throw new Error("Invalid or expired quote");
  const amount = BigInt(quote.maximumTotalPrice.replace(".", ""));
  if (amount <= 0n || amount > 1000000n)
    throw new Error("Quote outside demo budget");
  const path = `/v1/capabilities/${id}/run`;
  const challenge = await request(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      quoteId: quote.quoteId,
      input: fixture.input,
      idempotencyKey: `unpaid-demo-${crypto.randomUUID()}`,
    }),
  });
  const header = challenge.headers.get("payment-required");
  if (challenge.status !== 402 || !header)
    throw new Error("Unpaid fixture challenge unavailable");
  const payment = decodePaymentRequiredHeader(header);
  const accepted = payment.accepts[0];
  if (
    payment.x402Version !== 2 ||
    payment.resource?.url !== `${RELAY_API}${path}` ||
    payment.accepts.length !== 1 ||
    accepted?.scheme !== "exact" ||
    accepted.network !== "eip155:8453" ||
    accepted.asset.toLowerCase() !== BASE_USDC ||
    accepted.payTo.toLowerCase() !== RQM_RECEIVER ||
    accepted.amount !== amount.toString()
  )
    throw new Error("Payment challenge identity mismatch");
  return {
    capabilityId: id,
    fixtureId: fixture.id,
    providerPrice: quote.providerPrice,
    relayFee: quote.rqmFee,
    total: quote.maximumTotalPrice,
    purchaseState: purchaseState(readiness, readyResponse.status),
    unpaidFixtureChallengeVerified: true,
    paymentSubmissions: 0,
    paidExecutionVerified: false,
  };
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const id =
    process.argv.slice(2).filter((arg) => arg !== "--")[0] ??
    "diagnose-multichannel-capture-v1";
  capabilityPreflight(id)
    .then((report) => {
      console.log(JSON.stringify(report, null, 2));
      if (report.purchaseState !== "public") process.exitCode = 2;
    })
    .catch(() => {
      console.error("Capability preflight incomplete. No payment submitted.");
      process.exitCode = 1;
    });
}
