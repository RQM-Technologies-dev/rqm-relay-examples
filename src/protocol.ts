export type PurchaseState = "public" | "restricted" | "paused" | "unavailable";

function object(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

/** Unknown or incomplete readiness must never become a purchase invitation. */
export function purchaseState(
  value: unknown,
  httpStatus: number | null,
): PurchaseState {
  const ready = object(value);
  if (
    httpStatus === null ||
    ![200, 503].includes(httpStatus) ||
    (ready.status !== "ready" && ready.status !== "not_ready")
  )
    return "unavailable";
  const mode = object(ready.mode);
  const flags = object(ready.flags);
  const limits = object(mode.publicPurchaseLimits);
  if (
    httpStatus !== 200 ||
    ready.status !== "ready" ||
    mode.enabled !== true ||
    mode.ready !== true ||
    mode.accountCoreCompatible !== true ||
    limits.admission_enabled !== true ||
    flags.firstPartyExecutionEnabled !== true ||
    flags.buyerPaymentEnabled !== true ||
    flags.mainnetEnabled !== true
  )
    return "paused";
  if (mode.payerAccessMode === "public") return "public";
  if (mode.payerAccessMode === "allowlist") return "restricted";
  return "unavailable";
}

export interface BuyerQuote {
  quoteId: string;
  capabilityId: string;
  providerPrice: string;
  rqmFee: string;
  maximumTotalPrice: string;
  expiresAt: string;
  network: string;
  asset: string;
}

export function buyerQuote(
  value: unknown,
  capabilityId: string,
): BuyerQuote | null {
  const q = object(value);
  const amounts = [q.providerPrice, q.rqmFee, q.maximumTotalPrice];
  if (
    q.capabilityId !== capabilityId ||
    typeof q.quoteId !== "string" ||
    typeof q.expiresAt !== "string" ||
    !Number.isFinite(Date.parse(q.expiresAt)) ||
    q.network !== "eip155:8453" ||
    q.asset !== "USDC" ||
    amounts.some((v) => typeof v !== "string" || !/^\d+\.\d{6}$/.test(v))
  )
    return null;
  const micros = (value: unknown) => {
    if (typeof value !== "string") throw new Error("Invalid quoted amount");
    return BigInt(value.replace(".", ""));
  };
  if (
    micros(q.providerPrice) + micros(q.rqmFee) !==
    micros(q.maximumTotalPrice)
  )
    return null;
  return q as unknown as BuyerQuote;
}
