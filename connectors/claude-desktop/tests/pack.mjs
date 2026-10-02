import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, mkdir, readFile, writeFile, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { unzipSync } from "fflate";
import { bundleFiles, createUnsignedBundle, validateManifest } from "../pack.mjs";
const original = JSON.parse(await readFile(new URL("../manifest.json", import.meta.url)));
async function fixture(action) {
  const dir = await mkdtemp(join(tmpdir(), "rqm-pack-test-"));
  try {
    await mkdir(join(dir, "server"));
    for (const name of bundleFiles) await writeFile(join(dir, name), name === "manifest.json" ? JSON.stringify(original) : name === "package.json" ? JSON.stringify({ type: "module", private: true }) : "test-only fixture");
    await action(dir);
  } finally { await rm(dir, { recursive: true, force: true }); }
}
test("unsigned ZIP has exactly the required portable paths and stable bytes", async () => fixture(async (dir) => {
  const first = await createUnsignedBundle(dir);
  assert.deepEqual(first, await createUnsignedBundle(dir));
  const entries = unzipSync(first);
  assert.deepEqual(Object.keys(entries).sort(), [...bundleFiles].sort());
  assert.deepEqual(JSON.parse(Buffer.from(entries["manifest.json"]).toString()), original);
  for (const name of bundleFiles) assert.deepEqual(Buffer.from(entries[name]), await readFile(join(dir, name)));
  // ZIP ends exactly at its central-directory terminator; no signature trailer.
  assert.equal(Buffer.from(first).readUInt32LE(first.length - 22), 0x06054b50);
}));
test("invalid schema, unsupported version, credentials and alternate launch commands fail closed", () => {
  for (const mutate of [
    (m) => { delete m.description; },
    (m) => { m.manifest_version = "0.2"; },
    (m) => { m.server.mcp_config.command = "sh"; },
    (m) => { m.server.mcp_config.args = ["-c", "untrusted"]; },
    (m) => { m.server.mcp_config.env = { TOKEN: "fixture" }; },
    (m) => { m.server.entry_point = "../outside.mjs"; },
    (m) => { m.user_config = {}; },
    (m) => { m.icon = "icon.png"; },
    (m) => { m.unrecognized = true; },
  ]) { const manifest = structuredClone(original); mutate(manifest); assert.throws(() => validateManifest(manifest)); }
});
test("unexpected files and directories cannot enter the bundle", async () => {
  for (const name of [".env", "receipt.json", "server/extra.mjs", "signature.pem"]) await fixture(async (dir) => {
    await writeFile(join(dir, name), "fixture"); await assert.rejects(createUnsignedBundle(dir), /Unexpected bundle file/);
  });
  await fixture(async (dir) => { await mkdir(join(dir, "nested")); await assert.rejects(createUnsignedBundle(dir), /Unexpected directory/); });
});
test("missing, malformed and oversized artifacts fail closed", async () => {
  await fixture(async (dir) => { await rm(join(dir, "PRIVACY.md")); await assert.rejects(createUnsignedBundle(dir), /Missing required/); });
  await fixture(async (dir) => { await writeFile(join(dir, "manifest.json"), "{"); await assert.rejects(createUnsignedBundle(dir), SyntaxError); });
  await fixture(async (dir) => { await writeFile(join(dir, "package.json"), '{"type":"module","scripts":{"install":"anything"}}'); await assert.rejects(createUnsignedBundle(dir)); });
  await fixture(async (dir) => { await writeFile(join(dir, "server/index.mjs"), Buffer.alloc(16 * 1024 * 1024 + 1)); await assert.rejects(createUnsignedBundle(dir), /Invalid bundle file size/); });
});
test("file, directory and root symlinks are rejected", async () => {
  await fixture(async (dir) => {
    await rm(join(dir, "PRIVACY.md")); await symlink(join(dir, "manifest.json"), join(dir, "PRIVACY.md")); await assert.rejects(createUnsignedBundle(dir), /Symlink/);
  });
  await fixture(async (dir) => {
    await rm(join(dir, "server"), { recursive: true }); await symlink(dir, join(dir, "server"), "dir"); await assert.rejects(createUnsignedBundle(dir), /Symlink/);
  });
  await fixture(async (dir) => {
    const link = `${dir}-link`;
    try { await symlink(dir, link, "dir"); await assert.rejects(createUnsignedBundle(link), /Symlink/); } finally { await rm(link, { force: true }); }
  });
});
