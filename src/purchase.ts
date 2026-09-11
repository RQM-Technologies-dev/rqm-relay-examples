import { schemaValidator } from "./schema-validation.js";
import { writeFileSync, renameSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { purchaseCommand } from "./command.js";
import { approvedListing, externalPurchasingReady } from "./listings.js";
import { purchaseState, buyerQuote } from "./protocol.js";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { toClientEvmSigner } from "@x402/evm";
import { wrapFetchWithPayment, x402Client } from "@x402/fetch";
import { privateKeyToAccount } from "viem/accounts";
import {
  searchBazaar,
  chooseRelayResource,
  RELAY_API,
} from "./bazaar-discovery.js";
import {
  sha256,
  verifyReceipt,
  type ExecutionReceipt,
} from "./receipts.js";

import {
  boundedRqmPaymentPolicy,
  readPurchase,
  savePurchase,
  recoverPurchase,
} from "./purchase-recovery.js";

const fetch: typeof globalThis.fetch = (resource, init) => globalThis.fetch(resource, { ...init, redirect: "error", signal: init?.signal ?? AbortSignal.timeout(30_000) });
async function main() {
  const relayApi = process.env.RQM_RELAY_API_URL ?? "https://api.rqm-relay.com";
  if (relayApi !== RELAY_API) throw new Error("This example only purchases from the published Relay API.");
  const recoveryPath = process.env.RQM_RELAY_RECOVERY_FILE;
  if (!recoveryPath)
    throw new Error(
      "RQM_RELAY_RECOVERY_FILE is required inside a private directory.",
    );
  let saved = readPurchase(recoveryPath);
  const command = purchaseCommand(process.argv[2], Boolean(saved));
  if (saved && saved.api !== relayApi)
    throw new Error(
      "Recovery API mismatch; do not send this authorization to another service.",
    );

  if (!saved) {
    let capabilityId = process.env.RQM_RELAY_CAPABILITY_ID ?? (process.env.RQM_RELAY_PROBLEM ? undefined : "diagnose-multichannel-capture-v1");
    let purchasePath = "/v1/run";
    const listingId = process.env.RQM_RELAY_LISTING_ID;
    if (listingId && (process.env.RQM_RELAY_CAPABILITY_ID || process.env.RQM_RELAY_PROBLEM)) throw new Error("Choose a listing OR capability/problem, not both.");
    const listing = listingId ? await approvedListing(listingId, fetch) : null;
    if (listing) capabilityId = listing.capabilityId;
    const problem = process.env.RQM_RELAY_PROBLEM;
    if (problem) {
      if (capabilityId || relayApi !== RELAY_API)
        throw new Error(
          "Problem discovery must not be preselected by capability or API override.",
        );
      const maximum = process.env.RQM_RELAY_MAXIMUM_PRICE_USD ?? "";
      const found = await searchBazaar(problem, maximum);
      const selected = chooseRelayResource(found.resources, maximum);
      capabilityId = selected.capabilityId;
      purchasePath = new URL(selected.resourceUrl).pathname;
      console.log(
        JSON.stringify({
          discovery: "coinbase-bazaar",
          selectedResource: selected.resourceUrl,
          rank: selected.rank,
          returned: found.resources.length,
          partialResults: found.partialResults,
          searchHostFilter: false,
          searchPayerFilter: false,
        }),
      );
    }
    const inputJson = process.env.RQM_RELAY_INPUT_JSON;
    const buyerPrivateKey = process.env.RQM_RELAY_BUYER_PRIVATE_KEY;
    if (!capabilityId || !inputJson || !buyerPrivateKey)
      throw new Error(
        "Capability, input, and buyer private key are required for a new purchase.",
      );
    if (!/^0x[a-fA-F0-9]{64}$/u.test(buyerPrivateKey))
      throw new Error("RQM_RELAY_BUYER_PRIVATE_KEY must be a 32-byte hex key");
    const maximumPrice = process.env.RQM_RELAY_MAXIMUM_PRICE_USD ?? "";
    const paymentPolicy = boundedRqmPaymentPolicy(maximumPrice);
    const readiness = await fetch(`${relayApi}/ready`, { redirect: "error" });
    const readyBody: unknown = await readiness.json();
    if (listing && !listing.firstParty ? !externalPurchasingReady(readyBody, readiness.status) : purchaseState(readyBody, readiness.status) !== "public")
      throw new Error("Public purchasing is not open. No payment authorized.");
    const contractResponse = await fetch(`${relayApi}/v1/capabilities/${encodeURIComponent(capabilityId)}`);
    if (!contractResponse.ok) throw new Error("Capability contract unavailable.");
    const contract = await contractResponse.json() as { id: string; inputSchema: object };
    if (contract.id !== capabilityId || !schemaValidator().validate(contract.inputSchema, JSON.parse(inputJson)))
      throw new Error("Input does not match the selected service contract. No payment authorized.");
    const quoteResponse = await fetch(`${relayApi}/v1/quote`, {
      method: "POST",
      redirect: "error",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        capabilityId,
        maximumPriceUsd: maximumPrice,
        requiredNetwork: "eip155:8453",
        requiredAsset: "USDC",
      }),
    });
    if (!quoteResponse.ok)
      throw new Error(`quote returned ${quoteResponse.status}`);
    const rawQuote = await quoteResponse.json() as { providerId?: string };
    const quote = buyerQuote(rawQuote, capabilityId);
    if (!quote || Date.parse(quote.expiresAt) <= Date.now() || (listing && rawQuote.providerId !== listing.providerId) || BigInt(quote.maximumTotalPrice.replace(".", "")) > BigInt(maximumPrice.replace(".", ""))) throw new Error("Quote differs from the selected route or spending limit. No payment authorized.");
    const runBody = JSON.stringify({
      quoteId: quote.quoteId,
      input: JSON.parse(inputJson) as unknown,
    });
    const idempotencyKey =
      process.env.RQM_RELAY_IDEMPOTENCY_KEY ?? crypto.randomUUID();
    const runHeaders = {
      "content-type": "application/json",
      "idempotency-key": idempotencyKey,
    };
    const signer = toClientEvmSigner(
      privateKeyToAccount(buyerPrivateKey as `0x${string}`),
    );
    const recordingFetch: typeof fetch = async (resource, options) => {
      const headers = new Headers(
        options?.headers ??
          (resource instanceof Request ? resource.headers : undefined),
      );
      const paymentSignature = headers.get("PAYMENT-SIGNATURE");
      if (paymentSignature) {
        const request = new Request(resource, options);
        if (
          request.url !== `${relayApi}${purchasePath}` ||
          request.method !== "POST" ||
          (await request.clone().text()) !== runBody
        )
          throw new Error(
            "Signed request does not match the intended purchase.",
          );
        savePurchase(recoveryPath, {
          version: 1,
          api: relayApi,
          capabilityId,
          body: runBody,
          idempotencyKey,
          paymentSignature,
          purchasePath,
          ...(listing ? { providerId: listing.providerId } : {}),
        });
      }
      return fetch(resource, {
        ...options,
        redirect: "error",
        signal: AbortSignal.timeout(120_000),
      });
    };
    const client = new x402Client()
      .register("eip155:8453", new ExactEvmScheme(signer))
      .registerPolicy(paymentPolicy);
    const paidFetch = wrapFetchWithPayment(recordingFetch, client);
    try {
      await paidFetch(`${relayApi}${purchasePath}`, {
        method: "POST",
        headers: runHeaders,
        body: runBody,
      });
    } catch {
      // If the response was lost after sending, the saved request is authoritative.
      // Never print SDK errors: they can contain confidential request material.
    } finally {
      delete process.env.RQM_RELAY_BUYER_PRIVATE_KEY;
    }
    saved = readPurchase(recoveryPath);
    if (!saved)
      throw new Error(
        "No paid request was sent; check readiness and wallet configuration.",
      );
  }
  // No signer or buyer key is needed when this process resumes an existing purchase.
  delete process.env.RQM_RELAY_BUYER_PRIVATE_KEY;
  const acceptedResponse = await recoverPurchase(saved);
  if (!acceptedResponse.headers.get("PAYMENT-RESPONSE"))
    throw new Error(
      "Accepted purchase is missing settlement evidence; retain recovery data.",
    );
  const accepted = (await acceptedResponse.json()) as {
    jobId: string;
    resultAccessToken: string;
    resultAccessExpiresAt: string;
  };
  const authorization = {
    authorization: `Bearer ${accepted.resultAccessToken}`,
  };

  let terminal: { status: string; receiptId: string | null } | null = null;
  for (let attempt = 0; attempt < 900; attempt += 1) {
    const response = await fetch(`${relayApi}/v1/jobs/${accepted.jobId}`, {
      headers: authorization,
    });
    if (!response.ok)
      throw new Error(`job polling returned ${response.status}`);
    terminal = (await response.json()) as {
      status: string;
      receiptId: string | null;
    };
    if (["succeeded", "failed"].includes(terminal.status)) break;
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }
  if (!terminal || !["succeeded", "failed"].includes(terminal.status))
    throw new Error("job did not reach a terminal state");

  const resultResponse = await fetch(
    `${relayApi}/v1/jobs/${accepted.jobId}/result`,
    { headers: authorization },
  );
  if (!resultResponse.ok)
    throw new Error(`result retrieval returned ${resultResponse.status}`);
  const result = (await resultResponse.json()) as {
    jobId: string;
    result: unknown;
    resultHash: string | null;
    receiptId: string | null;
  };
  if (!result.receiptId) throw new Error("terminal result has no receipt");

  const receiptResponse = await fetch(
    `${relayApi}/v1/receipts/${result.receiptId}`,
    { headers: authorization },
  );
  if (!receiptResponse.ok)
    throw new Error(`receipt retrieval returned ${receiptResponse.status}`);
  const receipt = (await receiptResponse.json()) as ExecutionReceipt;
  const intended = JSON.parse(saved.body) as {
    quoteId: string;
    input: unknown;
  };
  if (
    !verifyReceipt(receipt) ||
    receipt.resultHash !== result.resultHash ||
    result.jobId !== accepted.jobId ||
    receipt.relayJobId !== accepted.jobId ||
    receipt.quoteId !== intended.quoteId ||
    receipt.capabilityId !== saved.capabilityId ||
    (saved.providerId !== undefined && receipt.providerId !== saved.providerId) ||
    receipt.inputHash !== sha256(intended.input) ||
    receipt.outcome !== terminal.status ||
    (terminal.status === "succeeded" &&
      (!receipt.schemaValid || sha256(result.result) !== result.resultHash))
  )
    throw new Error("signed receipt verification failed");

  if (terminal.status === "succeeded") {
    const contractResponse = await fetch(`${relayApi}/v1/capabilities/${encodeURIComponent(saved.capabilityId)}`);
    if (!contractResponse.ok) throw new Error("Result contract unavailable; retain recovery file.");
    const contract = await contractResponse.json() as { id: string; version: string; outputSchema: object };
    if (contract.id !== saved.capabilityId || contract.version !== receipt.capabilityVersion || !schemaValidator().validate(contract.outputSchema, result.result))
      throw new Error("Result contract validation failed; retain recovery file.");
  }
  const temporary = join(dirname(recoveryPath), `.result-${crypto.randomUUID()}.tmp`);
  try {
    writeFileSync(temporary, JSON.stringify({ result, receipt }, null, 2) + "\n", { mode: 0o600, flag: "wx" });
    renameSync(temporary, join(dirname(recoveryPath), "verified-result.json"));
  } catch (error) {
    try { unlinkSync(temporary); } catch { /* retain original recovery */ }
    throw error;
  }
  console.log(
    JSON.stringify({
      command,
      status: terminal.status,
      jobId: accepted.jobId,
      resultHash: result.resultHash,
      receiptId: receipt.receiptId,
      receiptVerified: true,
      refundStatus: receipt.refundOrCreditStatus,
      privateResultSaved: true,
      resultAccessExpiresAt: accepted.resultAccessExpiresAt,
      recoveryFileRetained: true,
    }),
  );
}
void main()
  .catch(() => {
    console.error(
      "Purchase did not complete. Keep the private recovery file and rerun with the same path; do not authorize another payment.",
    );
    process.exitCode = 1;
  })
  .finally(() => {
    delete process.env.RQM_RELAY_BUYER_PRIVATE_KEY;
  });
