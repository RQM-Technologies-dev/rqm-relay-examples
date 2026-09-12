import {
  decodePaymentRequiredHeader,
  decodePaymentResponseHeader,
} from "@x402/core/http";
import type { PaymentRequired } from "@x402/core/types";
import { z } from "zod";
import { RELAY_API, BASE_USDC, RQM_RECEIVER } from "./bazaar-discovery.js";
import { buyerQuote, purchaseState, type BuyerQuote } from "./protocol.js";
import {
  boundedRqmPaymentPolicy,
  readPurchase,
  recoverPurchase,
  savePurchase,
  type SavedPurchase,
} from "./purchase-recovery.js";
import { sha256, verifyReceipt, type ExecutionReceipt } from "./receipts.js";
import { schemaValidator } from "./schema-validation.js";
import { HostError, HostStore } from "./host-store.js";

export const HOST_CAPABILITY = "diagnose-multichannel-capture-v1";
const PROVIDER = `rqm:wave:${HOST_CAPABILITY}`;
const PATH = `/v1/capabilities/${HOST_CAPABILITY}/run`;
const ContractSchema = z.object({
  id: z.literal(HOST_CAPABILITY),
  version: z.string().min(1),
  inputSchema: z.record(z.string(), z.unknown()),
  outputSchema: z.record(z.string(), z.unknown()),
  source: z.object({ registry: z.literal("rqm-jobs-mcp") }),
});
type Contract = z.infer<typeof ContractSchema>;
type Intent = {
  version: 1;
  purchaseId: string;
  input: unknown;
  inputHash: string;
  maximum: string;
  quote: BuyerQuote & { providerId: string; capabilityVersion: string };
  contract: Contract;
  contractHash: string;
  body: string;
  challenge: PaymentRequired;
};
type Accepted = {
  jobId: string;
  resultAccessToken: string;
  resultAccessExpiresAt: string;
  settlementTransaction: string;
};
export type Confirmation = {
  message: string;
  purchaseId: string;
  inputHash: string;
  total: string;
  maximum: string;
};
export type HostBuyerOptions = {
  store: HostStore;
  fetchImpl?: typeof fetch;
  now?: () => number;
  configuredMaximum?: () => string | undefined;
  sign?: (challenge: PaymentRequired, maximum: string) => Promise<string>;
  recoveryTimeoutMs?: number;
  sleep?: (ms: number) => Promise<void>;
};
const micros = (value: string) => BigInt(value.replace(".", ""));
const contractHash = (c: Contract) =>
  sha256({
    id: c.id,
    version: c.version,
    inputSchema: c.inputSchema,
    outputSchema: c.outputSchema,
  });
const identifier = z.string().uuid();

/** One fixed first-party route; backend quote/purchase/recovery contracts are unchanged. */
export class HostBuyer {
  private readonly fetchImpl: typeof fetch;
  private readonly now: () => number;
  private readonly active = new Set<string>();
  constructor(private readonly options: HostBuyerOptions) {
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.now = options.now ?? Date.now;
  }
  private async request(path: string, init: RequestInit = {}) {
    return this.fetchImpl(`${RELAY_API}${path}`, {
      ...init,
      redirect: "error",
      signal: AbortSignal.timeout(25_000),
    });
  }
  private async ready() {
    const response = await this.request("/ready");
    if (purchaseState(await response.json(), response.status) !== "public")
      throw new HostError("purchasing_paused");
  }
  private async contract(): Promise<Contract> {
    const response = await this.request(`/v1/capabilities/${HOST_CAPABILITY}`);
    if (!response.ok) throw new HostError("contract_unavailable");
    return ContractSchema.parse(await response.json());
  }
  private async challenge(
    intent: Pick<Intent, "body" | "purchaseId" | "maximum"> & {
      quote: BuyerQuote;
    },
  ): Promise<PaymentRequired> {
    const response = await this.request(PATH, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "idempotency-key": intent.purchaseId,
      },
      body: intent.body,
    });
    const header = response.headers.get("payment-required");
    if (response.status !== 402 || !header)
      throw new HostError("unpaid_challenge_unavailable");
    const challenge = decodePaymentRequiredHeader(header);
    const allowed = boundedRqmPaymentPolicy(intent.maximum)(
      challenge.x402Version,
      challenge.accepts,
    );
    if (
      challenge.x402Version !== 2 ||
      challenge.resource?.url !== `${RELAY_API}${PATH}` ||
      challenge.accepts.length !== 1 ||
      allowed.length !== 1 ||
      allowed[0].amount !== micros(intent.quote.maximumTotalPrice).toString() ||
      !Number.isInteger(allowed[0].maxTimeoutSeconds) ||
      allowed[0].maxTimeoutSeconds < 1 ||
      allowed[0].maxTimeoutSeconds > 3600
    )
      throw new HostError("payment_challenge_mismatch");
    return challenge;
  }
  private intent(id: string): Intent {
    const value = this.options.store.read<Intent>(id, "intent.json");
    if (
      !value ||
      value.version !== 1 ||
      value.purchaseId !== id ||
      value.inputHash !== sha256(value.input) ||
      value.quote?.providerId !== PROVIDER ||
      value.contractHash !==
        contractHash(ContractSchema.parse(value.contract)) ||
      value.body !==
        JSON.stringify({ quoteId: value.quote.quoteId, input: value.input })
    )
      throw new HostError("purchase_state_mismatch");
    return value;
  }
  private summary(intent: Intent) {
    return {
      purchaseId: intent.purchaseId,
      capabilityId: HOST_CAPABILITY,
      providerId: PROVIDER,
      inputHash: intent.inputHash,
      providerPrice: intent.quote.providerPrice,
      rqmFee: intent.quote.rqmFee,
      total: intent.quote.maximumTotalPrice,
      maximum: intent.maximum,
      currency: "USDC",
      network: "eip155:8453",
      expiresAt: intent.quote.expiresAt,
      confirmationRequired: true,
      paymentSubmitted: false,
    };
  }
  async prepare(purchaseId: string, input: unknown, maximum: string) {
    identifier.parse(purchaseId);
    boundedRqmPaymentPolicy(maximum);
    if (Buffer.byteLength(JSON.stringify(input)) > 1_048_576)
      throw new HostError("input_too_large");
    const existing = this.options.store.read<Intent>(purchaseId, "intent.json");
    if (existing) {
      const intent = this.intent(purchaseId);
      if (sha256(input) !== intent.inputHash || maximum !== intent.maximum)
        throw new HostError("purchase_id_conflict");
      const signed =
        readPurchase(this.options.store.path(purchaseId, "recovery.json")) !==
        null;
      return {
        ...this.summary(intent),
        status: "existing_purchase",
        paymentSubmitted: signed ? "unknown_use_recovery" : false,
        nextTool: signed ? "recover_purchase" : "purchase_multichannel",
      };
    }
    await this.ready();
    const contract = await this.contract();
    if (!schemaValidator().validate(contract.inputSchema, input))
      throw new HostError("invalid_input");
    const response = await this.request("/v1/quote", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        capabilityId: HOST_CAPABILITY,
        maximumPriceUsd: maximum,
        requiredNetwork: "eip155:8453",
        requiredAsset: "USDC",
      }),
    });
    const raw = (await response.json()) as {
      providerId?: string;
      capabilityVersion?: string;
      fallbackProviderIds?: string[];
    };
    const quote = buyerQuote(raw, HOST_CAPABILITY);
    if (
      !response.ok ||
      !quote ||
      raw.providerId !== PROVIDER ||
      raw.capabilityVersion !== contract.version ||
      (raw.fallbackProviderIds?.length ?? 0) !== 0 ||
      micros(quote.maximumTotalPrice) > micros(maximum) ||
      Date.parse(quote.expiresAt) <= this.now()
    )
      throw new HostError("quote_mismatch");
    const body = JSON.stringify({ quoteId: quote.quoteId, input });
    const intent: Intent = {
      version: 1,
      purchaseId,
      input,
      inputHash: sha256(input),
      maximum,
      quote: {
        ...quote,
        providerId: PROVIDER,
        capabilityVersion: contract.version,
      },
      contract,
      contractHash: contractHash(contract),
      body,
      challenge: await this.challenge({ purchaseId, maximum, quote, body }),
    };
    if (!this.options.store.create(purchaseId, "intent.json", intent)) {
      const saved = this.intent(purchaseId);
      if (saved.inputHash !== intent.inputHash || saved.maximum !== maximum)
        throw new HostError("purchase_id_conflict");
      return this.summary(saved);
    }
    return {
      ...this.summary(intent),
      status: "awaiting_confirmation",
      nextTool: "purchase_multichannel",
    };
  }
  async purchase(
    id: string,
    confirm?: (details: Confirmation) => Promise<boolean>,
    signal?: AbortSignal,
  ) {
    if (this.active.has(id) || this.active.size >= 2)
      return { purchaseId: id, status: "busy", nextTool: "recover_purchase" };
    this.active.add(id);
    try {
      const intent = this.intent(id);
      if (readPurchase(this.options.store.path(id, "recovery.json")))
        return await this.advance(intent);
      if (this.options.store.read(id, "signing-started.json"))
        throw new HostError("signing_interrupted_reconciliation_required");
      if (!confirm) throw new HostError("host_confirmation_unsupported");
      const configured =
        this.options.configuredMaximum?.() ??
        process.env.RQM_RELAY_MAXIMUM_PRICE_USD;
      if (!configured) throw new HostError("spending_ceiling_not_configured");
      boundedRqmPaymentPolicy(configured);
      if (micros(intent.maximum) > micros(configured))
        throw new HostError("configured_ceiling_exceeded");
      if (Date.parse(intent.quote.expiresAt) <= this.now())
        throw new HostError("quote_expired_no_payment");
      const approved = await confirm({
        purchaseId: id,
        inputHash: intent.inputHash,
        total: intent.quote.maximumTotalPrice,
        maximum: intent.maximum,
        message: `Buy one multichannel diagnosis from RQM through Relay? Provider: ${PROVIDER}. Provider price: ${intent.quote.providerPrice} USDC; RQM fee: ${intent.quote.rqmFee} USDC; total: ${intent.quote.maximumTotalPrice} USDC on Base. Receiver: ${RQM_RECEIVER}. Your maximum: ${intent.maximum} USDC. Quote expires: ${intent.quote.expiresAt}. Purchase: ${id}. Input SHA-256: ${intent.inputHash}. This authorizes one payment for this exact request; retries reuse it. Decline to spend nothing.`,
      });
      if (!approved)
        return { purchaseId: id, status: "declined", paymentSubmitted: false };
      if (Date.parse(intent.quote.expiresAt) <= this.now())
        throw new HostError("quote_expired_no_payment");
      await this.ready();
      if (contractHash(await this.contract()) !== intent.contractHash)
        throw new HostError("contract_changed_no_payment");
      const challenge = await this.challenge(intent);
      if (sha256(challenge.accepts) !== sha256(intent.challenge.accepts))
        throw new HostError("payment_challenge_changed");
      if (Date.parse(intent.quote.expiresAt) <= this.now())
        throw new HostError("quote_expired_no_payment");
      // Configuration failures have not begun signing and can be corrected safely.
      if (signal?.aborted) throw new HostError("cancelled_no_payment");
      const sign =
        this.options.sign ??
        (await (await import("./host-signer.js")).createHostSigner());
      if (signal?.aborted) throw new HostError("cancelled_no_payment");
      if (
        !this.options.store.create(id, "signing-started.json", {
          approvedAt: new Date(this.now()).toISOString(),
          inputHash: intent.inputHash,
          quoteId: intent.quote.quoteId,
        })
      )
        throw new HostError("purchase_already_signing");
      try {
        const paymentSignature = await sign(challenge, intent.maximum);
        savePurchase(this.options.store.path(id, "recovery.json"), {
          version: 1,
          api: RELAY_API,
          capabilityId: HOST_CAPABILITY,
          providerId: PROVIDER,
          body: intent.body,
          idempotencyKey: id,
          paymentSignature,
          purchasePath: PATH,
        });
      } catch {
        throw new HostError("signing_incomplete_reconciliation_required");
      }
      return await this.advance(intent);
    } finally {
      this.active.delete(id);
    }
  }
  async recover(id: string) {
    if (this.active.has(id) || this.active.size >= 2)
      return { purchaseId: id, status: "busy" };
    this.active.add(id);
    try {
      return await this.advance(this.intent(id));
    } finally {
      this.active.delete(id);
    }
  }
  private saved(intent: Intent): SavedPurchase {
    const saved = readPurchase(
      this.options.store.path(intent.purchaseId, "recovery.json"),
    );
    if (!saved) throw new HostError("no_authorization_to_recover");
    if (
      saved.api !== RELAY_API ||
      saved.body !== intent.body ||
      saved.idempotencyKey !== intent.purchaseId ||
      saved.capabilityId !== HOST_CAPABILITY ||
      saved.providerId !== PROVIDER ||
      saved.purchasePath !== PATH
    )
      throw new HostError("purchase_state_mismatch");
    return saved;
  }
  private async accept(intent: Intent): Promise<Accepted> {
    const response = await recoverPurchase(this.saved(intent), {
      fetchImpl: this.fetchImpl,
      now: this.now,
      timeoutMs: this.options.recoveryTimeoutMs ?? 20_000,
      ...(this.options.sleep ? { sleep: this.options.sleep } : {}),
    });
    const header = response.headers.get("payment-response");
    if (!header) throw new HostError("settlement_evidence_missing");
    const settlement = decodePaymentResponseHeader(header);
    if (
      !settlement.success ||
      settlement.network !== "eip155:8453" ||
      !/^0x[0-9a-f]{64}$/i.test(settlement.transaction)
    )
      throw new HostError("settlement_evidence_mismatch");
    const accepted = z
      .object({
        jobId: z.string().uuid(),
        resultAccessToken: z.string().min(1),
        resultAccessExpiresAt: z.string().datetime(),
      })
      .parse(await response.json());
    const value = {
      ...accepted,
      settlementTransaction: settlement.transaction,
    };
    const previous = this.options.store.read<Accepted>(
      intent.purchaseId,
      "accepted.json",
    );
    if (
      previous &&
      (previous.jobId !== accepted.jobId ||
        previous.settlementTransaction !== settlement.transaction)
    )
      throw new HostError("recovery_identity_mismatch");
    this.options.store.write(intent.purchaseId, "accepted.json", value);
    return value;
  }
  private async advance(intent: Intent): Promise<Record<string, unknown>> {
    this.saved(intent); // Always bind recovered requests before using saved access tokens.
    try {
      let accepted = this.options.store.read<Accepted>(
        intent.purchaseId,
        "accepted.json",
      );
      if (!accepted || Date.parse(accepted.resultAccessExpiresAt) <= this.now())
        accepted = await this.accept(intent);
      const get = (path: string) =>
        this.request(path, {
          headers: { authorization: `Bearer ${accepted.resultAccessToken}` },
        });
      const statusResponse = await get(`/v1/jobs/${accepted.jobId}`);
      if (statusResponse.status === 401 || statusResponse.status === 403) {
        await this.accept(intent);
        return {
          purchaseId: intent.purchaseId,
          status: "recovery_pending",
          nextTool: "recover_purchase",
        };
      }
      if (!statusResponse.ok) throw new HostError("retrieval_unavailable");
      const status = z
        .object({ status: z.string(), receiptId: z.string().nullable() })
        .parse(await statusResponse.json());
      if (!["succeeded", "failed"].includes(status.status))
        return {
          purchaseId: intent.purchaseId,
          status: "execution_pending",
          nextTool: "recover_purchase",
        };
      const resultResponse = await get(`/v1/jobs/${accepted.jobId}/result`);
      if (!resultResponse.ok) throw new HostError("retrieval_unavailable");
      const result = z
        .object({
          jobId: z.string().uuid(),
          result: z.unknown(),
          resultHash: z.string().nullable(),
          receiptId: z.string().uuid(),
        })
        .parse(await resultResponse.json());
      const receiptResponse = await get(`/v1/receipts/${result.receiptId}`);
      if (!receiptResponse.ok) throw new HostError("receipt_unavailable");
      const receipt = (await receiptResponse.json()) as ExecutionReceipt;
      if (
        !verifyReceipt(receipt) ||
        result.jobId !== accepted.jobId ||
        receipt.relayJobId !== accepted.jobId ||
        receipt.receiptId !== result.receiptId ||
        status.receiptId !== result.receiptId ||
        receipt.quoteId !== intent.quote.quoteId ||
        receipt.capabilityId !== HOST_CAPABILITY ||
        receipt.capabilityVersion !== intent.contract.version ||
        receipt.providerId !== PROVIDER ||
        receipt.inputHash !== intent.inputHash ||
        receipt.providerPrice !== intent.quote.providerPrice ||
        receipt.rqmFee !== intent.quote.rqmFee ||
        receipt.totalAmount !== intent.quote.maximumTotalPrice ||
        receipt.network !== "eip155:8453" ||
        receipt.asset !== "USDC" ||
        receipt.outcome !== status.status ||
        receipt.resultHash !== result.resultHash ||
        (receipt.tokenContract !== undefined &&
          receipt.tokenContract.toLowerCase() !== BASE_USDC) ||
        (receipt.buyerPaymentTransactionHash !== undefined &&
          receipt.buyerPaymentTransactionHash !==
            accepted.settlementTransaction) ||
        (receipt.idempotencyKeyHash !== undefined &&
          receipt.idempotencyKeyHash !== sha256(intent.purchaseId)) ||
        (status.status === "succeeded" &&
          (!receipt.schemaValid ||
            result.resultHash !== sha256(result.result) ||
            !schemaValidator().validate(
              intent.contract.outputSchema,
              result.result,
            )))
      )
        throw new HostError("receipt_verification_failed");
      if (
        !["not_applicable", "pending", "refunded", "credited"].includes(
          receipt.refundOrCreditStatus,
        )
      )
        throw new HostError("refund_state_unknown");
      const report = {
        purchaseId: intent.purchaseId,
        status: status.status,
        jobId: accepted.jobId,
        result: result.result,
        receiptVerified: true,
        receiptId: receipt.receiptId,
        resultHash: result.resultHash,
        providerPrice: receipt.providerPrice,
        rqmFee: receipt.rqmFee,
        total: receipt.totalAmount,
        refundStatus: receipt.refundOrCreditStatus,
        recoveryFileRetained: true,
        ...(status.status === "failed" &&
        receipt.refundOrCreditStatus !== "refunded"
          ? { nextTool: "recover_purchase", recoveryPending: true }
          : {}),
      };
      this.options.store.write(intent.purchaseId, "verified-result.json", {
        result,
        receipt,
      });
      return report;
    } catch (error) {
      return {
        purchaseId: intent.purchaseId,
        status: "recovery_required",
        reason:
          error instanceof HostError ? error.code : "pending_or_unverified",
        nextTool: "recover_purchase",
        recoveryFileRetained: true,
        authorizeAgain: false,
      };
    }
  }
}
