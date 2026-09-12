import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Local paths and executable only. Never serialize process.env into a connector.
const repository = dirname(dirname(fileURLToPath(import.meta.url)));
const server = {
  command: process.execPath,
  args: [join(repository, "dist/host-mcp.js")],
};
const params = new URLSearchParams({
  name: "rqm-local-buyer",
  config: Buffer.from(JSON.stringify(server)).toString("base64"),
});
console.log(`Cursor: https://cursor.com/en/install-mcp?${params}`);
console.log("Local MCP configuration (no credentials):");
console.log(
  JSON.stringify({ mcpServers: { "rqm-local-buyer": server } }, null, 2),
);
