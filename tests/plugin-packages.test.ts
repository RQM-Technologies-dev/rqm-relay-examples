import { createHash } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { resolve, relative } from "node:path";
import { describe, it, expect } from "vitest";
const root = resolve(import.meta.dirname, "..");
const read = (path: string) => readFileSync(resolve(root, path), "utf8");
const json = (path: string) => JSON.parse(read(path));
const brands = ["resonant-quantum-mechanics", "waveengine", "robotics-lab"];
describe("portable product package release", () => {
  it("retains the existing Cursor plugin and resolves every new marketplace source", () => {
    const entries = json(".cursor-plugin/marketplace.json").plugins;
    expect(entries.some((entry: {name: string}) => entry.name === "rqm-jobs")).toBe(true);
    expect(entries.some((entry: {name: string}) => entry.name === "robotics-lab")).toBe(true);
    expect(new Set(entries.map((entry: {name: string}) => entry.name)).size).toBe(entries.length);
    for (const name of brands) {
      const entry = entries.find((entry: {name: string}) => entry.name === name);
      expect(entry.source).toBe(`connectors/plugins/${name}`);
      expect(existsSync(resolve(root, entry.source, ".cursor-plugin/plugin.json"))).toBe(true);
    }
  });
  it.each(brands)("%s packages both hosts with valid local assets and a credential-free discovery connection", (name) => {
    const base = `connectors/plugins/${name}`;
    const cursor = json(`${base}/.cursor-plugin/plugin.json`);
    const claude = json(`${base}/.claude-plugin/plugin.json`);
    expect(cursor.name).toBe(name); expect(claude.name).toBe(name);
    expect(cursor.license).toBe("Apache-2.0"); expect(claude.license).toBe("Apache-2.0");
    for (const manifest of [cursor, claude]) {
      for (const component of [manifest.mcpServers, manifest.skills, ...(manifest.logo ? [manifest.logo] : []), ...(manifest.icon ? [manifest.icon] : [])]) {
        const target = resolve(root, base, component);
        expect(relative(resolve(root, base), target).startsWith("..")).toBe(false);
        expect(existsSync(target)).toBe(true);
      }
    }
    const config = json(`${base}/mcp.json`);
    const product = name === "waveengine" ? "wave" : name === "robotics-lab" ? "robotics" : "quantum";
    const endpoint = `https://jobs.rqmtechnologies.com/mcp/plugins/${product}`;
    expect(Object.keys(config.mcpServers)).toEqual([name]);
    expect(config.mcpServers[name].url).toBe(product === "quantum" ? `${endpoint}/cursor` : endpoint);
    expect(config.mcpServers[name].auth.CLIENT_ID).toBe(`rqm-cursor-${product}`);
    expect(config.mcpServers[name].auth.CLIENT_SECRET).toBeUndefined();
    expect(json(`${base}/.mcp.json`).mcpServers[name]).toEqual({type:"http",url:endpoint});
    expect(read(`${base}/LICENSE`)).toContain("Apache License");
    expect(read(`${base}/NOTICE`)).toContain("this plugin folder only");
    const listing = json(`${base}/listing.json`);
    const skill = read(`${base}/skills/${name}/SKILL.md`);
    expect(skill).toContain(`product: ${listing.product}`);
    expect(skill).not.toContain("run_buyer_job");
    expect(read(`${base}/README.md`).split(/\s+/).length).toBeGreaterThan(40);
  });
});

describe("ChatGPT portable candidates", () => {
  it.each(brands)("%s has a distinct credential-free prepaid audience and matching skill", (name) => {
    const base = `connectors/chatgpt/${name}`;
    const product = name === "waveengine" ? "wave" : name === "robotics-lab" ? "robotics" : "quantum";
    expect(json(`${base}/plugin.json`).name).toBe(name);
    expect(json(`${base}/mcp.json`).mcpServers).toEqual({[name]: {type:"streamable-http",url:`https://jobs.rqmtechnologies.com/mcp/plugins/${product}`}});
    const skill = read(`${base}/skills/${name}/SKILL.md`);
    expect(skill).toContain(`product: ${product}`);
    expect(skill).toContain(`name: ${name}`);
    expect(skill).toContain("returned buyer `service_id`");
    expect(read(`${base}/README.md`)).toContain("not a registered ChatGPT app");
    expect(existsSync(resolve(root, base, ".app.json"))).toBe(false);
  });
});


describe("approved Robotics branding", () => {
  it("keeps the three host references on identical approved PNG bytes", () => {
    const filename = "robotics-d94a234335751083.png";
    const local = `assets/${filename}`;
    const remote = `https://jobs.rqmtechnologies.com/assets/branding/${filename}`;
    const plugin = "connectors/plugins/robotics-lab";
    const chatgpt = "connectors/chatgpt/robotics-lab";
    expect(json(`${plugin}/.cursor-plugin/plugin.json`).logo).toBe(`./${local}`);
    expect(json(`${plugin}/.claude-plugin/plugin.json`).icon).toBe(`./${local}`);
    expect(json(`${chatgpt}/plugin.json`).extensions["com.rqmtechnologies.branding"]).toEqual({icon:local,iconUrl:remote});
    expect(json(`${plugin}/listing.json`).icon_url).toBe(remote);
    for (const base of [plugin,chatgpt]) {
      const bytes = readFileSync(resolve(root,base,local));
      expect(createHash("sha256").update(bytes).digest("hex")).toBe("d94a23433575108391242b81d9a494e9aa1c4dbfc13e10ac36f0e3df20f1fa88");
      expect(bytes.subarray(0,8).toString("hex")).toBe("89504e470d0a1a0a");
      expect(bytes.readUInt32BE(16)).toBe(1254);
      expect(bytes.readUInt32BE(20)).toBe(1254);
    }
  });
});

describe('Quantum 0.3.3 review boundaries', () => {
  it('aligns package versions, named execution and honest Cloud status', () => {
    const base = 'connectors/plugins/resonant-quantum-mechanics';
    for (const file of ['.cursor-plugin/plugin.json', 'listing.json'])
      expect(json(`${base}/${file}`).version).toBe('0.3.3');
    const guide = read(`${base}/README.md`);
    expect(guide).toContain('52 tools');
    expect(guide).toContain('20 named');
    expect(guide).toContain('actual Cursor web Chat');
    expect(guide).toContain('fresh-account onboarding');
    expect(guide).toContain('receipt remains unconfirmed');
    expect(guide).toContain('connector for free');
    const reviewer = read(`${base}/REVIEWER.md`);
    expect(reviewer).toContain('quantum_openqasm3_preflight_v1');
    expect(reviewer).not.toContain('"capability_id"');
    expect(reviewer).not.toContain('`run_account_job`');
  });
});

 describe('Claude 0.3.1 conditional hardware guidance', () => {
  it('keeps Claude and Cursor routing and versions separate', () => {
    const base = 'connectors/plugins/resonant-quantum-mechanics';
    const claude = json(`${base}/.claude-plugin/plugin.json`);
    expect(claude.version).toBe('0.3.1');
    expect(claude.mcpServers).toBe('./.mcp.json');
    expect(claude.skills).toBe('./skills/');
    expect(json(`${base}/.cursor-plugin/plugin.json`).version).toBe('0.3.3');
    expect(json(`${base}/.cursor-plugin/plugin.json`).skills).toBe('./cursor-skills/');
    const skill = read(`${base}/skills/resonant-quantum-mechanics/SKILL.md`);
    for (const boundary of ['34 base tools', '23 conditional', 'positive available balance',
      'explicit approval', 'Emerald renewal was failing', 'original idempotency',
      'settle the original approved charge exactly once']) expect(skill).toContain(boundary);
    expect(skill).not.toContain('/account/credits');
    expect(skill).not.toContain('Current CLI discovery reports 52');
  });
});
