import {
  closeSync,
  fsyncSync,
  lstatSync,
  openSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, isAbsolute } from "node:path";
import type { PaymentPolicy } from "@x402/fetch";

export function boundedRqmPaymentPolicy(maximumPrice: string): PaymentPolicy {
  if (!/^\d+\.\d{6}$/.test(maximumPrice))
    throw new Error("Use a fixed six-decimal USDC maximum.");
  const maximum = BigInt(maximumPrice.replace(".", ""));
  if (maximum <= 0n || maximum > 1_000_000n)
    throw new Error("Purchase maximum must be positive and at most 1 USDC.");
  return (version, requirements) =>
    version !== 2
      ? []
      : requirements.filter(
          (requirement) =>
            requirement.scheme === "exact" &&
            requirement.network === "eip155:8453" &&
            requirement.asset.toLowerCase() ===
              "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913" &&
            requirement.payTo.toLowerCase() ===
              "0x8f43274b121663b18a0246e9908bac8eac866c12" &&
            /^\d+$/.test(requirement.amount) &&
            BigInt(requirement.amount) > 0n &&
            BigInt(requirement.amount) <= maximum,
        );
}

export type SavedPurchase = {
  version: 1;
  api: string;
  capabilityId: string;
  body: string;
  idempotencyKey: string;
  paymentSignature: string;
  purchasePath?: string;
  providerId?: string;
};

/** The parent directory and file contain confidential purchase recovery data. */
export function readPurchase(path: string): SavedPurchase | null {
  if (
    !isAbsolute(path) ||
    !lstatSync(dirname(path)).isDirectory() ||
    (lstatSync(dirname(path)).mode & 0o077) !== 0
  )
    throw new Error(
      "Use an absolute recovery path inside a private directory (mode 0700).",
    );
  let stat;
  try {
    stat = lstatSync(path);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
  if (!stat.isFile() || (stat.mode & 0o077) !== 0)
    throw new Error("Recovery must be a private regular file (mode 0600).");
  const value = JSON.parse(readFileSync(path, "utf8")) as SavedPurchase;
  if (
    value.version !== 1 ||
    (value.providerId !== undefined && (typeof value.providerId !== "string" || !value.providerId)) ||
    [
      value.api,
      value.capabilityId,
      value.body,
      value.idempotencyKey,
      value.paymentSignature,
    ].some((v) => typeof v !== "string" || !v)
  )
    throw new Error("Invalid recovery file; do not create another payment.");
  purchaseUrl(value);
  return value;
}

/** Bind a saved signature to its original route, including across restart. */
export function purchaseUrl(purchase: SavedPurchase): string {
  const path = purchase.purchasePath ?? "/v1/run";
  if (
    path !== "/v1/run" &&
    path !== `/v1/capabilities/${encodeURIComponent(purchase.capabilityId)}/run`
  )
    throw new Error(
      "Recovery purchase route mismatch; do not authorize again.",
    );
  return `${purchase.api}${path}`;
}

/** Persist before sending. A second authorization cannot replace this purchase. */
export function savePurchase(path: string, purchase: SavedPurchase): void {
  const existing = readPurchase(path);
  if (existing) {
    if (JSON.stringify(existing) !== JSON.stringify(purchase))
      throw new Error(
        "Existing purchase must be recovered before another authorization.",
      );
    return;
  }
  const fd = openSync(path, "wx", 0o600);
  try {
    writeFileSync(fd, JSON.stringify(purchase) + "\n");
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
  const parent = openSync(dirname(path), "r");
  try {
    fsyncSync(parent);
  } finally {
    closeSync(parent);
  }
}

/** Retries never invoke a signer, including after process restart or quote expiry. */
export async function recoverPurchase(
  purchase: SavedPurchase,
  options: {
    fetchImpl?: typeof fetch;
    now?: () => number;
    sleep?: (ms: number) => Promise<void>;
    timeoutMs?: number;
  } = {},
): Promise<Response> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const now = options.now ?? Date.now;
  const sleep =
    options.sleep ??
    ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
  const deadline = now() + (options.timeoutMs ?? 45 * 60_000);
  while (now() < deadline) {
    let response: Response | undefined;
    try {
      response = await fetchImpl(purchaseUrl(purchase), {
        method: "POST",
        redirect: "error",
        signal: AbortSignal.timeout(
          Math.max(1, Math.min(120_000, deadline - now())),
        ),
        headers: {
          "content-type": "application/json",
          "idempotency-key": purchase.idempotencyKey,
          "PAYMENT-SIGNATURE": purchase.paymentSignature,
        },
        body: purchase.body,
      });
    } catch {
      /* A lost response is uncertain; retain and replay the same purchase. */
    }
    let delay = 15_000;
    if (response) {
      if (response.ok) return response;
      if (response.status === 503) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        // A gateway can return HTML or an empty body after collection.
        // Treat that response as uncertain and replay the saved purchase.
        if (body !== null && body.error !== "settlement_pending_finality")
          throw new Error(
            "Purchase requires recovery; retain the private recovery file.",
          );
      } else if (![429, 502, 504].includes(response.status)) {
        throw new Error(
          "Purchase requires reconciliation; do not authorize again.",
        );
      }
      const retryAfter = response.headers.get("retry-after");
      if (retryAfter && /^\d+$/.test(retryAfter))
        delay = Math.max(delay, Number(retryAfter) * 1000);
    }
    await sleep(Math.min(delay, Math.max(0, deadline - now())));
  }
  throw new Error(
    "Purchase is still pending. Keep the recovery file and rerun without signing again.",
  );
}
