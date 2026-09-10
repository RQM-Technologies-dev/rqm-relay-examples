import { afterEach, describe, expect, it, vi } from "vitest";
import { chmodSync, mkdtempSync, rmSync, statSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  boundedRqmPaymentPolicy,
  readPurchase,
  savePurchase,
  recoverPurchase,
  type SavedPurchase,
} from "../src/purchase-recovery.js";

const directories: string[] = [];
const purchase: SavedPurchase = {
  version: 1,
  api: "https://relay.example",
  capabilityId: "fixture",
  body: '{"quoteId":"expired-quote","input":{"n":1}}',
  idempotencyKey: "same-purchase",
  paymentSignature: "fixture-authorization",
};
function file() {
  const directory = mkdtempSync(join(tmpdir(), "relay-example-"));
  directories.push(directory);
  return join(directory, "recovery.json");
}
afterEach(() => {
  for (const directory of directories.splice(0))
    rmSync(directory, { recursive: true, force: true });
});

describe("client purchase recovery", () => {
  it("rejects an excessive price, a different receiver, asset, network, or protocol before signing", () => {
    const policy = boundedRqmPaymentPolicy("0.007000");
    const requirement = {
      scheme: "exact",
      network: "eip155:8453" as const,
      asset: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
      payTo: "0x8f43274b121663b18a0246e9908bac8eac866c12",
      amount: "7000",
      maxTimeoutSeconds: 300,
      extra: {},
    };
    expect(policy(2, [requirement])).toEqual([requirement]);
    expect(policy(1, [requirement])).toEqual([]);
    for (const changed of [
      { ...requirement, amount: "7001" },
      { ...requirement, amount: "-1" },
      { ...requirement, payTo: "0xanother" },
      { ...requirement, asset: "0xanother" },
      { ...requirement, network: "eip155:1" as const },
    ])
      expect(policy(2, [changed])).toEqual([]);
    expect(() => boundedRqmPaymentPolicy("1.000001")).toThrow("at most 1 USDC");
  });
  it("resumes after a lost response and restart with exactly the original signed request", async () => {
    const path = file();
    savePurchase(path, purchase);
    expect(statSync(path).mode & 0o777).toBe(0o600);
    const restarted = readPurchase(path)!;
    let time = 0;
    const fetcher = vi
      .fn()
      .mockRejectedValueOnce(new Error("lost response"))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ error: "settlement_pending_finality" }), {
          status: 503,
          headers: { "retry-after": "20" },
        }),
      )
      .mockResolvedValueOnce(new Response("{}", { status: 202 }));
    const result = await recoverPurchase(restarted, {
      fetchImpl: fetcher,
      now: () => time,
      sleep: async (ms) => {
        time += ms;
      },
    });
    expect(result.status).toBe(202);
    expect(time).toBe(35000);
    for (const [url, options] of fetcher.mock.calls) {
      expect(url).toBe("https://relay.example/v1/run");
      expect(options.body).toBe(purchase.body);
      expect(options.headers["idempotency-key"]).toBe(purchase.idempotencyKey);
      expect(options.headers["PAYMENT-SIGNATURE"]).toBe(
        purchase.paymentSignature,
      );
      expect(options.redirect).toBe("error");
    }
    expect(readPurchase(path)).toEqual(purchase);
  });

  it.each([502, 503, 504])(
    "recovers through a gateway %i without changing or replacing the saved purchase",
    async (status) => {
      const path = file();
      savePurchase(path, purchase);
      let time = 0;
      const fetcher = vi
        .fn()
        .mockResolvedValueOnce(
          new Response("<html>unavailable</html>", { status }),
        )
        .mockResolvedValueOnce(new Response("{}", { status: 202 }));
      const response = await recoverPurchase(readPurchase(path)!, {
        fetchImpl: fetcher,
        now: () => time,
        sleep: async (ms) => {
          time += ms;
        },
      });
      expect(response.status).toBe(202);
      expect(fetcher).toHaveBeenCalledTimes(2);
      for (const [url, options] of fetcher.mock.calls) {
        expect(url).toBe("https://relay.example/v1/run");
        expect(options.body).toBe(purchase.body);
        expect(options.headers["idempotency-key"]).toBe(
          purchase.idempotencyKey,
        );
        expect(options.headers["PAYMENT-SIGNATURE"]).toBe(
          purchase.paymentSignature,
        );
      }
      expect(readPurchase(path)).toEqual(purchase);
    },
  );

  it("stops on a structured 503 rejection and retains the original purchase", async () => {
    const path = file();
    savePurchase(path, purchase);
    const fetcher = vi
      .fn()
      .mockResolvedValue(
        Response.json(
          { error: "buyer_forbidden", retryable: false },
          { status: 503 },
        ),
      );
    await expect(
      recoverPurchase(readPurchase(path)!, { fetchImpl: fetcher }),
    ).rejects.toThrow("retain the private recovery file");
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(readPurchase(path)).toEqual(purchase);
  });

  it("retains recovery data when finality exceeds the retry window", async () => {
    const path = file();
    savePurchase(path, purchase);
    let time = 0;
    await expect(
      recoverPurchase(readPurchase(path)!, {
        fetchImpl: vi
          .fn()
          .mockResolvedValue(
            new Response(
              JSON.stringify({ error: "settlement_pending_finality" }),
              { status: 503 },
            ),
          ),
        timeoutMs: 1000,
        now: () => time,
        sleep: async (ms) => {
          time += ms;
        },
      }),
    ).rejects.toThrow("Keep the recovery file");
    expect(readPurchase(path)).toEqual(purchase);
  });

  it("never replaces an unresolved authorization or input", () => {
    const path = file();
    savePurchase(path, purchase);
    savePurchase(path, purchase);
    for (const changed of [
      { ...purchase, paymentSignature: "another-authorization" },
      { ...purchase, body: "{}" },
    ])
      expect(() => savePurchase(path, changed)).toThrow("Existing purchase");
    expect(readPurchase(path)).toEqual(purchase);
  });

  it("rejects shared files and symlinks before reading confidential data", () => {
    const path = file();
    savePurchase(path, purchase);
    chmodSync(path, 0o644);
    expect(() => readPurchase(path)).toThrow("private regular file");
    chmodSync(path, 0o600);
    const link = path + ".link";
    symlinkSync(path, link);
    expect(() => readPurchase(link)).toThrow("private regular file");
  });

  it("stops on a payment discrepancy without deleting the original request", async () => {
    const path = file();
    savePurchase(path, purchase);
    const fetcher = vi
      .fn()
      .mockResolvedValue(new Response("{}", { status: 409 }));
    await expect(
      recoverPurchase(purchase, { fetchImpl: fetcher }),
    ).rejects.toThrow("do not authorize again");
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(readPurchase(path)).toEqual(purchase);
  });
});
