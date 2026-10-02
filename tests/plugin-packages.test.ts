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
      for (const component of [manifest.mcpServers, manifest.skills, ...(manifest.logo ? [manifest.logo] : [])]) {
        const target = resolve(root, base, component);
        expect(relative(resolve(root, base), target).startsWith("..")).toBe(false);
        expect(existsSync(target)).toBe(true);
      }
    }
    const config = json(`${base}/mcp.json`);
    const product = name === "waveengine" ? "wave" : name === "robotics-lab" ? "robotics" : "quantum";
    const endpoint = `https://jobs.rqmtechnologies.com/mcp/plugins/${product}`;
    expect(Object.keys(config.mcpServers)).toEqual([name]);
    expect(config.mcpServers[name].url).toBe(endpoint);
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
    expect(read(`${base}/skills/${name}/SKILL.md`)).toBe(read(`connectors/plugins/${name}/skills/${name}/SKILL.md`));
    expect(read(`${base}/README.md`)).toContain("not a registered ChatGPT app");
    expect(existsSync(resolve(root, base, ".app.json"))).toBe(false);
  });
});
