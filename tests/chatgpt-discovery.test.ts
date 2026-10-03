import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";
const root = resolve(import.meta.dirname, "..");
const json = (path: string) => JSON.parse(readFileSync(resolve(root, path), "utf8"));
const brands = { quantum: "resonant-quantum-mechanics", wave: "waveengine", robotics: "robotics-lab" } as const;
const fixtures = json("tests/fixtures/chatgpt-discovery.json");
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
      expect(createHash("sha256").update(readFileSync(resolve(root,path))).digest("hex"),path).toBe(digest);
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
  it("preserves all 63 host package files from PR22 byte for byte", () => {
    const baseline = json("tests/fixtures/chatgpt-protected-hosts.json");
    for (const [path, digest] of Object.entries(baseline.files)) {
      expect(createHash("sha256").update(readFileSync(resolve(root,path))).digest("hex"),path).toBe(digest);
    }
    // Catch added host files as well as modified or deleted files.
    const directories = ["connectors/plugins", "connectors/claude-desktop", "connectors/cursor", ".cursor-plugin"];
    const walk = (directory: string): string[] => readdirSync(resolve(root,directory), {withFileTypes:true}).flatMap(entry => entry.isDirectory() ? walk(`${directory}/${entry.name}`) : [`${directory}/${entry.name}`]);
    for (const directory of directories) {
      const actual = walk(directory).filter(path => !path.includes("/dist/") && !path.includes("/node_modules/"));
      expect(actual.sort()).toEqual(Object.keys(baseline.files).filter(path => path.startsWith(directory+"/")).sort());
    }
  });
});
