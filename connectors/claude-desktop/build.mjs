import { build } from "esbuild";
import {
  mkdir,
  copyFile,
  writeFile,
  readFile,
  readdir,
} from "node:fs/promises";
await mkdir("dist/server", { recursive: true });
const built = await build({
  entryPoints: ["src/index.mjs"],
  outfile: "dist/server/index.mjs",
  bundle: true,
  platform: "node",
  target: "node22",
  format: "esm",
  metafile: true,
  banner: {
    js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);",
  },
});
await copyFile("manifest.json", "dist/manifest.json");
await copyFile("PRIVACY.md", "dist/PRIVACY.md");
await writeFile(
  "dist/package.json",
  JSON.stringify({ type: "module", private: true }),
);
const packages = new Set(
  Object.keys(built.metafile.inputs).flatMap((file) => {
    const match = file.match(/^(.*node_modules\/(?:@[^/]+\/)?[^/]+)/);
    return match ? [match[1]] : [];
  }),
);
const notices = [];
for (const directory of [...packages].sort()) {
  const pkg = JSON.parse(await readFile(`${directory}/package.json`, "utf8"));
  const licenses = (await readdir(directory)).filter((file) =>
    /^(license|copying|notice)(\.|$)/i.test(file),
  );
  if (!licenses.length)
    throw new Error(`Missing license notice for bundled ${pkg.name}`);
  notices.push(`# ${pkg.name} ${pkg.version}\n`);
  for (const file of licenses)
    notices.push(await readFile(`${directory}/${file}`, "utf8"));
}
await writeFile("dist/THIRD_PARTY_NOTICES.txt", notices.join("\n\n"));
