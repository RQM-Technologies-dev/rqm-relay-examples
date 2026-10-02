import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { lstat, readFile, readdir, writeFile, rename, rm } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { zipSync } from "fflate";

export const bundleFiles = ["PRIVACY.md", "THIRD_PARTY_NOTICES.txt", "manifest.json", "package.json", "server/index.mjs"];
const schemaBytes = await readFile(new URL("./vendor/mcpb-manifest-v0.3.schema.json", import.meta.url));
assert.equal(createHash("sha256").update(schemaBytes).digest("hex"), "3a0ac9d845711a1b9b17dfa5a52f8b60628239d6a86a9db417206a9efc78592d", "Official schema changed; review and update its provenance first");
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(JSON.parse(schemaBytes));

export function validateManifest(manifest) {
  assert(validate(manifest), `Invalid MCPB 0.3 manifest: ${ajv.errorsText(validate.errors)}`);
  assert.equal(manifest.manifest_version, "0.3");
  assert.equal(manifest.name, "rqm-jobs-discovery");
  assert.deepEqual(manifest.server, {
    type: "node", entry_point: "server/index.mjs",
    mcp_config: { command: "node", args: ["${__dirname}/server/index.mjs"] },
  }, "Discovery bundle must use the fixed local entry point without environment or command overrides");
  assert.equal(manifest.user_config, undefined, "Discovery bundle has no credential/user configuration");
  assert.equal(manifest.icon, undefined, "Additional assets need an explicit packaging review");
  assert.equal(manifest.icons, undefined, "Additional assets need an explicit packaging review");
}

export async function createUnsignedBundle(directory) {
  // Only our generated output is accepted. Never read/import an external bundle,
  // certificate, signature, user-selected path or recursively selected extra file.
  const files = {};
  const visited = [];
  const walk = async (relative) => {
    const absolute = join(directory, relative);
    const info = await lstat(absolute);
    assert(!info.isSymbolicLink(), `Symlink is forbidden: ${relative || "."}`);
    if (info.isDirectory()) {
      assert(relative === "" || relative === "server", `Unexpected directory: ${relative}`);
      for (const child of (await readdir(absolute)).sort()) await walk(relative ? `${relative}/${child}` : child);
    } else {
      assert(info.isFile() && bundleFiles.includes(relative), `Unexpected bundle file: ${relative}`);
      assert(info.size > 0 && info.size <= 16 * 1024 * 1024, `Invalid bundle file size: ${relative}`);
      const bytes = await readFile(absolute);
      visited.push(relative);
      files[relative] = [bytes, { os: 3, attrs: 0o644 << 16 }];
    }
  };
  await walk("");
  assert.deepEqual(visited.sort(), [...bundleFiles].sort(), "Missing required bundle file");
  validateManifest(JSON.parse(files["manifest.json"][0]));
  assert.deepEqual(JSON.parse(files["package.json"][0]), { type: "module", private: true });
  return zipSync(files, { level: 9, mtime: new Date("2020-01-01T00:00:00Z") });
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  assert(process.argv.length === 2 || (process.argv.length === 3 && process.argv[2] === "--validate"), "No external input or signing arguments supported");
  const archive = await createUnsignedBundle("dist");
  if (process.argv[2] !== "--validate") {
    const temporary = `rqm-jobs-discovery.${randomUUID()}.tmp`;
    try {
      await writeFile(temporary, archive, { flag: "wx" });
      await rename(temporary, "rqm-jobs-discovery.mcpb");
    } finally {
      await rm(temporary, { force: true });
    }
  }
  console.log(JSON.stringify({ file: "rqm-jobs-discovery.mcpb", signature: "unsigned", validationOnly: process.argv[2] === "--validate", sha256: createHash("sha256").update(archive).digest("hex"), files: bundleFiles }));
}
