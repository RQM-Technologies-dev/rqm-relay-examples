import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";
const root = resolve(import.meta.dirname, "..");
const json = (path: string) => JSON.parse(readFileSync(resolve(root, path), "utf8"));
const brands = { quantum: "resonant-quantum-mechanics", wave: "waveengine", robotics: "robotics-lab" } as const;
const fixtures = json("tests/fixtures/chatgpt-discovery.json");
// Reviewed Wave instruction-only correction for Jobs PR191's named surface.
// Keep the historical baseline and all other products, auth and assets exact.
const waveInstructionUpdates: Record<string, string> = {
  "connectors/chatgpt/waveengine/PRIVACY.md": "81aa11cf46d64dabaf36692f1f3bbf70f52ae04d753336267605f2fe76019a34",
  "connectors/plugins/waveengine/PRIVACY.md": "75471cceb3e9fc39c0513662121b2b44df8cf8ad244896872945e175839a882b",
  "connectors/plugins/waveengine/README.md": "7296ae8e4b3e943a868f5c765bba5689fe9d999ce581bb018ac8a56954f70be4",
  "connectors/plugins/waveengine/REVIEWER.md": "b868f3baa988523c03107c2321cfa24542c4eda8c5eff44c3a6718ba8ce49a29",
  "connectors/plugins/waveengine/skills/waveengine/SKILL.md": "be1dbfaab9f5c6486abad86e170584a4ea7870d41ec2de3a40cd4ba7d23c4d68",
};
// Cursor 0.3.3 discovery guidance; Claude configuration, manifests and assets stay pinned.
const quantumInstructionUpdates: Record<string, string> = {
  "connectors/plugins/resonant-quantum-mechanics/.cursor-plugin/plugin.json": "883ff7bd27a188912757530ac03d2ae01f734b4075ba77ec9ae1582951f83a50",
  "connectors/plugins/resonant-quantum-mechanics/listing.json": "2179db71efa820c4bcb2bcf3ca30a942180bd1d6dd5ec8c9710587423e82bb20",
  "connectors/plugins/resonant-quantum-mechanics/PRIVACY.md": "96f89d938cdc2f6ce7345972422d7ccf8ce4283a89304bb5f78c5ba46694225a",
  "connectors/plugins/resonant-quantum-mechanics/README.md": "b244d81f9da39d1fbd43f5685ee02a0af1d72e869ebba39fc422719827c323c3",
  "connectors/plugins/resonant-quantum-mechanics/REVIEWER.md": "66467fd05744fa4e92435f293c35f4995f19b10b3ded98de89f3d5ec5df20fbc",
  "connectors/plugins/resonant-quantum-mechanics/skills/resonant-quantum-mechanics/SKILL.md": "33c616b7c03865692f0f80c2a37e3c40d218460c36e32c7c0705461fd6d9e999",
  "connectors/plugins/resonant-quantum-mechanics/OPERATIONS.md": "fbd96310f47455baabc6c39901f8292d6674202dda5e598967c37a3bf7d28bce",
  "connectors/plugins/resonant-quantum-mechanics/mcp.json": "bdedfe1e851bf1d7c92644ea618562fcaf810500f9124cc97df362ba3bfe587a"
};
describe("ChatGPT discovery contract proposals", () => {
  it("maps nine coordinated flagship contracts without presenting host evaluation results", () => {
    expect(fixtures.status).toBe("proposed_host_evaluations_not_run");
    expect(fixtures.observed_host_results).toEqual([]);
    expect(fixtures.flagships).toHaveLength(9);
    const ids = new Set(fixtures.cases.map((entry: {id: string}) => entry.id));
    expect(ids.size).toBe(fixtures.cases.length);
    for (const product of Object.keys(brands)) {
      expect(fixtures.flagships.filter((entry: {product: string}) => entry.product === product)).toHaveLength(3);
    }
    for (const flagship of fixtures.flagships) {
      expect(flagship.accepted_formats.length).toBeGreaterThan(0);
      expect(flagship.claim_boundary.length).toBeGreaterThan(0);
      for (const id of flagship.jobs_fixture_ids) expect(ids.has(id)).toBe(true);
      const cases = fixtures.cases.filter((entry: {id: string}) => flagship.jobs_fixture_ids.includes(entry.id));
      expect(cases.some((entry: {kind: string}) => entry.kind === "positive")).toBe(true);
      expect(cases.some((entry: {kind: string}) => entry.kind === "negative")).toBe(true);
      expect(cases.some((entry: {kind: string}) => entry.kind === "missing_input")).toBe(true);
    }
    for (const entry of fixtures.cases) {
      expect(entry.query).not.toMatch(/RQM|WaveEngine|Robotics Lab/i);
      if (entry.kind === "negative" || entry.kind === "irrelevant") {
        expect(entry.expected_service_id).toBeNull();
        expect(entry.expected_action).toBe("abstain_from_execution");
      } else {
        expect(fixtures.flagships.some((flagship: {service_id: string; product: string}) => flagship.service_id === entry.expected_service_id && flagship.product === entry.expected_product)).toBe(true);
      }
    }
  });
  it("maps every starter prompt to source-supported buyer service IDs", () => {
    for (const brand of Object.values(brands)) {
      const manifest = json(`connectors/chatgpt/${brand}/plugin.json`);
      const prompts = manifest.extensions["com.openai"].interface.defaultPrompt;
      expect(prompts).toHaveLength(3);
      expect(prompts).toEqual(fixtures.default_prompts[brand]);
      expect(fixtures.default_prompt_service_ids[brand]).toHaveLength(prompts.length);
      for (const ids of fixtures.default_prompt_service_ids[brand]) {
        expect(ids.length).toBeGreaterThan(0);
        for (const id of ids) expect(fixtures.starter_contracts.some((contract: {service_id: string}) => contract.service_id === id)).toBe(true);
      }
    }
  });
});
describe("Claude and Cursor non-regression", () => {
  it("preserves ChatGPT identities, OAuth configuration, artwork and legal notices", () => {
    const baseline = json("tests/fixtures/chatgpt-protected-hosts.json");
    for (const [path, digest] of Object.entries(baseline.chatgpt_files)) {
      expect(createHash("sha256").update(readFileSync(resolve(root,path))).digest("hex"),path).toBe(waveInstructionUpdates[path] ?? digest);
    }
    for (const brand of Object.values(brands)) {
      const manifest = json(`connectors/chatgpt/${brand}/plugin.json`);
      delete manifest.version; delete manifest.description;
      const openai = manifest.extensions["com.openai"];
      delete openai.review; delete openai.publication; delete openai.onboardingSkill;
      for (const field of ["shortDescription", "longDescription", "defaultPrompt"]) delete openai.interface[field];
      expect(manifest).toEqual(baseline.chatgpt_metadata[brand]);
    }
  });
  it("preserves protected host files with pinned security and Wave instruction updates", () => {
    const baseline = json("tests/fixtures/chatgpt-protected-hosts.json");
    // Cursor release security review fixes SDK/client transport advisories in the
    // independent desktop lock. Keep PR22's baseline intact and pin only the
    // two reviewed dependency-file hashes; all manifests/auth/source stay exact.
    const securityUpdates: Record<string, string> = {
      "connectors/claude-desktop/package.json": "9920058c315e1eb8faf383ee64e633c3e70ac1a643dd32464be6413aa651867f",
      "connectors/claude-desktop/package-lock.json": "1a7039303ee523ea7701b0d8b09dd5a30cf315feab0ac4c57974f3c2d5ae44eb",
    };
    expect(Object.keys(securityUpdates).sort()).toEqual([
      "connectors/claude-desktop/package-lock.json",
      "connectors/claude-desktop/package.json",
    ]);
    for (const [path, digest] of Object.entries(baseline.files)) {
      expect(createHash("sha256").update(readFileSync(resolve(root,path))).digest("hex"),path).toBe(securityUpdates[path] ?? quantumInstructionUpdates[path] ?? waveInstructionUpdates[path] ?? digest);
    }
    // Catch added host files as well as modified or deleted files.
    const directories = ["connectors/plugins", "connectors/claude-desktop", "connectors/cursor", ".cursor-plugin"];
    const walk = (directory: string): string[] => readdirSync(resolve(root,directory), {withFileTypes:true}).flatMap(entry => entry.isDirectory() ? walk(`${directory}/${entry.name}`) : [`${directory}/${entry.name}`]);
    for (const directory of directories) {
      const actual = walk(directory).filter(path => !path.includes("/dist/") && !path.includes("/node_modules/"));
      expect(actual.sort()).toEqual([...Object.keys(baseline.files), "connectors/plugins/resonant-quantum-mechanics/OPERATIONS.md", "connectors/plugins/resonant-quantum-mechanics/cursor-skills/resonant-quantum-mechanics/SKILL.md"].filter(path => path.startsWith(directory+"/")).sort());
    }
  });
});
