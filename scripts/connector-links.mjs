import { readFile } from "node:fs/promises";
const config = JSON.parse(
  await readFile(new URL("../connectors/cursor/mcp.json", import.meta.url)),
);
for (const [name, server] of Object.entries(config.mcpServers)) {
  const params = new URLSearchParams({
    name,
    config: Buffer.from(JSON.stringify(server)).toString("base64"),
  });
  console.log(`https://cursor.com/en/install-mcp?${params}`);
  console.log(`cursor://anysphere.cursor-deeplink/mcp/install?${params}`);
}
