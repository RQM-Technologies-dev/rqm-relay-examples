import { RELAY_API } from "./bazaar-discovery.js";
export interface ApprovedListing { id: string; providerId: string; capabilityId: string; access: "run_through_relay"; firstParty: boolean; }
export async function approvedListing(id: string, fetchImpl: typeof fetch = fetch): Promise<ApprovedListing> {
  if (!id || id.length > 300) throw new Error("Invalid listing ID");
  const response = await fetchImpl(`${RELAY_API}/v1/listings/${encodeURIComponent(id)}`, { redirect: "error", signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error("Listing unavailable");
  const item = await response.json() as Partial<ApprovedListing>;
  if (item.id !== id || item.access !== "run_through_relay" || typeof item.providerId !== "string" || !item.providerId || typeof item.capabilityId !== "string" || !/^[a-z0-9][a-z0-9._-]{0,159}$/.test(item.capabilityId) || typeof item.firstParty !== "boolean") throw new Error("This listing has no approved Relay purchase route. No payment authorized.");
  return item as ApprovedListing;
}
export function externalPurchasingReady(value: unknown, status: number): boolean {
  const ready = value as {status?:string;flags?:{externalExecutionEnabled?:boolean;externalProviderPaymentsEnabled?:boolean;buyerPaymentEnabled?:boolean;mainnetEnabled?:boolean};mode?:{ready?:boolean;accountCoreCompatible?:boolean;payerAccessMode?:string;publicPurchaseLimits?:{admission_enabled?:boolean}}};
  return status === 200 && ready?.status === "ready" && ready.flags?.externalExecutionEnabled === true && ready.flags.externalProviderPaymentsEnabled === true && ready.flags.buyerPaymentEnabled === true && ready.flags.mainnetEnabled === true && ready.mode?.ready === true && ready.mode.accountCoreCompatible === true && ready.mode.payerAccessMode === "public" && ready.mode.publicPurchaseLimits?.admission_enabled === true;
}
