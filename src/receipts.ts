import {
  createHash,
  createPublicKey,
  verify,
} from "node:crypto";

export interface ExecutionReceipt {
  receiptId: string;
  relayJobId?: string;
  quoteId: string;
  capabilityId: string;
  capabilityVersion: string;
  providerId: string;
  attempts: Array<{
    providerId: string;
    outcome: string;
    startedAt: string;
    completedAt: string;
  }>;
  inputHash: string;
  resultHash: string | null;
  providerPrice: string;
  rqmFee: string;
  totalAmount: string;
  network: string;
  asset: string;
  transactionIds: string[];
  providerCorrelationId?: string;
  idempotencyKeyHash?: string;
  tokenContract?: string;
  buyerPaymentTransactionHash?: string;
  providerPaymentTransactionHash?: string;
  providerRefundTransactionHash?: string;
  buyerPassThroughTransactionHash?: string;
  buyerRefundTransactionHash?: string;
  accountCoreOperationId?: string;
  compensationTransactionHash?: string;
  providerManifestHash?: string;
  startedAt: string;
  completedAt: string;
  latencyMs: number;
  schemaValid: boolean;
  outcome: "succeeded" | "failed";
  refundOrCreditStatus: "not_applicable" | "pending" | "refunded" | "credited";
  relayVersion: string;
  signingKeyId?: string;
  signature: string;
  publicKey: string;
}
export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`)
    .join(",")}}`;
}
export function sha256(value: unknown): string {
  return createHash("sha256")
    .update(typeof value === "string" ? value : canonicalJson(value))
    .digest("hex");
}
export function verifyReceipt(receipt: ExecutionReceipt): boolean {
  const { signature, publicKey, ...payload } = receipt;
  return verify(
    null,
    Buffer.from(canonicalJson(payload)),
    createPublicKey(publicKey),
    Buffer.from(signature, "base64url"),
  );
}
