import {
  Client,
  StreamableHTTPClientTransport,
} from "@modelcontextprotocol/client";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createDiscoveryProxy } from "./proxy.mjs";

// Pin the currently deployed remote protocol; desktop clients negotiate locally.
// No environment keys, files, wallet libraries, or configurable remote URL.
const remote = new Client(
  { name: "rqm-jobs-desktop-discovery", version: "0.1.0" },
  {
    versionNegotiation: { mode: { pin: "2026-07-28" } },
  },
);
const transport = new StreamableHTTPClientTransport(
  new URL("https://jobs.rqmtechnologies.com/mcp/waveengine"),
  {
    fetch: (url, init) =>
      fetch(url, {
        ...init,
        redirect: "error",
        signal: AbortSignal.any([
          ...(init?.signal ? [init.signal] : []),
          AbortSignal.timeout(20000),
        ]),
      }),
  },
);
let local;
const close = async () => {
  await local?.close();
  await remote.close();
};
process.on("SIGINT", () => {
  void close();
});
process.on("SIGTERM", () => {
  void close();
});
try {
  await remote.connect(transport);
  local = createDiscoveryProxy(remote);
  local.onclose = () => {
    void remote.close();
  };
  await local.connect(new StdioServerTransport());
} catch {
  process.stderr.write(
    "RQM discovery connection failed. No payment was submitted.\n",
  );
  await close();
  process.exitCode = 1;
}
