import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

// This probe never calls purchase_multichannel and deliberately excludes keys.
const repository = dirname(dirname(fileURLToPath(import.meta.url)));
const state = mkdtempSync(join(tmpdir(), "rqm-host-free-"));
const client = new Client({ name: "rqm-host-free-probe", version: "0.1.0" });
try {
  await client.connect(
    new StdioClientTransport({
      command: process.execPath,
      args: [join(repository, "dist/host-mcp.js")],
      env: { PATH: process.env.PATH ?? "", RQM_HOST_RECOVERY_DIR: state },
      stderr: "pipe",
    }),
  );
  const tools = await client.listTools();
  const checked = await client.callTool({
    name: "check_multichannel",
    arguments: {},
  });
  const prepared = await client.callTool({
    name: "prepare_multichannel_purchase",
    arguments: {
      purchaseId: randomUUID(),
      input: JSON.parse(
        readFileSync(
          join(repository, "fixtures/multichannel-input.json"),
          "utf8",
        ),
      ),
      maximum: "0.007000",
    },
  });
  if (checked.isError || prepared.isError)
    throw new Error("Free host probe incomplete");
  console.log(
    JSON.stringify(
      {
        tools: tools.tools.length,
        check: checked.structuredContent,
        prepared:
          prepared.structuredContent?.status === "awaiting_confirmation",
        total: prepared.structuredContent?.total,
        walletConfigured: false,
        paymentSubmissions: 0,
      },
      null,
      2,
    ),
  );
} catch {
  console.error(
    "Free host probe incomplete. No payment authorized or submitted.",
  );
  process.exitCode = 1;
} finally {
  await client.close();
  rmSync(state, { recursive: true, force: true });
}
